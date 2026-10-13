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
test('accepte uniquement une pagination Dealabs attendue entre 2 et 10', () => {
  const base = 'https://www.dealabs.com/nouveaux';
  const valid = JSON.stringify({ endpoint: '/nouveaux?page=2&ajax=true&layout=horizontal' });
  assert.deepEqual(F.parseNextPageTrigger(valid, base), {
    endpoint: 'https://www.dealabs.com/nouveaux?page=2&ajax=true&layout=horizontal',
    page: 2
  });
  for (const endpoint of [
    'https://example.com/nouveaux?page=2&ajax=true',
    '/bons-plans?page=2&ajax=true',
    '/nouveaux?page=1&ajax=true',
    '/nouveaux?page=11&ajax=true',
    '/nouveaux?page=2.5&ajax=true',
    '/nouveaux?page=2'
  ]) assert.equal(F.parseNextPageTrigger(JSON.stringify({ endpoint }), base), null);
  assert.equal(F.parseNextPageTrigger('{malformed', base), null);
});
