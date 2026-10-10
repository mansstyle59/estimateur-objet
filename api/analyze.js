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
  if (!key) return res.status(503).json({ error: "Le serveur n’est pas configuré : ajoute GEMINI_API_KEY dans les variables d’environnement Vercel." });

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
    const prompt = "Tu es un assistant d'identification visuelle pour l'achat-revente d'objets d'occasion en France. Analyse uniquement ce qui est visible sur la photo. Ne prétends jamais reconnaître une marque si elle n'est pas lisible. N'invente pas l'âge, le matériau ou l'état caché. Ne donne AUCUN prix ni aucune estimation de marché : une photo seule ne permet pas de confirmer un prix de revente. Retourne uniquement un objet JSON avec ces champs : title (nom descriptif court en français), category (une valeur parmi meuble, outil, electronique, collection, mode, jardin, jouet, autre), details (matière/style/marque/détails visibles, en distinguant les suppositions), condition (une valeur parmi excellent, bon, moyen, mauvais, selon l'apparence seulement), renovation (conseil prudent en français), renovationType (none, clean, paint, repair, custom), observations (liste de chaînes), confidence (faible, moyenne ou élevée), estimatedResaleLow (null), estimatedResaleHigh (null), priceDisclaimer (phrase expliquant que le prix doit être vérifié avec des annonces comparables). Si la photo est floue ou l'objet incertain, le dire clairement. Infos saisies par l'utilisateur : nom=" + title + ', catégorie=' + category + ', détails=' + details + ".";
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + encodeURIComponent(key), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 700 } })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status === 429 ? 429 : 502).json({ error: response.status === 429 ? "Quota IA atteint ou limite de requêtes. Réessaie plus tard ou vérifie les quotas dans Google AI Studio." : "Le service IA a refusé la demande. Vérifie la clé et le modèle dans Google AI Studio." });
    const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
    if (!text) return res.status(502).json({ error: "L’IA n’a pas retourné d’analyse. Réessaie avec une photo plus nette." });
    let analysis;
    try { analysis = JSON.parse(text); } catch { return res.status(502).json({ error: "La réponse IA n’était pas exploitable. Réessaie." }); }
    analysis.estimatedResaleLow = null; analysis.estimatedResaleHigh = null;
    return res.status(200).json({ analysis });
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne pendant l’analyse de la photo." });
  }
};