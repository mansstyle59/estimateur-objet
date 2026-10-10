# Analyse Google et estimation de prix — Estimateur Objet

L'application utilise Google Gemini pour analyser la photo et la fonction officielle Google Search grounding pour rechercher des objets comparables. La clé API doit rester dans les variables d'environnement côté serveur.

## Activer le service

1. Ouvre https://aistudio.google.com/apikey et crée une clé Gemini.
2. Ouvre https://vercel.com/new et importe le dépôt GitHub `mansstyle59/estimateur-objet`.
3. Dans les paramètres Vercel du projet, ajoute `GEMINI_API_KEY` comme variable d'environnement secrète pour Production.
4. Redéploie le projet après avoir ajouté la variable.
5. Copie l'URL du serveur Vercel se terminant par `/api/analyze`.
6. Dans le fichier `config.js` du dépôt, remplace la valeur vide de `window.ESTIMATEUR_API_URL` par cette URL complète, puis enregistre.
7. Après publication GitHub Pages, ouvre https://mansstyle59.github.io/estimateur-objet/ sur le téléphone, ajoute une photo et touche **Analyser avec Google et l’IA**.

## Ce que fait la recherche

- Gemini analyse la photo et utilise Google Search pour rechercher des objets comparables.
- L'application affiche la fourchette estimée si le modèle renvoie des valeurs numériques, ainsi que les liens vers les sources de recherche et les comparables retournés.
- Si les comparables sont insuffisants, les valeurs de marché restent absentes et l'application conserve seulement son repère générique, clairement identifié comme tel.
- Les prix des annonces sont généralement des prix demandés. Ils ne prouvent pas le prix réellement payé lors d'une vente conclue.
- Les résultats de recherche peuvent être incomplets, périmés ou peu comparables. Vérifie marque, modèle, dimensions, état et frais avant d'acheter.

## Quotas et confidentialité

La disponibilité et le coût de Gemini et de Google Search grounding dépendent du modèle, du compte, du niveau d'utilisation et des tarifs en vigueur. Vérifie la page officielle https://ai.google.dev/gemini-api/docs/pricing et https://ai.google.dev/gemini-api/docs/google-search avant usage. Ne suppose pas que la recherche est illimitée ou toujours gratuite. N'active pas de facturation payante si tu veux absolument éviter les frais.

Les photos sont envoyées au service Google pour l'analyse. N'envoie pas d'images contenant des visages, documents ou informations personnelles. Les clés API ne doivent jamais être ajoutées au code HTML, au fichier config.js ou à un commit GitHub.

Le serveur limite les photos à 3 Mo et applique une limitation de requêtes en mémoire, qui reste une protection anti-abus basique. Le code est enregistré dans GitHub, mais le déploiement et une analyse réelle doivent encore être testés après configuration de la clé et de l'URL.
