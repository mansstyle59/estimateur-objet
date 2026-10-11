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

## Studios créatifs MuAPI (ValorIA)

La branche `feature/valoria-generative-studios` ajoute un espace Studio responsive dans le menu ValorIA : Image, Vidéo, Lip Sync et Cinéma. Le catalogue de modèles et les générations passent par le Worker Cloudflare : la clé MuAPI ne doit jamais être ajoutée au code HTML ou à `config.js`.

### Activer la fonction

1. Ouvre [Cloudflare Dashboard](https://dash.cloudflare.com/) puis Workers & Pages → le Worker `estimateur-objet-api`.
2. Dans **Settings → Variables and Secrets**, ajoute un secret nommé exactement `MUAPI_API_KEY` et colle ta clé MuAPI. Ne colle pas la clé dans GitHub, `worker.js`, `config.js`, une capture d’écran ou le chat.
3. Déploie le Worker en utilisant le `worker.js` de cette branche (copie tout son contenu dans l’éditeur Cloudflare, ou déploie avec Wrangler).
4. Ouvre le [Playground MuAPI](https://muapi.ai/playground) et vérifie le coût et les paramètres du modèle choisi.
5. Teste le site sur une branche de prévisualisation avant de fusionner cette branche vers `main`.

### Ce qui est pris en charge

- Charge le catalogue depuis `GET /api/v1/models` via le Worker et affiche prix/catégorie lorsqu’ils sont fournis par MuAPI.
- Envoie la génération à l’endpoint exact du modèle et interroge ensuite le statut avec son `request_id`.
- Les champs optionnels (URL d’image/vidéo/audio, format et durée) sont transmis pour les modèles compatibles. Tous les modèles n’acceptent pas les mêmes paramètres.
- Les générations vidéo peuvent coûter davantage selon la durée, la résolution et le modèle. Les prix montrés dans l’interface proviennent du catalogue et ne remplacent pas le prix final renvoyé par MuAPI.

### Limites actuelles

- Lip Sync, vidéo à partir d’une image et certains modèles cinéma ont besoin d’URL publiques pour leurs médias de référence. Le formulaire n’héberge pas encore automatiquement les fichiers locaux dans MuAPI.
- Le studio utilise des champs génériques. Pour un modèle à schéma particulier, ses paramètres peuvent devoir être ajoutés au formulaire.
- Le code doit être testé avec une clé sandbox MuAPI avant d’utiliser des crédits réels.
