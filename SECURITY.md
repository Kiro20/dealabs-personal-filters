# Politique de sécurité

## Versions prises en charge

Seule la dernière version publiée est prise en charge.

## Signaler une faille

Ne publiez pas de vulnérabilité exploitable dans un ticket public. Utilisez la fonction **Private vulnerability reporting** du dépôt GitHub. Indiquez la version, les étapes de reproduction, l’impact estimé et, si possible, une correction proposée.

Une première réponse devrait être envoyée sous sept jours. Aucun délai de correction ne peut être garanti pour ce projet bénévole.

## Modèle de sécurité

- Aucun code distant ni `eval`.
- Aucune dépendance d’exécution.
- Permission limitée au stockage local.
- Injection limitée à la page Dealabs `/nouveaux`.
- Texte utilisateur rendu avec `textContent`, jamais interprété comme HTML.
- Validation de l’origine, du chemin et du numéro de page avant d’activer le chargement progressif.
