# Audit de sécurité avant publication

Date : 13 octobre 2026  
Version auditée : 1.3.3

## Périmètre

Audit statique de `manifest.json`, `filters.js` et `content.js`, complété par les tests de la logique de filtrage. L’intégration visuelle et le comportement réel de Dealabs doivent encore être validés manuellement après rechargement de la version 1.3.0.

## Résultat

Aucune vulnérabilité critique ou élevée identifiée dans le périmètre audité.

### Garanties vérifiées

- aucune clé, aucun jeton, mot de passe ou autre secret dans le projet ;
- aucune dépendance d’exécution ou chaîne d’approvisionnement tierce ;
- aucune télémétrie, publicité ou communication avec un serveur contrôlé par le projet ;
- seule permission d’extension : `storage` ;
- exécution limitée à `https://www.dealabs.com/tous` ;
- politique de sécurité du contenu interdisant les scripts distants et les objets ;
- absence de `eval`, de constructeur de fonction et de code distant ;
- saisies limitées à 200 caractères et 200 critères par groupe ;
- critères dédupliqués et normalisés lors de la lecture du stockage ;
- texte saisi injecté avec `textContent`, sans interprétation HTML ;
- endpoint de pagination accepté uniquement s’il conserve l’origine Dealabs, la route `/tous` et une page numérique plafonnée à 10 ;
- préchargement séquentiel, limité à neuf pages supplémentaires.

### Risques résiduels

- Une modification du DOM ou des attributs internes de Dealabs peut casser le filtrage ou le préchargement.
- Le préchargement génère jusqu’à neuf requêtes supplémentaires vers Dealabs à chaque ouverture de `/tous`.
- Le stockage local dépend des garanties du navigateur et du profil de l’utilisateur.
- Le projet utilise le nom de Dealabs de manière descriptive ; le caractère non officiel doit rester visible dans le README et toute fiche de distribution.

## Contrôles avant chaque version

1. Exécuter `npm test`.
2. Rechercher secrets, code dynamique, nouvelles URL et permissions.
3. Examiner toute modification du manifeste.
4. Tester les états : aucun critère, inclusions, exclusions, réinitialisation, échec du préchargement et navigation vers une annonce.
5. Vérifier que la politique de confidentialité correspond encore au comportement réel.
