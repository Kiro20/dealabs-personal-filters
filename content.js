(() => {
  'use strict';
  const F = globalThis.DealabsFilters;
  const KEY = 'personalFiltersV1';
  const HIDDEN = 'data-dl-personal-hidden';
  const metadata = new WeakMap();
  let applied = F.defaults(), draft = F.defaults(), host, shadow, timer, lastUrl = '', minimized = false;
  let preloadPromise = null, preloadGeneration = 0, wasListing;
  let saving = Promise.resolve();
  const clone = value => JSON.parse(JSON.stringify(value));
  const isListing = () => /^\/tous\/?$/.test(location.pathname);
  wasListing = isListing();
  const style = document.createElement('style');
  style.textContent = `[${HIDDEN}] { display: none !important; }`;
  document.documentElement.append(style);
  const titleSelector = '.thread-title a, a.thread-title, [data-t="threadTitle"] a, a[data-t="threadTitle"], a.thread-link';
  function deals() {
    const cards = new Set(document.querySelectorAll('article.thread, article[id^="thread_"], .threadGrid > .thread, .threadList > .thread'));
    document.querySelectorAll(titleSelector).forEach(link => {
      const card = link.closest('article, .thread');
      if (card) cards.add(card);
    });
    return [...cards].map(card => {
      let data = metadata.get(card);
      if (!data) {
        for (const element of card.querySelectorAll('[data-vue3]')) {
          try {
            const thread = JSON.parse(element.getAttribute('data-vue3')).props?.thread;
            if (thread?.title) { data = { title: thread.title, shop: thread.merchant?.merchantName || '' }; metadata.set(card, data); break; }
          } catch { /* Ignore unrelated or malformed component metadata. */ }
        }
      }
      const title = card.querySelector(titleSelector) || card.querySelector('.thread-title');
      const shop = card.querySelector('.thread-merchant, [data-t="merchantName"], [data-t="merchantLink"], a[href*="/marchand/"], a[href*="/merchant/"]');
      return { card, title: title?.textContent?.trim() || data?.title || '', shop: data?.shop || shop?.textContent?.trim() || '' };
    }).filter(deal => deal.title);
  }
  function apply() {
    if (!isListing()) {
      host?.remove(); host = null;
      document.querySelectorAll(`[${HIDDEN}]`).forEach(card => card.removeAttribute(HIDDEN));
      return;
    }
    if (!host) mount();
    const items = deals();
    let hidden = 0, unknown = 0;
    for (const deal of items) {
      const hide = !F.accepts(deal, applied);
      deal.card.toggleAttribute(HIDDEN, hide);
      if (hide) hidden++;
      if (!deal.shop) unknown++;
    }
    shadow.querySelector('#count').textContent = `${items.length - hidden} affichée(s) · ${hidden} masquée(s) sur cette page`;
    shadow.querySelector('#diagnostic').textContent = !items.length ? 'Aucune annonce détectée. Si la liste est visible, les sélecteurs Dealabs devront être adaptés.' : unknown ? `${unknown} boutique(s) non identifiée(s). Les inclusions de boutique masquent aussi les annonces sans boutique identifiée.` : '';
  }
  const waitForNextBatch = (trigger, previousCount) => new Promise(resolve => {
    const started = Date.now();
    const check = () => {
      const currentCount = deals().length;
      if (currentCount > previousCount) return resolve(true);
      if (Date.now() - started > 15000) return resolve(false);
      setTimeout(check, 150);
    };
    check();
  });
  function nextPageTrigger() {
    const trigger = document.querySelector('#thread-inject[data-replace]');
    if (!trigger) return null;
    const parsed = F.parseNextPageTrigger(trigger.getAttribute('data-replace'), location.href);
    return parsed ? { trigger, page: parsed.page } : null;
  }
  async function preloadTenPages() {
    if (!isListing() || preloadPromise) return preloadPromise;
    const generation = preloadGeneration;
    preloadPromise = (async () => {
      const output = shadow?.querySelector('#preload');
      let loadedThrough = 1;
      for (let attempt = 0; attempt < 9; attempt++) {
        if (generation !== preloadGeneration || !isListing()) return;
        const next = nextPageTrigger();
        if (!next) break;
        loadedThrough = next.page - 1;
        if (output) output.textContent = `Préchargement des annonces : page ${next.page}/10…`;
        const previousCount = deals().length;
        // This is the same event emitted by Dealabs when its infinite-scroll marker enters view.
        next.trigger.dispatchEvent(new CustomEvent('replace', { bubbles: true }));
        const fallback = setTimeout(() => {
          if (!next.trigger.isConnected || deals().length > previousCount) return;
          const originalStyle = next.trigger.getAttribute('style');
          next.trigger.style.cssText = 'position:fixed!important;right:0!important;bottom:0!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;';
          window.dispatchEvent(new Event('scroll'));
          setTimeout(() => {
            if (!next.trigger.isConnected) return;
            if (originalStyle === null) next.trigger.removeAttribute('style');
            else next.trigger.setAttribute('style', originalStyle);
          }, 600);
        }, 1200);
        const loaded = await waitForNextBatch(next.trigger, previousCount);
        clearTimeout(fallback);
        if (generation !== preloadGeneration || !isListing()) return;
        if (!loaded) {
          if (output) output.textContent = `Préchargement interrompu après la page ${loadedThrough}. Fais défiler la liste pour continuer.`;
          apply();
          return;
        }
        loadedThrough = next.page;
        apply();
      }
      if (output) output.textContent = loadedThrough >= 10 ? 'Pages 1 à 10 préchargées et filtrées.' : `${deals().length} annonces préchargées et filtrées.`;
    })().catch(error => {
      console.error('Dealabs filters: preload failed', error);
      const output = shadow?.querySelector('#preload');
      if (output) output.textContent = 'Le préchargement a échoué. Le filtrage continuera pendant le défilement.';
    });
    return preloadPromise;
  }
  function persist() {
    const snapshot = clone(applied);
    saving = saving.catch(() => {}).then(() => chrome.storage.local.set({ [KEY]: snapshot }));
    saving.catch(() => { if (shadow) shadow.querySelector('#status').textContent = 'Échec de sauvegarde. Recharge l’extension puis réessaie.'; });
  }
  function dirty() { shadow.querySelector('#status').textContent = 'Modifications en attente — clique sur Appliquer.'; }
  function renderRules() {
    let activeCount = 0;
    for (const key of F.groups) {
      F.sortRules(draft[key]);
      const list = shadow.querySelector(`#${key}-list`);
      list.replaceChildren();
      draft[key].forEach((rule, index) => {
        if (rule.enabled) activeCount++;
        const row = document.createElement('div'); row.className = 'rule';
        const label = document.createElement('label');
        const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = rule.enabled;
        checkbox.addEventListener('change', () => { rule.enabled = checkbox.checked; dirty(); });
        const text = document.createElement('span'); text.textContent = rule.text;
        label.append(checkbox, text);
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = '×'; remove.setAttribute('aria-label', `Supprimer ${rule.text}`);
        remove.addEventListener('click', () => { draft[key].splice(index, 1); renderRules(); dirty(); });
        row.append(label, remove); list.append(row);
      });
    }
    shadow.querySelector('#enabled').checked = draft.enabled;
    const badge = shadow.querySelector('#rule-count');
    badge.textContent = activeCount;
    badge.hidden = activeCount === 0;
  }
  function mount() {
    host = document.createElement('div'); host.id = 'dealabs-personal-filters';
    shadow = host.attachShadow({ mode: 'open' });
    // This template contains extension-owned constants only. User rules are rendered with textContent below.
    shadow.innerHTML = `<style>
      :host { all: initial; position: fixed; right: 18px; top: 108px; z-index: 2147483646; color-scheme: dark; --accent: #02a5b5; --surface: #202324; --surface-2: #282c2e; --line: #3b4144; --text: #f4f6f6; --muted: #9ba7aa; color: var(--text); }
      *, *::before, *::after { box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif !important; }
      .panel { font-size: 14px; line-height: 1.4; }
      .panel { width: min(332px, calc(100vw - 28px)); background: var(--surface); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 14px 42px rgba(0,0,0,.48); overflow: hidden; }
      header { display: flex; align-items: center; justify-content: space-between; min-height: 54px; padding: 0 14px 0 16px; border-bottom: 1px solid var(--line); }
      .heading { display: flex; align-items: center; gap: 9px; } .brand-icon { width: 28px; height: 28px; flex: 0 0 28px; } h2 { font-size: 16px; line-height: 1; margin: 0; font-weight: 700; letter-spacing: -.01em; }
      #rule-count { min-width: 21px; height: 21px; padding: 2px 6px; border-radius: 12px; background: rgba(2,165,181,.18); color: #55d8e3; font-size: 12px; font-weight: 700; text-align: center; }
      button, input { font: inherit; } button { cursor: pointer; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-2); color: var(--text); transition: background .15s, border-color .15s, transform .1s; }
      button:hover { background: #343a3c; border-color: #596164; } button:active { transform: translateY(1px); } button:focus-visible, input:focus-visible { outline: 2px solid #5bd3de; outline-offset: 2px; }
      #collapse { width: 31px; height: 31px; padding: 0; color: #cad1d3; font-size: 19px; line-height: 1; }
      .body { padding: 14px 15px 15px; max-height: calc(100vh - 138px); overflow-y: auto; scrollbar-width: thin; scrollbar-color: #52595c transparent; } .body[hidden] { display: none; }
      .master { gap: 9px; padding: 1px 1px 13px; font-weight: 650; border-bottom: 1px solid var(--line); }
      label { display: flex; align-items: center; gap: 8px; } input[type=checkbox] { width: 16px; height: 16px; margin: 0; accent-color: var(--accent); flex-shrink: 0; }
      fieldset { border: 0; padding: 0; margin: 15px 0 0; min-width: 0; } legend { padding: 0; margin-bottom: 7px; color: #dce1e2; font-size: 13px; font-weight: 700; }
      form { display: flex; gap: 6px; } input[type=text] { width: 100%; min-width: 0; height: 37px; padding: 0 11px; color: var(--text); background: #17191a; border: 1px solid #454b4e; border-radius: 8px; }
      input[type=text]::placeholder { color: #778184; } form button { width: 38px; flex: 0 0 38px; padding: 0; color: #6cdae3; font-size: 20px; }
      .rule { display: flex; align-items: center; justify-content: space-between; gap: 4px; min-height: 25px; margin-top: 3px; padding: 2px 3px 2px 6px; background: #191c1d; border: 1px solid #34393b; border-radius: 6px; }
      .rule label, .rule label span { min-width: 0; overflow-wrap: anywhere; font-size: 11.5px; line-height: 1.2; color: #7f8a8d !important; }
      .rule input[type=checkbox] { width: 13px; height: 13px; }
      .rule:has(input:checked) { border-color: #3d5558; background: #1a2021; }
      .rule:has(input:checked) label span { color: #e7f4f5 !important; font-weight: 600; }
      .remove { width: 20px; height: 20px; flex: 0 0 20px; border: 0; background: transparent; color: #8f999c; font-size: 16px; line-height: 1; padding: 0; } .remove:hover { color: #ff7a82; background: rgba(255,90,100,.1); }
      .actions { display: grid; grid-template-columns: 1fr auto; gap: 7px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--line); } .actions button { height: 38px; padding: 0 12px; font-weight: 650; }
      .primary { background: var(--accent); color: #061b1e; border-color: var(--accent); } .primary:hover { background: #17b8c7; border-color: #17b8c7; }
      .meta { margin-top: 11px; padding: 9px 10px; background: #191c1d; border-radius: 8px; } p { margin: 0; font-size: 12px; color: var(--muted); } #status { color: #c1c9cb; } #count, #preload { margin-top: 4px; color: #6fd7df; font-weight: 650; } #diagnostic { margin-top: 5px; color: #e3ad67; }
      @media (max-width: 700px) { :host { right: 8px; top: 72px; } .panel { width: min(332px, calc(100vw - 16px)); } }
      @media (prefers-reduced-motion: reduce) { button { transition: none; } }
    </style><section class="panel" aria-label="Filtres personnels Dealabs"><header><div class="heading"><svg class="brand-icon" viewBox="0 0 512 512" aria-hidden="true"><rect x="24" y="24" width="464" height="464" rx="112" fill="#202425" stroke="#3b4548" stroke-width="16"/><path d="M112 128h288L292 260v112l-72 36V260L112 128Z" fill="#08a9b8"/><circle cx="382" cy="136" r="38" fill="#ff6470" stroke="#202425" stroke-width="14"/></svg><h2>Filtres</h2><span id="rule-count" title="Règles actives"></span></div><button id="collapse" type="button" aria-expanded="true" aria-label="Réduire les filtres">−</button></header><div class="body">
    <label class="master"><input id="enabled" type="checkbox">Activer le filtrage</label>
    ${[['titleExclude','Titres à exclure','terrasse'],['titleInclude','Titres à inclure','ordinateur'],['shopExclude','Boutiques à exclure','Fnac'],['shopInclude','Boutiques à inclure','Carrefour']].map(([key,label,placeholder]) => `<fieldset><legend>${label}</legend><form data-group="${key}"><input type="text" maxlength="200" aria-label="${label}" placeholder="Ex. ${placeholder}" required><button type="submit" aria-label="Ajouter : ${label}">+</button></form><div id="${key}-list"></div></fieldset>`).join('')}
    <div class="actions"><button id="apply" class="primary" type="button">Appliquer</button><button id="reset" type="button">Réinitialiser</button></div>
    <div class="meta"><p id="status" role="status" aria-live="polite">Filtres mémorisés sur ce navigateur.</p><p id="count" aria-live="polite"></p><p id="preload" aria-live="polite">Préchargement en attente…</p><p id="diagnostic"></p></div>
    </div></section>`;
    document.documentElement.append(host);
    shadow.querySelectorAll('form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault(); const input = form.querySelector('input'), text = input.value.trim(), key = form.dataset.group;
      if (!text) return;
      const existing = draft[key].find(r => F.normalize(r.text) === F.normalize(text));
      if (existing) existing.enabled = true;
      else if (draft[key].length < F.MAX_RULES_PER_GROUP) draft[key].push({ text, enabled: true });
      else { shadow.querySelector('#status').textContent = `Limite de ${F.MAX_RULES_PER_GROUP} critères atteinte pour ce groupe.`; return; }
      input.value = ''; renderRules(); dirty(); input.focus();
    }));
    shadow.querySelector('#enabled').addEventListener('change', event => { draft.enabled = event.target.checked; dirty(); });
    shadow.querySelector('#apply').addEventListener('click', () => { applied = clone(draft); persist(); apply(); shadow.querySelector('#status').textContent = 'Filtres appliqués.'; });
    shadow.querySelector('#reset').addEventListener('click', () => {
      draft.enabled = false; for (const key of F.groups) draft[key].forEach(r => { r.enabled = false; });
      applied = clone(draft); renderRules(); persist(); apply(); shadow.querySelector('#status').textContent = 'Toutes les règles sont désactivées et conservées.';
    });
    const collapse = shadow.querySelector('#collapse');
    const setCollapsed = () => { shadow.querySelector('.body').hidden = minimized; collapse.textContent = minimized ? '+' : '−'; collapse.setAttribute('aria-expanded', String(!minimized)); collapse.setAttribute('aria-label', minimized ? 'Afficher les filtres' : 'Réduire les filtres'); };
    collapse.addEventListener('click', () => { minimized = !minimized; setCollapsed(); });
    setCollapsed(); renderRules();
  }
  chrome.storage.local.get(KEY).then(data => {
    applied = F.sanitize(data[KEY]); draft = clone(applied); apply();
    const observer = new MutationObserver(records => {
      if (records.every(record => record.target === host || host?.contains(record.target))) return;
      clearTimeout(timer); timer = setTimeout(apply, 180);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    // SPA navigation also needs detection when it does not mutate the listing immediately.
    lastUrl = location.href;
    setTimeout(preloadTenPages, 300);
    setInterval(() => {
      const listing = isListing();
      if (lastUrl !== location.href) { lastUrl = location.href; apply(); }
      if (wasListing && !listing) { preloadGeneration++; preloadPromise = null; }
      if (!wasListing && listing) setTimeout(preloadTenPages, 300);
      wasListing = listing;
    }, 800);
  }).catch(error => console.error('Dealabs filters: initialization failed', error));
})();
