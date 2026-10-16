const assert = require('node:assert/strict');
const chromium = require('../manifest.json');
const firefox = require('../manifest.firefox.json');

for (const manifest of [chromium, firefox]) {
  assert.equal(manifest.manifest_version, 3);
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.host_permissions, ['https://api.github.com/*']);
  assert.deepEqual(manifest.content_scripts[0].matches, ['https://www.dealabs.com/tous']);
  assert.deepEqual(manifest.content_scripts[0].js, ['filters.js', 'content.js']);
}

assert.equal(chromium.version, firefox.version);
assert.equal(chromium.version, require('../package.json').version);
assert.equal(firefox.browser_specific_settings.gecko.data_collection_permissions.required[0], 'none');
console.log('Manifestes Chromium et Firefox cohérents');
