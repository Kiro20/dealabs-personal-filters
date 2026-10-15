# Politique de confidentialité

Dernière mise à jour : 15 octobre 2026.

## Données traitées

L’extension lit dans la page Dealabs ouverte le titre des annonces, le nom de leur boutique et les éléments nécessaires au chargement progressif. Ce traitement s’effectue localement dans le navigateur.

Les critères saisis, leur état actif ou inactif et l’activation générale sont enregistrés avec `chrome.storage.local`. Ces données restent dans le profil du navigateur, sous réserve des fonctions de synchronisation ou de sauvegarde propres au navigateur choisi par l’utilisateur.

## Transmission et collecte

Le projet ne possède aucun serveur, compte utilisateur, outil d’analyse, publicité ou télémétrie. Il ne collecte et ne transmet les critères à aucun tiers.

Lorsque la page `/tous` est ouverte, l’extension déclenche le mécanisme natif de Dealabs pour précharger jusqu’aux pages 1 à 10. Ces requêtes sont adressées uniquement à Dealabs et restent soumises à sa propre politique de confidentialité.

L’extension consulte au maximum toutes les six heures l’API publique de GitHub pour connaître la dernière release du projet. Cette requête est envoyée sans identifiants et ne contient ni critère, ni donnée issue de Dealabs. La version obtenue et l’heure de vérification sont conservées dans le stockage local du navigateur.

## Suppression

Le bouton **Réinitialiser** désactive les critères mais les conserve. Pour supprimer un critère, utilisez le bouton × correspondant. Pour effacer toutes les données de l’extension, supprimez l’extension ou effacez ses données depuis les paramètres du navigateur.

## Évolutions

Toute évolution qui introduirait une collecte distante devra être documentée ici avant publication et accompagnée d’un consentement adapté.
