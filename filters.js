(function (root) {
  const groups = ['titleExclude', 'titleInclude', 'shopExclude', 'shopInclude'];
  const MAX_RULES_PER_GROUP = 200;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').replace(/\s+/g, ' ').trim();
  const sortRules = rules => rules.sort((a, b) => normalize(a.text).localeCompare(normalize(b.text), 'fr', { numeric: true }));
  const defaults = () => ({ enabled: true, titleExclude: [], titleInclude: [], shopExclude: [], shopInclude: [] });
  function sanitize(value) {
    const result = defaults();
    if (!value || typeof value !== 'object') return result;
    result.enabled = value.enabled !== false;
    for (const group of groups) {
      if (!Array.isArray(value[group])) continue;
      const seen = new Set();
      const rules = [];
      for (const candidate of value[group]) {
        if (!candidate || typeof candidate.text !== 'string') continue;
        const text = candidate.text.trim().slice(0, 200);
        const key = normalize(text);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        rules.push({ text, enabled: candidate.enabled !== false });
        if (rules.length === MAX_RULES_PER_GROUP) break;
      }
      result[group] = sortRules(rules);
    }
    return result;
  }
  function accepts(deal, config) {
    if (!config.enabled) return true;
    const title = normalize(deal.title), shop = normalize(deal.shop);
    const active = key => config[key].filter(r => r.enabled).map(r => normalize(r.text));
    const tx = active('titleExclude'), ti = active('titleInclude');
    const sx = active('shopExclude'), si = active('shopInclude');
    // Titles match fragments; shops match the entire normalized name.
    return !tx.some(v => title.includes(v)) && !sx.includes(shop)
      && (!ti.length || ti.some(v => title.includes(v)))
      && (!si.length || si.includes(shop));
  }
  function parseNextPageTrigger(rawConfig, currentUrl) {
    try {
      const endpoint = JSON.parse(rawConfig)?.endpoint;
      if (typeof endpoint !== 'string') return null;
      const base = new URL(currentUrl);
      const url = new URL(endpoint, base);
      const page = Number(url.searchParams.get('page'));
      if (url.origin !== base.origin || url.pathname.replace(/\/$/, '') !== '/tous') return null;
      if (!Number.isInteger(page) || page < 2 || page > 10) return null;
      if (url.searchParams.get('ajax') !== 'true') return null;
      return { endpoint: url.href, page };
    } catch {
      return null;
    }
  }
  const api = { groups, MAX_RULES_PER_GROUP, normalize, sortRules, defaults, sanitize, accepts, parseNextPageTrigger };
  root.DealabsFilters = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
