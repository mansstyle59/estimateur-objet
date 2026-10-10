# Activer l’analyse IA — Estimateur Objet

L'application GitHub Pages est statique. Pour analyser une photo en gardant la clé secrète, la fonction `api/analyze.js` doit être déployée sur un serveur (Vercel est prévu dans ce dépôt). **L'analyse ne fonctionnera pas tant que ces étapes ne sont pas terminées.**

## 1. Créer une clé Gemini

1. Ouvre https://aistudio.google.com/apikey
2. Crée une clé API pour un projet en mode gratuit si l'option est disponible.
3. Ne partage jamais la clé dans le chat et ne la colle jamais dans `index.html`, `config.js` ou un fichier GitHub.

Le serveur utilise `gemini-2.5-flash-lite`. Les modèles, quotas et conditions du niveau gratuit peuvent changer : vérifie les limites affichées dans Google AI Studio avant de l'utiliser. Avec le niveau gratuit, Google indique que les contenus peuvent être utilisés pour améliorer ses produits : évite les photos contenant des visages, documents personnels ou informations privées.

## 2. Déployer le serveur

1. Ouvre https://vercel.com/new et connecte ton compte GitHub.
2. Importe le dépôt `mansstyle59/estimateur-objet`.
3. Garde le répertoire racine du projet et déploie-le.
4. Dans le projet Vercel, ouvre **Settings → Environment Variables**.
5. Ajoute `GEMINI_API_KEY` avec la clé Gemini, en environnement **Production** (et Preview si tu en as besoin). Choisis un type secret/sensible si l'interface le propose.
6. Redéploie après avoir ajouté la variable.
7. Vérifie que l'URL de déploiement répond sur `https://TON-PROJET.vercel.app/api/analyze` avec une erreur de méthode quand on l'ouvre en GET. C'est normal : l'API attend une requête POST.

## 3. Relier GitHub Pages au serveur

1. Ouvre `config.js` dans ce dépôt.
2. Remplace la valeur vide par l'URL complète de l'API Vercel, par exemple :
   `window.ESTIMATEUR_API_URL = "https://TON-PROJET.vercel.app/api/analyze";`
3. Enregistre le changement sur `main`. GitHub Pages se mettra à jour après la publication.

## Ce que l'IA fait (et ne fait pas)

- Elle décrit ce qu'elle pense voir sur la photo, suggère une catégorie et des pistes de rénovation.
- Elle peut se tromper : vérifie les marques, matériaux et défauts.
- Elle ne retourne volontairement **aucun prix de marché**. Les prix de revente doivent être vérifiés en comparant des annonces comparables ; les liens de recherche de l'application ne récupèrent pas automatiquement les prix.
- Le code limite les images à 3 Mo et applique une limitation simple par adresse IP. Cette limitation en mémoire n'est pas une protection anti-abus complète sur un service serverless : surveille les quotas et n'utilise pas une clé liée à un compte payant sans protection supplémentaire.


## Option gratuite open source : Ollama sur ton Mac

Cette option utilise le modèle open source `llava:7b` directement sur ton Mac. Elle ne nécessite pas de clé API et envoie la photo à aucun service IA externe. **Elle fonctionne uniquement dans le navigateur du Mac où Ollama tourne** : le bouton ne peut pas utiliser le `localhost` du Mac depuis un iPhone.

1. Installe Ollama pour macOS depuis https://ollama.com/download.
2. Ouvre l’app Terminal sur le Mac et lance :
   ```bash
   ollama pull llava:7b
   ```
   Le téléchargement peut prendre plusieurs Go.
3. Autorise l’origine GitHub Pages dans Ollama. Si Ollama est installé comme application macOS, quitte-le complètement, puis dans Terminal exécute :
   ```bash
   launchctl setenv OLLAMA_ORIGINS "https://mansstyle59.github.io"
   ```
   Rouvre ensuite Ollama. Cette variable autorise les requêtes du site à Ollama depuis ce navigateur. Si tu utilises un autre mode d’installation, consulte la documentation Ollama sur les variables d’environnement.
4. Vérifie dans Terminal que le modèle est présent avec `ollama list` et que le serveur local tourne.
5. Sur le Mac, ouvre https://mansstyle59.github.io/estimateur-objet/ dans un navigateur, puis choisis une photo et clique **IA open source sur mon Mac**.

Documentation officielle Ollama : https://docs.ollama.com/ et modèle vision : https://ollama.com/library/llava.

### Limites de l’option locale

- Le Mac doit être allumé, Ollama lancé et le modèle téléchargé.
- L’analyse peut être lente sur un Mac Intel, selon le processeur et la mémoire disponibles.
- Si le navigateur bloque la connexion HTTP locale depuis la page HTTPS, la requête peut échouer ; dans ce cas il faudra servir l’interface localement ou configurer une passerelle locale, plutôt que désactiver les protections du navigateur.
- Le bouton IA en ligne reste séparé et nécessite le serveur Gemini décrit plus haut.
- Cette option identifie et décrit l’objet, mais ne vérifie pas les prix de vente réels.
