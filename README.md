# Estimateur d’objet — Achat-revente

Petite application web mobile en français pour préparer une décision d’achat-revente.

## Fonctions
- Ajouter une photo depuis un téléphone ou un ordinateur.
- Noter le nom, la catégorie, l’état et le lien de l’annonce.
- Calculer bénéfice estimé, marge, retour sur achat et prix d’achat maximal.
- Afficher une fourchette indicative de revente.
- Enregistrer les estimations dans le navigateur.

## Fonctionnement et limites réelles
- L’analyse d’une photo utilise un modèle de vision IA via le Worker Cloudflare. Si le modèle ou le quota du fournisseur est indisponible, l’analyse peut échouer : aucune disponibilité illimitée n’est garantie.
- Pour un lien d’annonce, le Worker essaie de lire les métadonnées et le texte public. Leboncoin, Facebook Marketplace et Vinted peuvent bloquer l’accès automatisé ; une capture d’écran ou une photo reste alors nécessaire.
- Les prix d’une recherche eBay, lorsqu’elle est configurée, sont des prix demandés d’annonces actives, pas des ventes conclues. Sans comparables réellement récupérés, l’estimation reste indicative.
- L’historique reste local au navigateur. Utilise **Exporter mes données** puis **Importer une sauvegarde** pour transférer les estimations entre appareils, sans compte.
- L’interface n’impose pas de plafond quotidien local. Les fournisseurs d’IA, les API et l’hébergement peuvent toutefois appliquer leurs propres quotas, conditions ou limites de coût.

## Vérifications avant publication
Cette branche contient des modifications en attente de revue. Le déploiement de production n’est pas fait automatiquement : configure le Worker, teste une vraie photo et un lien public, puis teste l’export/import sur iPhone et ordinateur avant de fusionner.

## Publier sur GitHub Pages
1. Ouvrir Settings dans ce dépôt.
2. Aller dans Pages.
3. Dans Build and deployment, choisir Deploy from a branch.
4. Sélectionner la branche main et le dossier /(root), puis cliquer Save.
5. Attendre la fin du déploiement. L’adresse attendue est https://mansstyle59.github.io/estimateur-objet/.

L’application est un site statique : aucune clé API ni serveur n’est nécessaire pour ses fonctions actuelles.