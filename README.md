# Filtres personnels pour Dealabs

<img src="assets/icon.svg" width="96" height="96" alt="Logo de l’extension : entonnoir turquoise sur fond anthracite">

Extension WebExtensions non officielle pour Firefox, Brave, Chrome et les navigateurs Chromium. Elle ajoute des filtres d’inclusion et d’exclusion à la page Tous les deals de Dealabs.

> Ce projet indépendant n’est ni affilié, ni approuvé, ni maintenu par Dealabs ou Pepper. « Dealabs » est une marque de son propriétaire respectif.

## Fonctionnalités

- Inclusion ou exclusion de fragments du titre, sans distinction de casse ou d’accent.
- Inclusion ou exclusion du nom exact d’une boutique.
- Activation individuelle des critères et suspension globale du filtrage.
- Tri alphabétique et stockage local des critères.
- Préchargement séquentiel des pages 1 à 10 avec le mécanisme natif du site.
- Vérification périodique de la dernière release GitHub avec un bandeau lorsqu’une mise à jour est disponible.
- Conservation de la présentation et des liens Dealabs.

## Installation

### Brave, Chrome et navigateurs Chromium

1. Télécharger l’archive ZIP de la dernière [Release GitHub](https://github.com/Kiro20/dealabs-personal-filters/releases/latest).
2. Extraire entièrement l’archive dans un dossier permanent.
3. Ouvrir `brave://extensions` ou `chrome://extensions`.
4. Activer le **Mode développeur**.
5. Cliquer sur **Charger l’extension non empaquetée** et sélectionner le dossier extrait.

Ne supprimez pas le dossier extrait tant que l’extension est installée.

### Firefox

Le package Firefox est préparé séparément dans chaque release. Pour un test local :

1. Télécharger l’archive `filtres-personnels-dealabs-firefox-vX.Y.Z.zip` de la dernière release.
2. Ouvrir `about:debugging#/runtime/this-firefox`.
3. Cliquer sur **Charger un module complémentaire temporaire**.
4. Sélectionner l’archive ZIP ou son fichier `manifest.json` après extraction.

Firefox supprime les modules temporaires à sa fermeture. Une installation permanente dans Firefox stable nécessite une version signée par Mozilla Add-ons.

### Depuis le code source

1. Télécharger ou cloner ce dépôt.
2. Ouvrir `brave://extensions` ou `chrome://extensions`.
3. Activer le **Mode développeur**.
4. Cliquer sur **Charger l’extension non empaquetée**.
5. Sélectionner le dossier du projet.
6. Ouvrir ou recharger `https://www.dealabs.com/tous`.

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

- l’accès à `https://www.dealabs.com/tous*`, afin de lire et masquer les cartes affichées ;
- l’accès à `https://api.github.com/*`, afin de vérifier au maximum toutes les six heures la dernière version publiée ;
- la permission `storage`, afin d’enregistrer les critères dans le profil local du navigateur.

Elle ne lit pas les identifiants, cookies ou données du compte. La requête GitHub est envoyée sans identifiants et ne contient aucun critère. Le préchargement demande séquentiellement jusqu’à neuf pages supplémentaires par l’intermédiaire du mécanisme de pagination de Dealabs. Consultez [PRIVACY.md](PRIVACY.md) pour la politique complète.

## Développement et vérification

Le projet ne nécessite aucune installation de dépendance. Node.js 18 ou ultérieur suffit pour exécuter :

```console
npm test
```

Sous Windows, l’archive distribuable est générée avec :

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\package-extension.ps1
```

Le script produit un ZIP Chromium et un ZIP Firefox. Ils contiennent uniquement les fichiers exécutés par l’extension, les icônes et la licence. Le manifeste propre à chaque navigateur se trouve sous le nom `manifest.json` à la racine de son archive.

La logique métier est dans `filters.js`. L’intégration avec Dealabs et l’interface sont dans `content.js`. Les sélecteurs reposent sur le HTML de Dealabs et peuvent nécessiter une adaptation si le site évolue.

Les contributions sont décrites dans [CONTRIBUTING.md](CONTRIBUTING.md). Les failles de sécurité doivent être signalées selon [SECURITY.md](SECURITY.md), sans créer de ticket public.

## Limites

- Compatibilité ciblée : Firefox 142 ou ultérieur, Brave et navigateurs Chromium récents.
- L’extension intervient uniquement sur `/tous`.
- Le préchargement dépend du mécanisme interne de pagination de Dealabs et peut cesser de fonctionner après une modification du site.
- L’utilisateur reste responsable du respect des conditions d’utilisation de Dealabs.

## Licence

Publié sous licence MIT. Voir [LICENSE](LICENSE).
