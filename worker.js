const ALLOWED_ORIGIN = "https://mansstyle59.github.io";
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Vary": "Origin",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    if (origin !== ALLOWED_ORIGIN) return json({ error: "Origine non autorisée." }, 403);
    if (request.method !== "POST") return json({ error: "Utilise une requête POST." }, 405);
    if (!env.AI) return json({ error: "Le service Workers AI n'est pas activé." }, 503);

    try {
      const body = await request.json();
      const image = typeof body.image === "string" ? body.image : "";
      const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) return json({ error: "Photo invalide. Utilise une image JPG, PNG ou WebP." }, 400);
      if (Math.floor(match[2].length * 3 / 4) > MAX_IMAGE_BYTES) {
        return json({ error: "Photo trop lourde : maximum 3 Mo." }, 413);
      }

      const title = String(body.title || "").slice(0, 160);
      const category = String(body.category || "").slice(0, 100);
      const details = String(body.details || "").slice(0, 800);
      const prompt = `Tu es un expert français de meubles et objets d'occasion pour achat-revente.
Analyse uniquement ce que tu peux réellement déduire de la photo et du texte.
Titre saisi: ${title || "non précisé"}
Catégorie saisie: ${category || "non précisée"}
Détails saisis: ${details || "aucun"}
Réponds en français, en JSON strict uniquement, avec ces clés:
"title" (nom précis mais prudent), "category" (une catégorie courte), "details" (description visuelle), "condition" (bon, correct, à rénover ou inconnu), "renovation" (conseil court), "estimatedResaleLow" (nombre entier ou null), "estimatedResaleHigh" (nombre entier ou null), "priceBasis" (explique brièvement les limites), "comparables" (tableau vide).
Pour les prix, donne seulement une fourchette indicative de revente d'occasion en France si l'objet est identifiable avec assez de confiance. Ne prétends pas avoir consulté Google, des annonces actuelles ou des prix de ventes conclues. Si la marque, le modèle, les dimensions ou l'état sont trop incertains, mets les deux prix à null. N'invente pas de marque ni de caractéristiques non visibles.`;

      const result = await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
        messages: [{
          role: "user",
          content: prompt
        }],
        image,
        max_tokens: 700
      });

      const raw = result?.response || result?.choices?.[0]?.message?.content || "";
      const cleaned = String(raw).replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      let analysis;
      try { analysis = JSON.parse(cleaned); }
      catch { return json({ error: "L'IA a répondu dans un format inattendu. Réessaie avec une photo plus nette." }, 502); }

      const query = encodeURIComponent([analysis.title || title, category, "occasion prix"].filter(Boolean).join(" "));
      const sources = [
        { title: "Rechercher des annonces sur Google", url: "https://www.google.com/search?q=" + query },
        { title: "Rechercher sur Leboncoin", url: "https://www.leboncoin.fr/recherche?text=" + encodeURIComponent(analysis.title || title) },
        { title: "Rechercher sur eBay France", url: "https://www.ebay.fr/sch/i.html?_nkw=" + encodeURIComponent(analysis.title || title) }
      ];
      analysis.priceDisclaimer = "Fourchette indicative produite par l'IA, non vérifiée par des ventes conclues. Ouvre les recherches ci-dessous pour comparer les annonces actuelles.";
      return json({ analysis, sources, searchGrounded: false, provider: "Cloudflare Workers AI" });
    } catch (error) {
      return json({ error: "Analyse impossible pour le moment. Vérifie le déploiement Cloudflare et réessaie." }, 502);
    }
  }
};
