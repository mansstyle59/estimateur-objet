const ALLOWED_ORIGIN = "https://mansstyle59.github.io";
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const recentRequests = new Map();

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  if (origin && origin !== ALLOWED_ORIGIN) return res.status(403).json({ error: "Origine non autorisée." });
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (recentRequests.get(ip) || []).filter(ts => now - ts < 60_000);
  if (recent.length >= 8) return res.status(429).json({ error: "Limite temporaire atteinte : maximum 8 analyses par minute depuis cette adresse. Réessaie dans un instant." });
  recent.push(now); recentRequests.set(ip, recent);
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "Le serveur n’est pas configuré : ajoute GEMINI_API_KEY comme variable secrète dans Vercel." });

  try {
    const body = req.body || {};
    if (typeof body.image !== "string") return res.status(400).json({ error: "Photo manquante." });
    const match = body.image.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return res.status(400).json({ error: "Format photo non pris en charge. Utilise JPEG, PNG, WEBP ou GIF." });
    const mimeType = match[1], base64 = match[2];
    if (Buffer.byteLength(base64, "base64") > MAX_IMAGE_BYTES) return res.status(413).json({ error: "Photo trop volumineuse. Choisis une image de 5 Mo maximum." });
    const title = String(body.title || "").slice(0, 160);
    const category = String(body.category || "").slice(0, 40);
    const details = String(body.details || "").slice(0, 300);
    const prompt = "Tu es un expert français en achat-revente d'occasion. Analyse l'image et effectue aussi une recherche Google pour trouver des objets réellement comparables disponibles en France. Priorise même marque/modèle, dimensions, matériau, état et époque proches. Ne confonds pas le prix demandé avec le prix réellement vendu. Si tu ne trouves pas assez de comparables fiables, renvoie null pour les prix. Retourne uniquement un objet JSON valide avec : title (nom court), category (meuble, outil, electronique, collection, mode, jardin, jouet ou autre), details (caractéristiques visibles et incertitudes), condition (excellent, bon, moyen, mauvais), renovation (conseil prudent), renovationType (none, clean, paint, repair, custom), observations (tableau de chaînes), confidence (faible, moyenne, élevée), estimatedResaleLow (nombre en euros ou null), estimatedResaleHigh (nombre en euros ou null), priceBasis (explication courte de la méthode et du type de prix trouvé), comparables (tableau d'objets avec title, price (nombre en euros ou null), condition, url, source), priceDisclaimer (précise que les annonces donnent généralement des prix demandés et non des ventes confirmées). Ne crée jamais de faux liens ni de prix. N'affirme pas avoir vu un prix si la recherche ne le fournit pas. Données utilisateur : nom=" + title + ", catégorie=" + category + ", détails=" + details + ".";
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + encodeURIComponent(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1400 }
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status === 429 ? 429 : 502).json({ error: response.status === 429 ? "Quota Gemini ou recherche Google atteint. Réessaie plus tard et vérifie les quotas dans Google AI Studio." : "Google Gemini a refusé la demande. Vérifie la clé API et l’accès à la recherche Google." });
    const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
    if (!text) return res.status(502).json({ error: "Gemini n’a pas retourné d’analyse. Réessaie avec une photo plus nette." });
    let analysis;
    try {
      const clean = String(text).replace(/^\\s*```(?:json)?/i, "").replace(/```\\s*$/, "").trim();
      analysis = JSON.parse(clean);
    } catch { return res.status(502).json({ error: "La réponse de Gemini n’était pas exploitable. Réessaie." }); }
    analysis.estimatedResaleLow = Number.isFinite(analysis.estimatedResaleLow) ? analysis.estimatedResaleLow : null;
    analysis.estimatedResaleHigh = Number.isFinite(analysis.estimatedResaleHigh) ? analysis.estimatedResaleHigh : null;
    const grounding = payload.candidates?.[0]?.groundingMetadata;
    const sources = (grounding?.groundingChunks || []).map(x => x.web).filter(x => x && x.uri).map(x => ({ title: String(x.title || x.uri).slice(0, 180), url: x.uri }));
    const sourceMap = new Map(sources.map(x => [x.url, x]));
    for (const item of (Array.isArray(analysis.comparables) ? analysis.comparables : [])) {
      if (item.url && !sourceMap.has(item.url)) sourceMap.set(item.url, { title: String(item.source || item.title || item.url).slice(0,180), url: item.url });
    }
    return res.status(200).json({ analysis, sources: Array.from(sourceMap.values()).slice(0, 8), searchGrounded: sources.length > 0 });
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne pendant l’analyse de la photo." });
  }
};