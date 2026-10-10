# Estimateur Objet — API Cloudflare gratuite

Cette version utilise Cloudflare Workers AI pour analyser une photo. Elle ne nécessite pas de clé Gemini. Cloudflare annonce un quota gratuit de **10 000 Neurons par jour** pour Workers AI ; les quotas et modèles disponibles peuvent changer. Consulte les [tarifs officiels](https://developers.cloudflare.com/workers-ai/platform/pricing/).

**Important :** cette version ne dispose pas d'une API Google Search intégrée. Elle produit une fourchette indicative à partir de l'analyse IA et propose des liens de recherche Google, Leboncoin et eBay pour vérifier les annonces en cours. Les prix affichés dans les annonces ne sont pas forcément les prix de vente conclus.

## Déploiement depuis ton téléphone ou ordinateur

1. Connecte-toi à [Cloudflare](https://dash.cloudflare.com/).
2. Ouvre **Workers & Pages**, puis crée un Worker.
3. Ouvre le fichier `worker.js` de ce dépôt : [voir le code](https://github.com/mansstyle59/estimateur-objet/blob/main/worker.js). Copie tout son contenu.
4. Dans l'éditeur de code Cloudflare, remplace le code de démarrage par le code copié, puis enregistre et déploie.
5. Dans les paramètres du Worker, ouvre **Bindings** (ou **Settings → Bindings**) et ajoute un binding **Workers AI** nommé exactement `AI`. Redéploie si Cloudflare le demande.
6. Copie l'adresse publique du Worker, par exemple `https://estimateur-objet-api.<ton-compte>.workers.dev`.
7. Dans GitHub, ouvre [config.js](https://github.com/mansstyle59/estimateur-objet/blob/main/config.js), appuie sur le crayon, puis remplace la ligne vide par l'adresse réelle :
   `window.ESTIMATEUR_API_URL = "https://TON-WORKER.workers.dev";`
   Remplace l'exemple par ta vraie adresse, sans ajouter `/api/analyze`.
8. Enregistre la modification et attends que GitHub Pages se mette à jour.
9. Ouvre [Estimateur Objet](https://mansstyle59.github.io/estimateur-objet/) et teste une photo nette.

Le Worker accepte les appels uniquement depuis `https://mansstyle59.github.io`. Ne mets aucun jeton secret dans `worker.js`, `config.js` ou dans le dépôt GitHub.

## Déploiement avec Wrangler (facultatif)

Depuis un terminal avec Wrangler connecté à ton compte Cloudflare :
```bash
npx wrangler deploy
```
Le fichier `wrangler.toml` déclare le binding AI.

## Limites

- Une connexion Internet est nécessaire.
- L'estimation IA est indicative et peut être imprécise.
- Les liens de recherche ouvrent des résultats actuels, mais l'application ne lit pas automatiquement les prix de ces pages.
- Vérifie les annonces comparables, l'état, la marque, les dimensions et les frais avant d'acheter.
- Le quota gratuit est limité et peut évoluer.
