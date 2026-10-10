# Activer l’analyse IA open source sur téléphone — Estimateur Objet

L’application web est prévue pour fonctionner sur iPhone et Android. Le modèle open source **Qwen2.5-VL-7B-Instruct** analyse les photos via Hugging Face Inference Providers, et la clé reste uniquement côté serveur. Le modèle est publié sous licence Apache 2.0 : https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct.

**Important sur le gratuit :** l’accès hébergé n’est pas illimité. Hugging Face annonce actuellement 0,10 $ de crédits mensuels pour les comptes gratuits, susceptibles de changer. Après épuisement, des requêtes payantes peuvent être possibles ; n’active pas d’achat de crédits si tu veux rester à 0 €. Consulte la page officielle : https://huggingface.co/docs/inference-providers/pricing.

## Étapes à faire une seule fois

### 1. Créer un jeton Hugging Face

1. Ouvre https://huggingface.co/settings/tokens
2. Crée un jeton à permissions minimales permettant l’inférence si l’interface le propose.
3. Ne colle jamais le jeton dans GitHub, dans `index.html`, dans `config.js` ou dans la conversation.

### 2. Déployer l’API serveur

1. Ouvre https://vercel.com/new et connecte ton compte GitHub.
2. Importe le dépôt `mansstyle59/estimateur-objet`.
3. Déploie le projet depuis sa racine.
4. Dans Vercel, ouvre **Settings → Environment Variables** et ajoute `HF_TOKEN` avec ton jeton Hugging Face. Garde-le secret et ne le mets pas dans le code.
5. Redéploie après l’ajout de la variable.
6. L’API est prévue à l’adresse `https://TON-PROJET.vercel.app/api/analyze`.

### 3. Relier l’application au serveur

Dans GitHub, ouvre `config.js` et remplace la valeur vide par l’adresse exacte de ton API Vercel :

```js
window.ESTIMATEUR_API_URL = "https://TON-PROJET.vercel.app/api/analyze";
```

Enregistre le fichier. Après publication de GitHub Pages, ouvre https://mansstyle59.github.io/estimateur-objet/ sur ton téléphone. Choisis une photo, puis appuie sur **Analyser avec l’IA open source**.

## Limites et confidentialité

- Le modèle Qwen est open source, mais l’exécution via un fournisseur hébergé dépend de quotas, de disponibilité et de conditions qui peuvent changer. Ce n’est pas une IA hébergée gratuitement et sans limite.
- La photo est envoyée à Hugging Face / au fournisseur d’inférence choisi pour être analysée. Évite les visages, documents personnels et informations sensibles.
- Le serveur limite les photos à 3 Mo et applique une limitation de requêtes en mémoire, mais cette protection anti-abus reste basique.
- L’IA peut se tromper sur les marques, matériaux, dimensions et défauts.
- **Aucun prix de marché n’est vérifié automatiquement.** Les liens de comparaison restent des recherches manuelles d’annonces ; les prix affichés par les vendeurs ne sont pas nécessairement les prix de vente conclus.
- L’API ne fonctionnera pas tant que Vercel et `config.js` ne seront pas configurés. Le code a été poussé sur GitHub, mais le déploiement et une analyse réelle restent à vérifier.
