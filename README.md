# Estimateur d’objet — Achat-revente

Petite application web mobile en français pour préparer une décision d’achat-revente.

## Fonctions
- Ajouter une photo depuis un téléphone ou un ordinateur.
- Noter le nom, la catégorie, l’état et le lien de l’annonce.
- Calculer bénéfice estimé, marge, retour sur achat et prix d’achat maximal.
- Afficher une fourchette indicative de revente.
- Enregistrer les estimations dans le navigateur.

## Limites à connaître
- La photo est affichée, mais n’est pas analysée par une IA.
- Les liens Leboncoin et Facebook Marketplace sont conservés comme référence, mais les annonces ne sont pas importées automatiquement.
- Les fourchettes sont des repères génériques par catégorie et état, pas des prix de marché vérifiés ni une garantie de vente.
- Les données d’historique sont stockées localement dans le navigateur utilisé.

## Publier sur GitHub Pages
1. Ouvrir Settings dans ce dépôt.
2. Aller dans Pages.
3. Dans Build and deployment, choisir Deploy from a branch.
4. Sélectionner la branche main et le dossier /(root), puis cliquer Save.
5. Attendre la fin du déploiement. L’adresse attendue est https://mansstyle59.github.io/estimateur-objet/.

L’application est un site statique : aucune clé API ni serveur n’est nécessaire pour ses fonctions actuelles.