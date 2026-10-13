const { test } = require('node:test');
const assert = require('node:assert/strict');
const F = require('./filters');
const rule = text => ({ text, enabled: true });
test('fragments, accents, casse et exclusions prioritaires', () => {
  const c = F.defaults();
  c.titleExclude = [rule('TERRASSE')]; c.titleInclude = [rule('bois')];
  assert.equal(F.accepts({ title: 'Bois pour terrasses', shop: '' }, c), false);
  c.titleExclude = [rule('electrique')];
  assert.equal(F.accepts({ title: 'Bois électrique', shop: '' }, c), false);
  c.titleExclude[0].enabled = false;
  assert.equal(F.accepts({ title: 'Bois électrique', shop: '' }, c), true);
});
test('inclusions OU par groupe et ET entre titre et boutique', () => {
  const c = F.defaults(); c.titleInclude = [rule('PC'), rule('console')]; c.shopInclude = [rule('Fnac'), rule('Carrefour')];
  assert.equal(F.accepts({ title: 'Console Xbox', shop: 'CARREFOUR' }, c), true);
  assert.equal(F.accepts({ title: 'Console Xbox', shop: 'Amazon' }, c), false);
  assert.equal(F.accepts({ title: 'Télévision', shop: 'Fnac' }, c), false);
  assert.equal(F.accepts({ title: 'PC', shop: '' }, c), false);
  c.shopExclude = [rule('Fnac')];
  assert.equal(F.accepts({ title: 'PC', shop: 'Fnac' }, c), false);
  assert.equal(F.accepts({ title: 'PC', shop: 'Fnac Marketplace' }, c), false);
});
test('désactivation générale et validation des données enregistrées', () => {
  const c = F.sanitize({ enabled: false, titleExclude: [rule('Écran 10'), null, rule('amazon'), rule('écran 2'), rule('AMAZON'), { text: '' }] });
  assert.deepEqual(c.titleExclude.map(r => r.text), ['amazon', 'écran 2', 'Écran 10']);
  assert.equal(c.titleExclude.length, 3);
  assert.equal(F.accepts({ title: 'PC', shop: '' }, c), true);
  assert.deepEqual(F.sanitize(null), F.defaults());
});
test('plafonne chaque groupe de critères', () => {
  const rules = Array.from({ length: F.MAX_RULES_PER_GROUP + 20 }, (_, index) => rule(`règle ${index}`));
  assert.equal(F.sanitize({ titleInclude: rules }).titleInclude.length, F.MAX_RULES_PER_GROUP);
});
