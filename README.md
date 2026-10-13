# Filtres personnels pour Dealabs

<img src="assets/icon.svg" width="96" height="96" alt="Logo de l’extension : entonnoir turquoise sur fond anthracite">

Extension Chromium non officielle qui ajoute des filtres d’inclusion et d’exclusion à la page des nouveaux deals de Dealabs.

> Ce projet indépendant n’est ni affilié, ni approuvé, ni maintenu par Dealabs ou Pepper. « Dealabs » est une marque de son propriétaire respectif.

## Fonctionnalités

- Inclusion ou exclusion de fragments du titre, sans distinction de casse ou d’accent.
- Inclusion ou exclusion du nom exact d’une boutique.
- Activation individuelle des critères et suspension globale du filtrage.
- Tri alphabétique et stockage local des critères.
- Préchargement séquentiel des pages 1 à 10 avec le mécanisme natif du site.
- Conservation de la présentation et des liens Dealabs.

## Installation locale

1. Télécharger ou cloner ce dépôt.
2. Ouvrir `brave://extensions` ou `chrome://extensions`.
3. Activer le **Mode développeur**.
4. Cliquer sur **Charger l’extension non empaquetée**.
5. Sélectionner le dossier du projet.
6. Ouvrir ou recharger `https://www.dealabs.com/nouveaux`.

Après une mise à jour des fichiers, recharger l’extension puis l’onglet Dealabs.

## Utilisation

Saisissez un mot, une expression ou une boutique dans le groupe souhaité, puis utilisez **+** ou la touche Entrée. Cochez les critères à activer et cliquez sur **Appliquer**.

- Une exclusion correspondante masque toujours l’annonce.
- Plusieurs critères d’un même groupe sont combinés avec « ou ».
- Si les inclusions de titre et de boutique sont toutes deux renseignées, l’annonce doit satisfaire les deux groupes.
- Les titres utilisent une correspondance partielle : `terrasse` correspond à `terrasses`.
- Les boutiques utilisent une correspondance exacte : `Fnac` et `Fnac Marketplace` sont distinctes.
- **Réinitialiser** désactive les critères sans supprimer les noms enregistrés.

Chaque groupe est limité à 200 critères pour préserver les performances et le stockage du navigateur.

## Confidentialité et permissions

L’extension ne contient aucune télémétrie, publicité ou dépendance distante. Elle demande uniquement :

- l’accès à `https://www.dealabs.com/nouveaux*`, afin de lire et masquer les cartes affichées ;
- la permission `storage`, afin d’enregistrer les critères dans le profil local du navigateur.

Elle ne lit pas les identifiants, cookies ou données du compte. Le préchargement demande séquentiellement jusqu’à neuf pages supplémentaires par l’intermédiaire du mécanisme de pagination de Dealabs. Consultez [PRIVACY.md](PRIVACY.md) pour la politique complète.

## Développement et vérification

Le projet ne nécessite aucune installation de dépendance. Node.js 18 ou ultérieur suffit pour exécuter :

```console
npm test
```

La logique métier est dans `filters.js`. L’intégration avec Dealabs et l’interface sont dans `content.js`. Les sélecteurs reposent sur le HTML de Dealabs et peuvent nécessiter une adaptation si le site évolue.

Les contributions sont décrites dans [CONTRIBUTING.md](CONTRIBUTING.md). Les failles de sécurité doivent être signalées selon [SECURITY.md](SECURITY.md), sans créer de ticket public.

## Limites

- Compatibilité ciblée : Brave et navigateurs Chromium récents.
- L’extension intervient uniquement sur `/nouveaux`.
- Le préchargement dépend du mécanisme interne de pagination de Dealabs et peut cesser de fonctionner après une modification du site.
- L’utilisateur reste responsable du respect des conditions d’utilisation de Dealabs.

## Licence

Publié sous licence MIT. Voir [LICENSE](LICENSE).
