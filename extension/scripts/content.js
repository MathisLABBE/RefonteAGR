/* AGR Tennis de Table – Affichage confort (style « beige & vert forêt »)
   - Pages Joomla : la page d'origine est masquée et reconstruite selon la
     maquette validée (en-tête, menu, accueil, pages, pied de page), avec le
     contenu réel du site (actualités, articles, documents, outils).
   - Pages /AGR/*.php (annuaires, calendriers, résultats) : étapes à déplier,
     tableaux défilants, hauteur automatique du cadre. */
(() => {
  'use strict';
  if (window.__agrxLoaded) return;
  window.__agrxLoaded = true;

  const root = document.documentElement;
  const BASE = (location.pathname.match(/^(.*?\/agrtt68\/)/i) || [null, '/agrtt68/'])[1];
  const isApp = /\/agrtt68\/AGR\//i.test(location.pathname);
  const isFramed = window.top !== window;
  const isSite = !isApp && !isFramed;
  const DEFAULTS = { enabled: true, contrast: false };
  const CACHE_KEY = 'agrx-settings';

  let settings = readCache();
  let domReady = false;

  /* =================================================================
     Réglages (taille du texte, contraste, activation)
     ================================================================= */

  function readCache() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function writeCache(s) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(s)); } catch { /* stockage bloqué */ }
  }

  function applyClasses(s) {
    const on = !!s.enabled;
    root.classList.toggle('agrx', on);
    root.classList.toggle('agrx-app', on && isApp);
    root.classList.toggle('agrx-site', on && isSite);
    root.classList.toggle('agrx-framed', on && isFramed);
    // Taille du texte fixe (18 px minimum) : les réglages A+ / A++ ont été retirés
    root.classList.remove('agrx-size-2', 'agrx-size-3');
    root.classList.toggle('agrx-size-1', on);
    root.classList.toggle('agrx-contrast', on && !!s.contrast);
  }

  function onSettings(next) {
    const merged = { ...DEFAULTS, ...next };
    const enabledChanged = merged.enabled !== settings.enabled;
    settings = merged;
    writeCache(settings);
    if (enabledChanged && domReady) {
      location.reload();
      return;
    }
    applyClasses(settings);
    syncTools();
    if (domReady && settings.enabled) refreshSizes();
  }

  function save(patch) {
    onSettings({ ...settings, ...patch });
    try { chrome.storage.sync.set(patch); } catch { /* extension rechargée */ }
  }

  applyClasses(settings);

  try {
    chrome.storage.sync.get(DEFAULTS, (s) => onSettings(s));
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;
      const next = { ...settings };
      for (const key of Object.keys(changes)) next[key] = changes[key].newValue;
      onSettings(next);
    });
  } catch { /* hors extension (tests) */ }

  /* =================================================================
     Outils
     ================================================================= */

  function el(tag, attrs = {}, text) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (text != null) node.textContent = text;
    return node;
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isBlank = (s) => s.replace(/[\s ]/g, '') === '';
  const href = (h) => (/^([a-z]+:)?\/\//i.test(h) || h.startsWith('/') ? h : BASE + h);
  const link = (n) => esc(href(n.href));

  function param(name, u = location.href) {
    try { return new URL(u, location.href).searchParams.get(name); } catch { return null; }
  }

  // « COUPES D'ALSACE » → « Coupes d'Alsace » (textes saisis tout en capitales)
  const SMALL_WORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'à', 'a', 'au', 'aux', 'pour', 'par', 'en', 'sur', 'un', 'une', 'ou']);
  function titleCase(s) {
    s = s.trim();
    if (s !== s.toUpperCase() || !/[A-ZÀ-Ý]/.test(s)) return s;
    let first = true;
    return s.toLowerCase().replace(/[^\s-]+/g, (w) => {
      const m = w.match(/^([dl]['’])?(.*)$/);
      const ap = m[1] || '';
      const rest = m[2];
      const small = !first && !ap && SMALL_WORDS.has(rest);
      first = false;
      if (small || !rest) return w;
      return ap + rest.charAt(0).toUpperCase() + rest.slice(1);
    });
  }

  // Texte saisi en majuscules → casse normale, majuscule en début de phrase
  function sentenceCase(s) {
    const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, '');
    const upper = letters.replace(/[^A-ZÀ-Þ]/g, '');
    if (letters.length < 12 || upper.length / letters.length < 0.7) return s;
    return s.toLowerCase()
      .replace(/(^|[.!?]\s+)(\p{L})/gu, (m, p, c) => p + c.toUpperCase())
      .replace(/\b(fscf|agr|crtt|cdtt|fftt)\b/g, (w) => w.toUpperCase())
      .replace(/\b(alsace|haut-rhin|bas-rhin|word|pdf)\b/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  }

  const shorten = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);

  function ensureViewport() {
    if (isFramed) return;
    const existing = document.querySelector('meta[name="viewport"]');
    if (existing) {
      if (existing.dataset.agrx && document.head && existing.parentNode !== document.head) document.head.prepend(existing);
      return;
    }
    (document.head || root).prepend(el('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1', 'data-agrx': '1' }));
  }

  // Polices de la maquette (Inter, Inter Tight) ; repli sur les polices du système
  function ensureFonts() {
    if (!document.head || document.getElementById('agrx-fonts')) return;
    document.head.append(el('link', {
      id: 'agrx-fonts',
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,500;0,600;0,700;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap',
    }));
  }

  /* ---------- Icônes ---------- */
  const ICONS = {
    ne: '<path d="M7 17 17 7M8 7h9v9"/>',
    se: '<path d="M7 7l10 10M17 8v9H8"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  };
  const icon = (n, cls = '') => `<svg class="ax-i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[n]}</svg>`;
  const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="17" cy="17" r="13" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M26.5 26.5 35 35" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/><circle cx="33" cy="9" r="3.2" fill="currentColor"/></svg>';

  /* ---------- Photos (libres de droits, affichées depuis Unsplash et Pexels) ---------- */
  const unsplash = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
  const pexels = (path, w = 2000) => `https://images.pexels.com/photos/${path}?auto=compress&cs=tinysrgb&w=${w}`;
  const IMAGES = {
    hero: { src: pexels('38446229/pexels-photo-38446229/free-photo-of-focused-female-table-tennis-player-in-action.jpeg'), pos: '50% 22%', by: 'Anat Landa' },
    racket: { src: unsplash('1534158914592-062992fbe900'), pos: '78% 30%', by: 'Conor Samuel' },
    hall: { src: unsplash('1761775446030-5e1fdd4166a5', 900), pos: '50% 50%', by: 'Maximilian Bungart' },
    gym: { src: unsplash('1761775446037-f4233aa9b8f3'), pos: '50% 60%', by: 'Maximilian Bungart' },
    ball: { src: unsplash('1636734909254-ff5c43927e10', 1000), pos: '50% 50%', by: 'Nicholas Ismael Martinez' },
    player: { src: unsplash('1659303388053-6078a001ea21'), pos: '50% 22%', by: 'Nathanaël Desmeules' },
    arena: { src: unsplash('1511067007398-7e4b90cfa4bc'), pos: '50% 55%', by: 'Ivan Cortez' },
    club: { src: unsplash('1785947328692-b2747ea7f6b8'), pos: '50% 50%', by: 'Yanhao Fang' },
    paddle: { src: unsplash('1609710228159-0fa9bd7c0827'), pos: '50% 50%', by: 'Lisa Keffer' },
  };
  const CREDITS = [...new Set(Object.values(IMAGES).map((i) => i.by))];
  const photo = (name) => {
    const im = IMAGES[name] || IMAGES.hall;
    return `<img src="${im.src}" alt="" style="object-position:${im.pos}">`;
  };
  const SECTION_VISUAL = { resultats: 'player', classements: 'arena', calendriers: 'gym', clubs: 'club', documents: 'paddle', liens: 'hall' };

  /* =================================================================
     Plan du site : index par Itemid
     ================================================================= */

  const SM = self.AGRX_SITEMAP || { sections: [], pages: {}, links: [] };
  let NAV = [];
  const byItem = new Map();
  function indexSitemap() {
    byItem.clear();
    const walk = (node, trail) => {
      const t = [...trail, node];
      if (node.itemid != null) byItem.set(String(node.itemid), t);
      (node.aliases || []).forEach((a) => byItem.set(String(a), t));
      (node.groups || node.children || []).forEach((c) => walk(c, t));
    };
    SM.sections.forEach((s) => walk(s, []));
    NAV = SM.sections.filter((s) => s.inNav !== false);
  }
  indexSitemap();
  const nodeOf = (itemid) => { const t = byItem.get(String(itemid)); return t ? t[t.length - 1] : null; };
  const itemOf = (h) => (String(h || '').match(/[?&;]Itemid=(\d+)/i) || [])[1] || null;

  /* =================================================================
     Menus du site : suivre les pages ajoutées ou retirées
     Le plan (sitemap.js) donne l'organisation et les textes ; les menus
     du site d'origine sont relus à chaque page, et vérifiés en entier une
     fois par jour, pour ajouter les nouvelles pages et masquer celles qui
     ont disparu, sans attendre une mise à jour de l'extension.
     ================================================================= */

  const MENU_KEY = 'agrx-menu';
  const MENU_TTL = 24 * 3600 * 1000;

  function readMenuCache() {
    try { return JSON.parse(localStorage.getItem(MENU_KEY) || 'null'); } catch { return null; }
  }
  function writeMenuCache(m) {
    try { localStorage.setItem(MENU_KEY, JSON.stringify(m)); } catch { /* stockage bloqué */ }
  }

  // Liens des menus d'une page : { id, label, href, parent, isParent }
  // parent = Itemid du menu principal (rubrique) ou de l'élément de menu parent
  function menuItems(doc) {
    const out = [];
    const read = (li, parent) => {
      const a = li.querySelector(':scope > a');
      const id = a && itemOf(a.getAttribute('href'));
      const label = a ? a.textContent.replace(/\s+/g, ' ').trim() : '';
      if (id && label) out.push({ id, label, href: a.getAttribute('href'), parent, isParent: /\bparent\b/.test(li.className) });
      li.querySelectorAll(':scope > ul > li').forEach((c) => read(c, id || parent));
    };
    const main = doc.querySelector('#ja-mainnav ul.menu');
    let section = 'main';
    if (main) {
      main.querySelectorAll(':scope > li').forEach((li) => read(li, 'main'));
      const active = main.querySelector(':scope > li:is(.active, #current) > a');
      if (active) section = itemOf(active.getAttribute('href')) || 'main';
    }
    doc.querySelectorAll(':is(#ja-col1, [id^="ja-col1"]) ul.menu').forEach((ul) => {
      ul.querySelectorAll(':scope > li').forEach((li) => read(li, section));
    });
    return out;
  }

  function mergeItems(target, items) {
    items.forEach((it) => {
      const prev = target[it.id];
      // Un élément vu dans un sous-menu précis l'emporte sur « menu principal »
      if (!prev || (prev.parent === 'main' && it.parent !== 'main')) target[it.id] = it;
    });
  }

  // Applique au plan les pages trouvées dans les menus (et masque les disparues)
  const GENERIC = /^(accueil|consultation)$/i;
  function applyMenu(seen, complete) {
    const relOf = (url) => {
      try { const u = new URL(href(url), location.href); return (u.pathname + u.search).replace(BASE, ''); } catch { return url; }
    };
    const addOne = (it) => {
      const label = titleCase(it.label);
      const id = Number(it.id);
      if (it.parent === 'main') {
        SM.sections.push({ key: 'item' + it.id, label, itemid: id, href: relOf(it.href), description: '', groups: [] });
        return true;
      }
      const parent = nodeOf(it.parent);
      if (!parent) return false;   // parent pas encore placé : nouvel essai au tour suivant
      const isSection = SM.sections.includes(parent);
      // « Accueil » / « Consultation » d'une sous-rubrique : même page que celle-ci
      if (GENERIC.test(label) && (!isSection || /^accueil$/i.test(label))) {
        (parent.aliases = parent.aliases || []).push(id);
        return true;
      }
      const list = isSection ? (parent.groups = parent.groups || []) : (parent.children = parent.children || []);
      list.push({ label: GENERIC.test(label) ? parent.label : label, itemid: id, href: relOf(it.href), text: '' });
      return true;
    };
    let todo = Object.values(seen).filter((it) => !byItem.has(it.id) && it.id !== '1' && /index\.php/.test(it.href));
    for (let pass = 0; pass < 4 && todo.length; pass++) {
      todo = todo.filter((it) => {
        if (byItem.has(it.id)) return false;
        const placed = addOne(it);
        if (placed) indexSitemap();
        return !placed;
      });
    }

    // Pages du plan absentes des menus du site : masquées (seulement après
    // une vérification complète et réussie, pour ne rien cacher par erreur)
    if (complete) {
      const ids = new Set(Object.keys(seen));
      const alive = (n) => [n.itemid, ...(n.aliases || [])].some((x) => x == null || ids.has(String(x)));
      const prune = (list) => list.filter((n) => {
        if (n.groups) n.groups = prune(n.groups);
        if (n.children) n.children = prune(n.children);
        return alive(n);
      });
      SM.sections.splice(0, SM.sections.length, ...prune(SM.sections));
      indexSitemap();
    }
  }

  // Vérification complète des menus (une fois par jour, en arrière-plan)
  async function crawlMenus() {
    const seen = {};
    const queue = [BASE];
    const done = new Set();
    let errors = 0;
    while (queue.length && done.size < 60) {
      const url = queue.shift();
      if (done.has(url)) continue;
      done.add(url);
      try {
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) { errors++; continue; }
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const items = menuItems(doc);
        mergeItems(seen, items);
        // On ouvre les rubriques du menu principal et les éléments qui ont des sous-pages
        items.forEach((it) => {
          if (it.parent === 'main' || it.isParent) {
            const abs = new URL(it.href, location.href).href;
            if (!done.has(abs)) queue.push(abs);
          }
        });
      } catch { errors++; }
    }
    const ok = !errors && Object.keys(seen).length > 20;
    writeMenuCache({ ts: Date.now(), complete: ok, items: seen });
  }

  function scheduleCrawl(cache) {
    if (cache && Date.now() - cache.ts < MENU_TTL) return;
    const run = () => crawlMenus().catch(() => {});
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 8000 }); else setTimeout(run, 3000);
  }

  function updateSitemapFromMenus() {
    const cache = readMenuCache();
    const seen = { ...(cache && cache.items) };
    mergeItems(seen, menuItems(document));
    applyMenu(seen, !!(cache && cache.complete));
    scheduleCrawl(cache);
  }

  /* ---------- Saison en cours (lue sur le site, mise en cache) ---------- */
  function readSeasonCache() {
    try { return localStorage.getItem('agrx-season') || ''; } catch { return ''; }
  }
  function loadSeason(cb) {
    fetch(BASE + 'AGR/DIVERS/saison.php', { credentials: 'same-origin' })
      .then((r) => r.text())
      .then((t) => {
        const s = (new DOMParser().parseFromString(t, 'text/html').getElementById('annee_saison') || {}).textContent;
        if (s && s.trim()) {
          try { localStorage.setItem('agrx-season', s.trim()); } catch { /* ignore */ }
          cb(s.trim());
        }
      })
      .catch(() => {});
  }

  /* =================================================================
     Lecture de la page d'origine
     ================================================================= */

  function readOriginal() {
    const content = document.getElementById('ja-content');
    const news = [...document.querySelectorAll('.roklatestnews h3.toggler')].map((h) => {
      const box = h.nextElementSibling;
      const a = box && box.querySelector('a.readon');
      const span = box && box.querySelector('span');
      return { title: titleCase(h.textContent), excerpt: sentenceCase((span ? span.textContent : '').trim().replace(/\s+/g, ' ').replace(/\.{3}$/, '…')), href: a ? a.getAttribute('href') : null };
    });
    // Publications de la page (l'accueil peut en afficher plusieurs) : chaque
    // texte avec le titre qui le précède
    const posts = [];
    if (content) {
      let heading = null;
      content.querySelectorAll('.contentheading, .article-content').forEach((n) => {
        if (n.classList.contains('contentheading')) { heading = n; return; }
        posts.push({ heading, article: n });
        heading = null;
      });
    }
    return {
      content,
      posts,
      heading: content && content.querySelector('.contentheading, .componentheading'),
      article: content && content.querySelector('.article-content'),
      iframe: content && content.querySelector('iframe'),
      news,
      login: document.querySelector('.cd_moduletitle_logo a'),
      activeMain: document.querySelector('#ja-mainnav li:is(.active, #current) > a'),
    };
  }

  const OLD_SECTIONS = { annuaires: 'clubs', calendriers: 'calendriers', 'résultats': 'resultats', 'téléchargements': 'documents', liens: 'liens' };

  function pageContext(o) {
    const itemid = param('Itemid');
    const option = param('option');
    const trail = itemid ? byItem.get(itemid) : null;
    const isHome = (!option && !itemid) || itemid === '1' || param('view') === 'frontpage';
    const isNews = !trail && option === 'com_content' && !!(param('catid') || /:/.test(param('id') || ''));
    let section = trail ? trail[0] : null;
    if (!section && o.activeMain) {
      const t = byItem.get(itemOf(o.activeMain.getAttribute('href')));
      section = t ? t[0] : SM.sections.find((s) => s.key === OLD_SECTIONS[o.activeMain.textContent.trim().toLowerCase()]) || null;
    }
    return { itemid, trail, isHome, isNews, section, node: trail ? trail[trail.length - 1] : null, isHub: !!trail && trail.length === 1 };
  }

  const GENERIC_TITLES = /^(consultation|accueil|attachments?)$/i;
  function pageTitle(ctx, o) {
    const info = ctx.itemid && SM.pages[ctx.itemid];
    if (info && info.title) return info.title;
    if (ctx.isHub) return ctx.section.label;
    const h = o.heading && o.heading.textContent.trim();
    if (h && !GENERIC_TITLES.test(h)) return titleCase(h);
    if (ctx.node && param('option') === 'com_wrapper') return ctx.node.label;
    const t = document.title.trim();
    if (t && !GENERIC_TITLES.test(t) && !/^404/.test(t) && !/^Tennis de Table - AGR/i.test(t)) return titleCase(t);
    return ctx.node ? ctx.node.label : 'Tennis de table';
  }

  /* =================================================================
     Gabarits communs (repris de la maquette)
     ================================================================= */

  function contrastTool() {
    return `<span class="ax-chip-ui">Contraste
      <button type="button" class="ax-tool" data-contrast aria-label="Contraste renforcé" title="Contraste renforcé"><svg class="ax-i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor"/></svg></button></span>`;
  }

  function dropHTML(s) {
    const simple = s.groups.every((g) => !(g.children || []).length);
    const cols = simple
      ? `<div class="ax-drop-col"><ul>${s.groups.map((g) => `<li><a href="${link(g)}">${esc(g.label)}</a></li>`).join('')}</ul></div>`
      : s.groups.map((g) => {
        const kids = g.children || [];
        if (!kids.length) return `<div class="ax-drop-col"><ul><li><a href="${link(g)}">${esc(g.label)}</a></li></ul></div>`;
        return `<div class="ax-drop-col"><h3><a href="${link(g)}">${esc(g.label)}</a></h3>
          ${kids.length > 4 ? `<div class="ax-pills">${kids.map((k) => `<a class="ax-pill" href="${link(k)}">${esc(k.label)}</a>`).join('')}</div>`
            : `<ul>${kids.map((k) => `<li><a href="${link(k)}">${esc(k.label)}</a></li>`).join('')}</ul>`}</div>`;
      }).join('');
    return `<div class="ax-drop" id="ax-drop-${s.key}" hidden>
      <div class="ax-drop-head"><h2>${esc(s.label)}</h2><a class="ax-more" href="${link(s)}">Toute la rubrique ${icon('ne')}</a></div>
      <div class="ax-drop-cols">${cols}</div>
    </div>`;
  }

  function headHTML(ctx) {
    const links = [`<a class="ax-nav-link ${ctx.isHome ? 'ax-on' : ''}" href="${esc(BASE)}" ${ctx.isHome ? 'aria-current="page"' : ''}>Accueil</a>`];
    NAV.forEach((s) => {
      const on = ctx.section === s ? 'ax-on' : '';
      links.push(s.groups.length
        ? `<button type="button" class="ax-nav-link ${on}" aria-expanded="false" aria-controls="ax-drop-${s.key}">${esc(s.label)}${icon('down', 'ax-chev')}</button>`
        : `<a class="ax-nav-link ${on}" href="${link(s)}" ${on ? 'aria-current="page"' : ''}>${esc(s.label)}</a>`);
    });
    const club = nodeOf(6);
    return `<header class="ax-head">
      <div class="ax-wrap">
        <div class="ax-head-l">
          <a class="ax-logo" href="${esc(BASE)}" aria-label="AGR Tennis de Table – accueil">${LOGO}<b>AGR</b></a>
          ${contrastTool()}
        </div>
        <nav class="ax-nav" aria-label="Menu principal">${links.join('')}</nav>
        <div class="ax-head-r">
          ${club ? `<a class="ax-btn ax-cta" href="${link(club)}">Trouver un club</a>` : ''}
          <button type="button" class="ax-btn ax-menu-btn" aria-expanded="false" aria-controls="ax-sheet">${icon('menu')}Menu</button>
        </div>
      </div>
      ${NAV.filter((s) => s.groups.length).map(dropHTML).join('')}
    </header>`;
  }

  function sheetHTML() {
    const parts = [`<a class="ax-sheet-link" href="${esc(BASE)}">Accueil ${icon('right')}</a>`];
    SM.sections.forEach((s) => {
      if (!s.groups.length) { parts.push(`<a class="ax-sheet-link" href="${link(s)}">${esc(s.label)} ${icon('right')}</a>`); return; }
      const sub = [`<a href="${link(s)}"><b>Toute la rubrique</b></a>`];
      s.groups.forEach((g) => {
        sub.push(`<a href="${link(g)}">${esc(g.label)}</a>`);
        (g.children || []).forEach((k) => sub.push(`<a class="ax-child" href="${link(k)}">${esc(k.label)}</a>`));
      });
      parts.push(`<details><summary>${esc(s.label)} ${icon('down', 'ax-chev')}</summary><div class="ax-sheet-sub">${sub.join('')}</div></details>`);
    });
    return `<div class="ax-sheet" id="ax-sheet" role="dialog" aria-modal="true" aria-label="Menu" hidden>
      <div class="ax-sheet-top"><a class="ax-logo" href="${esc(BASE)}">${LOGO}<b>AGR</b></a><button type="button" class="ax-btn ax-close">${icon('close')}Fermer</button></div>
      <div class="ax-sheet-body">
        <nav aria-label="Menu principal">${parts.join('')}</nav>
        <div class="ax-sheet-tools">${contrastTool()}<button type="button" class="ax-link-ui" data-login>Espace privé</button></div>
      </div>
    </div>`;
  }

  function footerHTML(season) {
    return `<footer class="ax-footer"><div class="ax-wrap"><div class="ax-footer-box">
      <p class="ax-footer-big"><em>Tennis de table</em>Haut-Rhin</p>
      <div class="ax-footer-cols">
        <div><a class="ax-logo" href="${esc(BASE)}" style="color:inherit">${LOGO}<b>AGR</b></a>
          <p style="margin-top:12px">Section haut-rhinoise de tennis de table de l’Avant-Garde du Rhin.</p></div>
        <div><h2>Rubriques</h2><ul>${SM.sections.map((s) => `<li><a href="${link(s)}">${esc(s.label)}</a></li>`).join('')}</ul></div>
        <div><h2>Liens utiles</h2><ul>${SM.links.map((l) => `<li><a href="${esc(l.href)}" ${/^http/.test(l.href) ? 'target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a></li>`).join('')}</ul></div>
      </div>
      <div class="ax-footer-bottom"><span>AGR – Section du Haut-Rhin de Tennis de Table<span data-season-foot>${season ? ' · Saison ' + esc(season) : ''}</span></span><button type="button" class="ax-link-ui" data-login style="color:inherit">Espace privé</button></div>
      <p class="ax-credits">Photos : ${CREDITS.map(esc).join(', ')}, sur <a href="https://unsplash.com" target="_blank" rel="noopener" style="color:inherit">Unsplash</a> et <a href="https://www.pexels.com" target="_blank" rel="noopener" style="color:inherit">Pexels</a>.</p>
    </div></div></footer>`;
  }

  /* =================================================================
     Accueil
     ================================================================= */

  const TAB_VISUAL = { resultats: 'player', classements: 'arena', calendriers: 'gym', clubs: 'club', documents: 'paddle' };
  const EMPH = {
    resultats: 'Les <em>résultats</em> de la saison',
    classements: 'Les <em>classements</em> par poule',
    calendriers: 'Les <em>calendriers</em> des compétitions',
    clubs: 'Les <em>clubs</em> et les joueurs',
    documents: 'Les <em>documents</em> à télécharger',
  };

  function finderHTML() {
    const tabs = NAV.map((s, i) => `<button type="button" class="ax-tabbtn" role="tab" id="ax-tab-${s.key}" aria-controls="ax-panel-${s.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(s.label)}${icon('right')}</button>`).join('');
    const panels = NAV.map((s, i) => {
      const subs = s.groups.length ? s.groups : [s];
      return `<div class="ax-tabpanel" role="tabpanel" id="ax-panel-${s.key}" aria-labelledby="ax-tab-${s.key}" ${i ? 'hidden' : ''}>
        <span class="ax-tag">Rubrique</span>
        <h3>${EMPH[s.key] || esc(s.label)}</h3>
        <p>${esc(s.description)}</p>
        <ul class="ax-sublinks">${subs.map((g) => `<li><a href="${link(g)}">${esc(g === s ? 'Ouvrir la page' : g.label)}${icon('right')}</a></li>`).join('')}</ul>
        <a class="ax-more" href="${link(s)}">Toute la rubrique ${icon('ne')}</a>
      </div>`;
    }).join('');
    return `<div class="ax-finder">
      <div class="ax-tablist" role="tablist" aria-label="Rubriques">${tabs}</div>
      <figure class="ax-photo ax-finder-photo" data-finder-photo>${photo(TAB_VISUAL[NAV[0].key])}</figure>
      <div>${panels}</div>
    </div>`;
  }

  function homeHTML(o, season) {
    // Tout vient du module « Actualités » du site : les 2 plus récentes en
    // « À ne pas manquer », les suivantes en cartes
    const soon = o.news.slice(0, 2);
    const cards = o.news.slice(2, 11);
    const newsLink = (n) => (n.href ? `href="${esc(n.href)}"` : '');
    const DATE = /\b\d{1,2}[/.]\d{1,2}([/.]\d{2,4})?\b|\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i;
    const extraPosts = o.posts.slice(1).map((p, i) => `<article class="ax-card ax-card-post" data-post="${i + 1}"><span class="ax-tag">Publication</span></article>`).join('');
    return `
    <section class="ax-hero" aria-labelledby="ax-h1">
      <div class="ax-wrap">
        <div class="ax-hero-top">
          <h1 class="ax-display" id="ax-h1"><em>Tennis de table</em>Haut-Rhin</h1>
          <div class="ax-hero-side">
            <p>La section haut-rhinoise de l’Avant-Garde du Rhin.<span data-season-hero>${season ? ' Saison ' + esc(season) + '.' : ''}</span></p>
          </div>
        </div>
        <figure class="ax-photo ax-hero-photo">${`<img src="${IMAGES.hero.src}" alt="" style="object-position:${IMAGES.hero.pos}">`}</figure>
      </div>
    </section>

    <section class="ax-section" aria-labelledby="ax-about-title">
      <div class="ax-wrap ax-about">
        <figure class="ax-photo ax-about-a">${photo('racket')}</figure>
        <div class="ax-about-text">
          <span class="ax-tag">À propos</span>
          <h2 id="ax-about-title">Toute la saison du tennis de table haut-rhinois, au même endroit</h2>
          <p>Calendriers, résultats et classements du championnat, des individuels et des coupes, ainsi que les coordonnées des clubs et la fiche de chaque joueur.</p>
          <a class="ax-more" href="#ax-finder-title">Que trouver sur le site ${icon('se')}</a>
        </div>
        <figure class="ax-photo ax-about-b">${photo('hall')}</figure>
        ${soon.length ? `<div class="ax-why">
          <h2>À ne pas manquer</h2>
          <ul>${soon.map((n) => `<li><a ${newsLink(n)}><span><b>${esc(n.title)}</b><span>${esc(shorten(n.excerpt, 120))}</span></span>${icon(DATE.test(n.excerpt) ? 'cal' : 'file')}</a></li>`).join('')}</ul>
        </div>` : ''}
      </div>
    </section>

    <section class="ax-section" aria-labelledby="ax-finder-title">
      <div class="ax-wrap">
        <div class="ax-center">
          <span class="ax-tag">Rubriques</span>
          <h2 id="ax-finder-title">Que cherchez-vous&nbsp;?</h2>
          <p>Choisissez une rubrique pour voir toutes ses pages.</p>
        </div>
        ${finderHTML()}
      </div>
    </section>

    <section class="ax-section" aria-labelledby="ax-news-title">
      <div class="ax-wrap">
        <div class="ax-center"><span class="ax-tag">Actualités</span><h2 id="ax-news-title">Les dernières nouvelles</h2></div>
        <div class="ax-news">
          <article class="ax-card ax-card-feature" data-featured>
            <figure class="ax-photo">${photo('ball')}</figure>
            <div class="ax-feature-host"><span class="ax-tag">À la une</span></div>
          </article>
          ${extraPosts}
          ${cards.map((n) => `<a class="ax-card" ${newsLink(n)}><span class="ax-tag">Actualité</span><h3>${esc(n.title)}</h3><p>${esc(shorten(n.excerpt, 150))}</p>${n.href ? `<span class="ax-more">Lire ${icon('ne')}</span>` : ''}</a>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* =================================================================
     Pages intérieures
     ================================================================= */

  // « Classement des équipes » → « <em>Classement</em> des équipes »
  const displayTitle = (t) => {
    const [first, ...rest] = String(t).split(' ');
    return `<em>${esc(first)}</em>${rest.length ? ' ' + esc(rest.join(' ')) : ''}`;
  };

  function pageHeadHTML(ctx, title, help, visual) {
    const crumbs = [`<a href="${esc(BASE)}">Accueil</a>`];
    if (ctx.trail) ctx.trail.slice(0, -1).forEach((n) => crumbs.push(`<a href="${link(n)}">${esc(n.label)}</a>`));
    else if (ctx.isNews) crumbs.push('<span>Actualités</span>');
    else if (ctx.section) crumbs.push(`<a href="${link(ctx.section)}">${esc(ctx.section.label)}</a>`);
    crumbs.push(`<span aria-current="page">${esc(title)}</span>`);

    let subnav = '';
    const s = ctx.section;
    if (s && s.groups.length && ctx.trail && ctx.trail.length > 1) {
      const pill = (n, on) => `<a class="ax-pill" href="${link(n)}" ${on ? 'aria-current="page"' : ''}>${esc(n.label)}</a>`;
      subnav = `<nav class="ax-subnav" aria-label="Pages de la rubrique ${esc(s.label)}"><div class="ax-pills">${s.groups.map((g) => pill(g, ctx.trail[1] === g)).join('')}</div>`;
      for (let d = 1; d < ctx.trail.length; d++) {
        const kids = ctx.trail[d].children || [];
        if (!kids.length) break;
        subnav += `<div class="ax-pills">${kids.map((k) => pill(k, ctx.trail[d + 1] === k)).join('')}</div>`;
      }
      subnav += '</nav>';
    }
    return `<section class="ax-pagehead"><div class="ax-wrap">
      <nav class="ax-crumbs" aria-label="Vous êtes ici">${crumbs.join('<span aria-hidden="true">/</span>')}</nav>
      <div class="ax-pagehead-grid">
        <h1 class="ax-display ${title.length > 30 ? 'ax-display-long' : ''}">${displayTitle(title)}</h1>
        ${help ? `<p class="ax-help">${icon('info')}<span>${esc(help)}</span></p>` : '<span></span>'}
      </div>
      <figure class="ax-photo">${photo(visual)}</figure>
      ${subnav}
    </div></section>`;
  }

  function hubRowsHTML(s) {
    return `<ul class="ax-rows">${s.groups.map((g, i) => {
      const kids = g.children || [];
      return `<li class="ax-row">
        <span class="ax-row-num">0${i + 1}</span>
        <div><h3><a href="${link(g)}">${esc(g.label)}</a></h3><p>${esc(g.text || '')}</p></div>
        <div class="ax-pills">${kids.length ? kids.map((k) => `<a class="ax-pill" href="${link(k)}">${esc(k.label)}</a>`).join('') : `<a class="ax-more" href="${link(g)}">Ouvrir ${icon('ne')}</a>`}</div>
      </li>`;
    }).join('')}</ul>`;
  }

  function pageHTML(ctx, title) {
    const info = ctx.itemid && SM.pages[ctx.itemid];
    const help = info && info.help ? info.help : (ctx.isHub ? ctx.section.description : '');
    const visual = ctx.isNews ? 'racket' : (ctx.section && SECTION_VISUAL[ctx.section.key]) || 'hall';
    return `${pageHeadHTML(ctx, title, help, visual)}
      <div class="ax-page"><div class="ax-wrap" data-content-host></div></div>`;
  }

  /* ---------- Rangement du contenu d'origine ---------- */

  function hasSubstance(node) {
    if (!node) return false;
    if (node.querySelector('iframe, .attachmentsList tr, img, input, select')) return true;
    return node.textContent.replace(/[\s ]/g, '').length > 0;
  }

  function cleanArticle(article) {
    article.querySelectorAll(':is(p, div, h1, h2, h3, span)').forEach((n) => {
      if (isBlank(n.textContent) && !n.querySelector('img, iframe, table, input, select, a[href], hr')) n.classList.add('agrx-hidden');
    });
    article.querySelectorAll('.attachmentsList:empty, .attachmentsContainer:not(:has(tr))').forEach((n) => n.classList.add('agrx-hidden'));
    article.querySelectorAll('.attachmentsList caption').forEach((c) => { c.textContent = 'Documents à télécharger'; });
    article.querySelectorAll('.attachmentsList td.at_description').forEach((td) => {
      if (isBlank(td.textContent.replace(/[[\]]/g, ''))) td.classList.add('agrx-hidden');
    });
    article.querySelectorAll('[title^="Download this file"]').forEach((n) => { n.title = n.title.replace('Download this file', 'Télécharger le fichier'); });
    article.querySelectorAll('img[alt^="Download this file"]').forEach((img) => { img.alt = ''; });

    // Titre saisi en tête d'article : déjà affiché dans le bandeau
    const first = [...article.children].find((c) => !c.classList.contains('agrx-hidden'));
    if (first && first.tagName === 'H1' && first.textContent.trim().length < 80) {
      first.classList.add('agrx-hidden');
      if (first.nextElementSibling && first.nextElementSibling.tagName === 'HR') first.nextElementSibling.classList.add('agrx-hidden');
    }

    // Lignes « icône cliquable + texte » : le texte devient aussi un lien
    article.querySelectorAll('tr').forEach((tr) => {
      const links = [...tr.querySelectorAll('a[href]')];
      if (links.length !== 1 || !links[0].querySelector('img') || !isBlank(links[0].textContent)) return;
      const cell = [...tr.cells].find((td) => !td.contains(links[0]) && !isBlank(td.textContent));
      if (!cell) return;
      const a = el('a', { href: links[0].getAttribute('href'), class: 'agrx-rowlink' });
      if (links[0].target) a.target = links[0].target;
      while (cell.firstChild) a.append(cell.firstChild);
      if (a.firstChild && a.firstChild.nodeType === Node.TEXT_NODE) a.firstChild.textContent = a.firstChild.textContent.replace(/^[\s ]+/, '');
      cell.append(a);
    });
  }

  function panel(inner) {
    const p = el('section', { class: 'ax-panel' });
    if (typeof inner === 'string') p.innerHTML = inner; else p.append(inner);
    return p;
  }

  function fillContent(host, ctx, o) {
    const parts = [];

    if (ctx.isHub && ctx.section.groups.length) {
      const block = el('div');
      block.innerHTML = `<div class="ax-lefthead"><span class="ax-tag">Rubrique</span><h2>${esc(ctx.section.question || 'Choisissez une page')}</h2></div>${hubRowsHTML(ctx.section)}`;
      parts.push(block);
    }

    const kids = !ctx.isHub && ctx.node ? (ctx.node.children || []) : [];
    if (kids.length) {
      const p = panel(`<h2>${esc(ctx.node.question || 'Choisissez une page')}</h2>
        <div class="ax-pills">${kids.map((k) => `<a class="ax-pill" href="${link(k)}">${esc(k.label)}</a>`).join('')}</div>`);
      p.classList.add('ax-choose');
      parts.push(p);
    }

    if (o.iframe) {
      o.iframe.removeAttribute('height');
      o.iframe.removeAttribute('onload');
      parts.push(panel(o.iframe));
    }

    // Un ou plusieurs textes (une liste de publications en affiche plusieurs)
    const many = o.posts.length > 1;
    o.posts.forEach((post) => {
      cleanArticle(post.article);
      if (!hasSubstance(post.article)) return;
      const p = panel(post.article);
      if (many && post.heading) p.insertAdjacentHTML('afterbegin', `<h2>${esc(titleCase(post.heading.textContent))}</h2>`);
      if (ctx.isNews) p.insertAdjacentHTML('afterbegin', '<span class="ax-tag">Actualité</span>');
      else if (!many && parts.length) p.insertAdjacentHTML('afterbegin', '<h2>Informations</h2>');
      parts.push(p);
    });

    if (!parts.length) parts.push(panel('<p class="ax-empty">Aucune information n’est disponible pour le moment sur cette page.</p>'));
    if (ctx.isNews) {
      const back = el('p');
      back.innerHTML = `<a class="ax-more" href="${esc(BASE)}">Toutes les actualités ${icon('ne')}</a>`;
      parts.push(back);
    }
    host.append(...parts);
  }

  function fillFeatured(app, o) {
    const card = app.querySelector('[data-featured]');
    const host = card && card.querySelector('.ax-feature-host');
    if (!host) return;
    const [first, ...others] = o.posts;
    if (!first) { card.classList.add('agrx-hidden'); return; }
    const fill = (box, p) => {
      if (p.heading) box.append(el('h3', {}, titleCase(p.heading.textContent)));
      cleanArticle(p.article);
      box.append(p.article);
    };
    fill(host, first);
    others.forEach((p, i) => {
      const box = app.querySelector(`[data-post="${i + 1}"]`);
      if (box) fill(box, p);
    });
  }

  /* =================================================================
     Interactions
     ================================================================= */

  function wire(app, o) {
    // Réglages, connexion
    app.addEventListener('click', (e) => {
      if (e.target.closest('[data-contrast]')) save({ contrast: !settings.contrast });
      if (e.target.closest('[data-login]')) {
        if (!sheet.hidden) setSheet(false);
        if (o.login) o.login.click(); else location.href = BASE + 'index.php?option=com_user&view=login';
      }
    });
    syncTools();

    // Sous-menus de l'en-tête
    const navBtns = [...app.querySelectorAll('.ax-nav button.ax-nav-link')];
    const closeDrops = (except) => navBtns.forEach((b) => {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls')).hidden = true;
    });
    navBtns.forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = b.getAttribute('aria-expanded') !== 'true';
      closeDrops(b);
      b.setAttribute('aria-expanded', String(open));
      document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
    }));
    document.addEventListener('click', (e) => { if (!e.target.closest('.ax-drop')) closeDrops(); });

    // Menu mobile
    const sheet = document.getElementById('ax-sheet');
    const menuBtn = app.querySelector('.ax-menu-btn');
    const setSheet = (open) => {
      sheet.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      (open ? sheet.querySelector('.ax-close') : menuBtn).focus();
    };
    menuBtn.addEventListener('click', () => setSheet(true));
    sheet.querySelector('.ax-close').addEventListener('click', () => setSheet(false));
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!sheet.hidden) setSheet(false);
      closeDrops();
    });

    // Onglets « Que cherchez-vous ? »
    const tabs = [...app.querySelectorAll('.ax-tabbtn')];
    const ph = app.querySelector('[data-finder-photo]');
    const select = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (ph) ph.innerHTML = photo(TAB_VISUAL[t.id.replace('ax-tab-', '')]);
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
  }

  function syncTools() {
    document.querySelectorAll('#agrx-app [data-contrast]').forEach((b) =>
      b.setAttribute('aria-pressed', String(!!settings.contrast)));
  }

  function buildSite() {
    try { updateSitemapFromMenus(); } catch (err) { console.warn('[AGR Confort] menus', err); }
    const o = readOriginal();
    const ctx = pageContext(o);
    const title = ctx.isHome ? '' : pageTitle(ctx, o);
    const season = readSeasonCache();

    const app = el('div', { id: 'agrx-app' });
    app.innerHTML = `<a class="ax-skip" href="#ax-main">Aller au contenu</a>
      ${headHTML(ctx)}
      <main id="ax-main" tabindex="-1">${ctx.isHome ? homeHTML(o, season) : pageHTML(ctx, title)}</main>
      ${footerHTML(season)}
      ${sheetHTML()}`;

    let scope;
    if (ctx.isHome) {
      fillFeatured(app, o);
      scope = app.querySelector('[data-featured]');
      document.title = 'AGR Tennis de Table – Haut-Rhin';
    } else {
      scope = app.querySelector('[data-content-host]');
      fillContent(scope, ctx, o);
      document.title = `${title} – AGR Tennis de Table Haut-Rhin`;
    }

    const loginBtn = document.getElementById('cd_login_loginbutton');
    if (loginBtn && !loginBtn.value) loginBtn.value = 'Se connecter';
    document.querySelectorAll('#ja-col1 iframe, [id^="ja-col1"] iframe').forEach((f) => f.remove());

    document.body.prepend(app);
    wire(app, o);

    loadSeason((s) => {
      app.querySelectorAll('[data-season-hero]').forEach((n) => { n.textContent = ' Saison ' + s + '.'; });
      app.querySelectorAll('[data-season-foot]').forEach((n) => { n.textContent = ' · Saison ' + s; });
    });
    return scope;
  }

  /* =================================================================
     Améliorations communes
     ================================================================= */

  function buildBackToTop() {
    if (isFramed || document.querySelector('.agrx-top')) return;
    const btn = el('button', { type: 'button', class: 'agrx-top', 'aria-label': 'Revenir en haut de la page' });
    btn.append(el('span', { 'aria-hidden': 'true' }, '↑'), document.createTextNode(' Haut'));
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    document.body.append(btn);
    const onScroll = () => btn.classList.toggle('agrx-top-visible', window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Menus en cascade (survol) → étapes à déplier */
  function setOpen(li, open) {
    li.classList.toggle('agrx-open', open);
    const a = li.querySelector(':scope > a');
    if (a) a.setAttribute('aria-expanded', String(open));
    if (!open) li.querySelectorAll('li.agrx-open').forEach((x) => setOpen(x, false));
  }
  function autoOpen(ul) {
    let level = ul;
    while (level) {
      const branches = level.querySelectorAll(':scope > li.agrx-branch');
      const leaves = level.querySelectorAll(':scope > li.agrx-leaf');
      if (branches.length !== 1 || leaves.length) break;
      setOpen(branches[0], true);
      level = branches[0].querySelector(':scope > ul');
    }
  }
  function toggleBranch(li) {
    const open = !li.classList.contains('agrx-open');
    if (open) li.parentElement.querySelectorAll(':scope > li.agrx-open').forEach((x) => x !== li && setOpen(x, false));
    setOpen(li, open);
    if (open) autoOpen(li.querySelector(':scope > ul'));
  }
  function buildAccordions() {
    document.querySelectorAll('ul.adxm').forEach((menu) => {
      if (menu.dataset.agrx) return;
      menu.dataset.agrx = '1';
      menu.querySelectorAll('li').forEach((li) => {
        const a = li.querySelector(':scope > a');
        if (!a) return;
        if (li.querySelector(':scope > ul')) {
          li.classList.add('agrx-branch');
          a.setAttribute('role', 'button');
          a.setAttribute('aria-expanded', 'false');
          a.tabIndex = 0;
          a.addEventListener('click', (e) => { e.preventDefault(); toggleBranch(li); });
        } else if (a.hasAttribute('onclick') || a.hasAttribute('href')) {
          li.classList.add('agrx-leaf');
          if (!a.hasAttribute('href')) { a.setAttribute('role', 'button'); a.tabIndex = 0; }
        } else {
          li.classList.add('agrx-label');
          return;
        }
        if (!a.hasAttribute('href')) {
          a.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); }
          });
        }
      });
      autoOpen(menu);
    });
  }

  /* Tableaux larges : défilement horizontal */
  function wrapTables(scope) {
    if (!scope) return;
    scope.querySelectorAll('table').forEach((table) => {
      if (table.parentElement.closest('table')) return;
      if (table.closest('.attachmentsList, .agrx-scroll, #highslide-html-loginform')) return;
      const hint = el('div', { class: 'agrx-scroll-hint', 'aria-hidden': 'true' }, '↔ Faites glisser le tableau pour tout voir');
      const wrap = el('div', { class: 'agrx-scroll' });
      table.parentNode.insertBefore(hint, table);
      table.parentNode.insertBefore(wrap, table);
      wrap.append(table);
      const check = () => wrap.classList.toggle('agrx-scrollable', wrap.scrollWidth > wrap.clientWidth + 4);
      new ResizeObserver(check).observe(wrap);
    });
  }

  /* Zones de texte (adresses, contacts) : affichées en entier */
  function autoGrowTextareas() {
    document.querySelectorAll('textarea').forEach((t) => {
      const grow = () => {
        t.style.setProperty('height', 'auto');
        t.style.setProperty('height', t.scrollHeight + 6 + 'px', 'important');
      };
      t.classList.add('agrx-autogrow');
      grow();
      if (!t.dataset.agrxGrow) { t.dataset.agrxGrow = '1'; t.addEventListener('input', grow); }
    });
  }

  /* Taille minimale du texte et couleurs trop pâles */
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'BR', 'HR', 'IMG', 'IFRAME', 'OPTION', 'svg', 'path']);
  function enforceMinFont(scope) {
    if (!scope) return;
    const base = parseFloat(getComputedStyle(root).fontSize) || 18;
    const min = base * 0.8;
    scope.querySelectorAll('*').forEach((node) => {
      if (SKIP_TAGS.has(node.tagName) || node.closest('svg')) return;
      const fs = parseFloat(getComputedStyle(node).fontSize);
      if (fs && fs < min - 0.2) node.style.setProperty('font-size', '0.85rem', 'important');
    });
  }
  function luminance([r, g, b]) {
    const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const contrastOnLight = (rgb) => 1.05 / (luminance(rgb) + 0.05);
  function fixLowContrast(scope) {
    if (!scope) return;
    scope.querySelectorAll('[style*="color"], font[color]').forEach((node) => {
      if (/background/i.test(node.getAttribute('style') || '') || node.closest('.ax-card-feature')) return;
      const m = getComputedStyle(node).color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return;
      let rgb = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (contrastOnLight(rgb) >= 4.5) return;
      for (let i = 0; i < 30 && contrastOnLight(rgb) < 4.5; i++) rgb = rgb.map((v) => v * 0.9);
      node.style.setProperty('color', `rgb(${rgb.map(Math.round).join(',')})`, 'important');
    });
  }

  let contentScope = null;
  function refreshSizes() {
    if (isApp) {
      enforceMinFont(document.body);
      autoGrowTextareas();
    } else {
      enforceMinFont(contentScope);
    }
  }

  /* Cadres intégrés : hauteur automatique */
  function autoHeight() {
    let frame = null;
    try { frame = window.frameElement; } catch { return; }
    if (!frame || frame.tagName !== 'IFRAME') return;
    const fit = () => {
      const b = document.body;
      if (!b) return;
      const cs = getComputedStyle(b);
      const h = Math.ceil(b.scrollHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom)) + 4;
      if (h > 20) {
        frame.style.setProperty('height', h + 'px', 'important');
        frame.setAttribute('scrolling', 'no');
      }
    };
    fit();
    new ResizeObserver(fit).observe(document.body);
    window.addEventListener('load', fit);
    // Après un choix dans un formulaire, remonter en haut du cadre
    try {
      const r = frame.getBoundingClientRect();
      if (r.top < 0) window.parent.scrollBy({ top: r.top - 40, left: 0, behavior: 'auto' });
    } catch { /* autre origine */ }
  }

  /* =================================================================
     Démarrage
     ================================================================= */

  function enhance() {
    domReady = true;
    if (!settings.enabled) return;
    ensureViewport();
    ensureFonts();

    if (isApp) {
      buildAccordions();
      wrapTables(document.body);
      fixLowContrast(document.body);
      if (isFramed) autoHeight(); else buildBackToTop();
    } else if (isSite) {
      try {
        contentScope = buildSite();
        wrapTables(contentScope);
        fixLowContrast(contentScope);
        buildAccordions();
        buildBackToTop();
      } catch (err) {
        // En cas de souci, on réaffiche la page d'origine plutôt qu'une page vide
        root.classList.remove('agrx-site');
        console.error('[AGR Confort]', err);
      }
    }
    refreshSizes();
    window.addEventListener('load', refreshSizes, { once: true });
  }

  if (settings.enabled) ensureViewport();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance, { once: true });
  else enhance();
})();
