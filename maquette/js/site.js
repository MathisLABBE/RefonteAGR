/* AGR Tennis de Table – maquette « beige & vert forêt »
   Construit les parties communes (en-tête, sous-menus, menu mobile,
   bandeau des pages, onglets, « Que cherchez-vous ? », pied de page)
   à partir du plan du site (sitemap.js), et dessine les visuels.
   Ce même code sera repris dans l'extension. */
(() => {
  'use strict';

  const app = document.getElementById('agrx-app');
  const SM = self.AGRX_SITEMAP;
  const NAV = SM.sections.filter((s) => s.inNav !== false);
  const SEASON = '2026-2027';

  // Pages présentes dans la maquette (les autres liens sont inactifs)
  const LOCAL = { home: 'index.html', 43: 'resultats.html', 47: 'classement.html', 110: 'documents.html' };
  const link = (n) => LOCAL[n.itemid] || '#';
  const demo = (n) => (LOCAL[n.itemid] ? '' : ' data-demo title="Page non incluse dans la maquette"');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICONS = {
    ne: '<path d="M7 17 17 7M8 7h9v9"/>',
    se: '<path d="M7 7l10 10M17 8v9H8"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/>',
    dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    pin: '<path d="M19 10c0 5.5-7 11-7 11s-7-5.5-7-11a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  };
  const icon = (n, cls = '') => `<svg class="ax-i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[n]}</svg>`;

  /* =================================================================
     Images (illustration fournie + images « low poly » générées)
     ================================================================= */
  // Photos libres de droits (licence Unsplash), affichées depuis Unsplash
  const unsplash = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
  const IMAGES = {
    table: { src: 'img/match.webp', pos: '50% 60%' },   // illustration fournie : deux joueurs à la table (accueil)
    racket: { src: unsplash('1534158914592-062992fbe900'), pos: '78% 30%', by: 'Conor Samuel' },
    hall: { src: unsplash('1761775446030-5e1fdd4166a5', 900), pos: '50% 50%', by: 'Maximilian Bungart' },
    gym: { src: unsplash('1761775446037-f4233aa9b8f3'), pos: '50% 60%', by: 'Maximilian Bungart' },
    ball: { src: unsplash('1636734909254-ff5c43927e10', 1000), pos: '50% 50%', by: 'Nicholas Ismael Martinez' },
    player: { src: unsplash('1659303388053-6078a001ea21'), pos: '50% 22%', by: 'Nathanaël Desmeules' },
    arena: { src: unsplash('1511067007398-7e4b90cfa4bc'), pos: '50% 55%', by: 'Ivan Cortez' },
    club: { src: unsplash('1785947328692-b2747ea7f6b8'), pos: '50% 50%', by: 'Yanhao Fang' },
    paddle: { src: unsplash('1609710228159-0fa9bd7c0827'), pos: '50% 50%', by: 'Lisa Keffer' },
  };
  // Grande image de l'accueil : choix à comparer (maquette uniquement)
  // Photos libres de droits (licence Pexels), affichées depuis Pexels
  const pexels = (path, w = 2000) => `https://images.pexels.com/photos/${path}?auto=compress&cs=tinysrgb&w=${w}`;
  const HERO_CHOICES = [
    { key: 'illustration', label: 'Illustration', ...IMAGES.table },
    { key: 'tournoi', label: 'Tournoi', src: pexels('38446269/pexels-photo-38446269/free-photo-of-intense-table-tennis-competition-in-indoor-arena.jpeg'), pos: '50% 45%', by: 'Anat Landa' },
    { key: 'salle', label: 'Salle de compétition', src: pexels('38446271/pexels-photo-38446271/free-photo-of-indoor-table-tennis-match-in-modern-venue.jpeg'), pos: '50% 60%', by: 'Anat Landa' },
    { key: 'joueuse', label: 'Joueuse', src: pexels('38446229/pexels-photo-38446229/free-photo-of-focused-female-table-tennis-player-in-action.jpeg'), pos: '50% 22%', by: 'Anat Landa' },
    { key: 'service', label: 'Service', src: pexels('32843102/pexels-photo-32843102/free-photo-of-close-up-action-shot-of-table-tennis-serve.jpeg'), pos: '50% 40%', by: 'Oliver Wagenblatt' },
    { key: 'photo3', label: 'Joueur', src: unsplash('1518928286447-dc161b7cd6fb', 2000), pos: '50% 30%', by: 'Marcus Clark' },
    { key: 'photo1', label: 'Vue du dessus', src: unsplash('1630610280030-da8fbc7ca25a', 2000), pos: '50% 50%', by: 'Jure Zakotnik' },
    { key: 'photo2', label: 'Raquette', src: unsplash('1580420015418-dc24a2fa2b95', 2000), pos: '50% 60%', by: 'Ben Sauer' },
  ];
  // Image retenue pour l'accueil (pour revenir à l'illustration : 'illustration')
  const HERO_KEY = 'joueuse';
  const HERO = HERO_CHOICES.find((h) => h.key === HERO_KEY) || HERO_CHOICES[0];
  const heroImg = () => `<img src="${HERO.src}" alt="" style="object-position:${HERO.pos}">`;

  // Crédits : uniquement les photos réellement affichées
  const USED = ['racket', 'hall', 'gym', 'ball', 'player', 'arena', 'club', 'paddle'].map((k) => IMAGES[k]).concat(HERO);
  const CREDITS = [...new Set(USED.map((i) => i.by).filter(Boolean))];
  const scene = (name) => {
    const im = IMAGES[name] || IMAGES.table;
    return `<img src="${im.src}" alt="" style="object-position:${im.pos}">`;
  };

  /* =================================================================
     En-tête, sous-menus, menu mobile, pied de page
     ================================================================= */
  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="17" cy="17" r="13" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M26.5 26.5 35 35" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/><circle cx="33" cy="9" r="3.2" fill="currentColor"/></svg>`;

  function contrastTool() {
    return `<span class="ax-chip-ui">Contraste
      <button type="button" class="ax-tool" data-contrast aria-label="Contraste renforcé" title="Contraste renforcé"><svg class="ax-i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor"/></svg></button></span>`;
  }

  function dropHTML(s) {
    const cols = s.groups.map((g) => {
      const kids = g.children || [];
      if (!kids.length) return `<div class="ax-drop-col"><ul><li><a href="${link(g)}"${demo(g)}>${esc(g.label)}</a></li></ul></div>`;
      return `<div class="ax-drop-col"><h3><a href="${link(g)}"${demo(g)}>${esc(g.label)}</a></h3>
        ${kids.length > 4 ? `<div class="ax-pills">${kids.map((k) => `<a class="ax-pill" href="${link(k)}"${demo(k)}>${esc(k.label)}</a>`).join('')}</div>`
          : `<ul>${kids.map((k) => `<li><a href="${link(k)}"${demo(k)}>${esc(k.label)}</a></li>`).join('')}</ul>`}</div>`;
    });
    // Rubriques sans sous-groupes : liste simple
    const simple = s.groups.every((g) => !(g.children || []).length);
    return `<div class="ax-drop" id="ax-drop-${s.key}" hidden>
      <div class="ax-drop-head"><h2>${esc(s.label)}</h2><a class="ax-more" href="${link(s)}"${demo(s)}>Toute la rubrique ${icon('ne')}</a></div>
      ${simple ? `<div class="ax-drop-cols"><div class="ax-drop-col"><ul>${s.groups.map((g) => `<li><a href="${link(g)}"${demo(g)}>${esc(g.label)}</a></li>`).join('')}</ul></div></div>`
        : `<div class="ax-drop-cols">${cols.join('')}</div>`}
    </div>`;
  }

  function headHTML(current) {
    const links = [`<a class="ax-nav-link ${current === 'home' ? 'ax-on' : ''}" href="${LOCAL.home}" ${current === 'home' ? 'aria-current="page"' : ''}>Accueil</a>`];
    NAV.forEach((s) => {
      const on = current === s.key ? 'ax-on' : '';
      links.push(s.groups.length
        ? `<button type="button" class="ax-nav-link ${on}" aria-expanded="false" aria-controls="ax-drop-${s.key}">${esc(s.label)}${icon('down', 'ax-chev')}</button>`
        : `<a class="ax-nav-link ${on}" href="${link(s)}"${demo(s)}>${esc(s.label)}</a>`);
    });
    return `<header class="ax-head">
      <div class="ax-wrap">
        <div class="ax-head-l">
          <a class="ax-logo" href="${LOCAL.home}" aria-label="AGR Tennis de Table – accueil">${LOGO}<b>AGR</b></a>
          ${contrastTool()}
        </div>
        <nav class="ax-nav" aria-label="Menu principal">${links.join('')}</nav>
        <div class="ax-head-r">
          <a class="ax-btn ax-cta" href="#" data-demo>Trouver un club</a>
          <button type="button" class="ax-btn ax-menu-btn" aria-expanded="false" aria-controls="ax-sheet">${icon('menu')}Menu</button>
        </div>
      </div>
      ${NAV.filter((s) => s.groups.length).map(dropHTML).join('')}
    </header>`;
  }

  function sheetHTML() {
    const parts = [`<a class="ax-sheet-link" href="${LOCAL.home}">Accueil ${icon('right')}</a>`];
    SM.sections.forEach((s) => {
      if (!s.groups.length) { parts.push(`<a class="ax-sheet-link" href="${link(s)}"${demo(s)}>${esc(s.label)} ${icon('right')}</a>`); return; }
      const sub = [`<a href="${link(s)}"${demo(s)}><b>Toute la rubrique</b></a>`];
      s.groups.forEach((g) => {
        sub.push(`<a href="${link(g)}"${demo(g)}>${esc(g.label)}</a>`);
        (g.children || []).forEach((k) => sub.push(`<a class="ax-child" href="${link(k)}"${demo(k)}>${esc(k.label)}</a>`));
      });
      parts.push(`<details><summary>${esc(s.label)} ${icon('down', 'ax-chev')}</summary><div class="ax-sheet-sub">${sub.join('')}</div></details>`);
    });
    return `<div class="ax-sheet" id="ax-sheet" role="dialog" aria-modal="true" aria-label="Menu" hidden>
      <div class="ax-sheet-top"><a class="ax-logo" href="${LOCAL.home}">${LOGO}<b>AGR</b></a><button type="button" class="ax-btn ax-close">${icon('close')}Fermer</button></div>
      <div class="ax-sheet-body">
        <nav aria-label="Menu principal">${parts.join('')}</nav>
        <div class="ax-sheet-tools">${contrastTool()}<a class="ax-link-ui" href="#" data-demo>Espace privé</a></div>
      </div>
    </div>`;
  }

  function footerHTML() {
    return `<footer class="ax-footer"><div class="ax-wrap"><div class="ax-footer-box">
      <p class="ax-footer-big"><em>Tennis de table</em>Haut-Rhin</p>
      <div class="ax-footer-cols">
        <div><a class="ax-logo" href="${LOCAL.home}" style="color:inherit">${LOGO}<b>AGR</b></a>
          <p style="margin-top:12px">Section haut-rhinoise de tennis de table de l’Avant-Garde du Rhin.</p></div>
        <div><h2>Rubriques</h2><ul>${SM.sections.map((s) => `<li><a href="${link(s)}"${demo(s)}>${esc(s.label)}</a></li>`).join('')}</ul></div>
        <div><h2>Liens utiles</h2><ul>${SM.links.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}</ul></div>
      </div>
      <div class="ax-footer-bottom"><span>AGR – Section du Haut-Rhin de Tennis de Table · Saison ${SEASON}</span><a href="#" data-demo style="color:inherit">Espace privé</a></div>
      <p class="ax-credits">Photos : ${CREDITS.map(esc).join(', ')}, sur <a href="https://unsplash.com" target="_blank" rel="noopener" style="color:inherit">Unsplash</a> et <a href="https://www.pexels.com" target="_blank" rel="noopener" style="color:inherit">Pexels</a>.</p>
    </div></div></footer>`;
  }

  /* =================================================================
     Accueil : « Que cherchez-vous ? »
     ================================================================= */
  const TAB_SCENES = { resultats: 'player', classements: 'arena', calendriers: 'gym', clubs: 'club', documents: 'paddle' };
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
        <ul class="ax-sublinks">${subs.map((g) => `<li><a href="${link(g)}"${demo(g)}>${esc(g === s ? 'Ouvrir la page' : g.label)}${icon('right')}</a></li>`).join('')}</ul>
        <a class="ax-more" href="${link(s)}"${demo(s)}>Toute la rubrique ${icon('ne')}</a>
      </div>`;
    }).join('');
    return `<div class="ax-finder">
      <div class="ax-tablist" role="tablist" aria-label="Rubriques">${tabs}</div>
      <figure class="ax-photo ax-finder-photo" data-finder-photo>${scene(TAB_SCENES[NAV[0].key])}</figure>
      <div>${panels}</div>
    </div>`;
  }

  /* =================================================================
     Pages intérieures : bandeau, onglets, lignes de rubrique
     ================================================================= */
  const byItem = new Map();
  (function index() {
    const walk = (n, t) => {
      const tt = [...t, n];
      if (n.itemid != null) byItem.set(String(n.itemid), tt);
      (n.groups || n.children || []).forEach((c) => walk(c, tt));
    };
    SM.sections.forEach((s) => walk(s, []));
  })();

  // « Classement des équipes » → « <em>Classement</em> des équipes »
  const displayTitle = (t) => {
    const [first, ...rest] = String(t).split(' ');
    return `<em>${esc(first)}</em>${rest.length ? ' ' + esc(rest.join(' ')) : ''}`;
  };

  function pageHeadHTML(trail, title, help, sceneName) {
    const crumbs = [`<a href="${LOCAL.home}">Accueil</a>`];
    trail.slice(0, -1).forEach((n) => crumbs.push(`<a href="${link(n)}"${demo(n)}>${esc(n.label)}</a>`));
    crumbs.push(`<span aria-current="page">${esc(title)}</span>`);
    const s = trail[0];
    let subnav = '';
    if (s && s.groups && s.groups.length && trail.length > 1) {
      const pill = (n, on) => `<a class="ax-pill" href="${link(n)}"${demo(n)} ${on ? 'aria-current="page"' : ''}>${esc(n.label)}</a>`;
      subnav = `<nav class="ax-subnav" aria-label="Pages de la rubrique ${esc(s.label)}"><div class="ax-pills">${s.groups.map((g) => pill(g, trail[1] === g)).join('')}</div>`;
      const kids = trail[1].children || [];
      if (kids.length) subnav += `<div class="ax-pills">${kids.map((k) => pill(k, trail[2] === k)).join('')}</div>`;
      subnav += '</nav>';
    }
    return `<section class="ax-pagehead"><div class="ax-wrap">
      <nav class="ax-crumbs" aria-label="Vous êtes ici">${crumbs.join('<span aria-hidden="true">/</span>')}</nav>
      <div class="ax-pagehead-grid">
        <h1 class="ax-display">${displayTitle(title)}</h1>
        ${help ? `<p class="ax-help">${icon('info')}<span>${esc(help)}</span></p>` : '<span></span>'}
      </div>
      <figure class="ax-photo">${scene(sceneName)}</figure>
      ${subnav}
    </div></section>`;
  }

  function hubRowsHTML(s) {
    return `<ul class="ax-rows">${s.groups.map((g, i) => {
      const kids = g.children || [];
      return `<li class="ax-row">
        <span class="ax-row-num">0${i + 1}</span>
        <div><h3><a href="${link(g)}"${demo(g)}>${esc(g.label)}</a></h3><p>${esc(g.text || '')}</p></div>
        <div class="ax-pills">${kids.length ? kids.map((k) => `<a class="ax-pill" href="${link(k)}"${demo(k)}>${esc(k.label)}</a>`).join('') : `<a class="ax-more" href="${link(g)}"${demo(g)}>Ouvrir ${icon('ne')}</a>`}</div>
      </li>`;
    }).join('')}</ul>`;
  }

  /* =================================================================
     Construction de la page
     ================================================================= */
  const page = app.dataset.page;
  const trail = byItem.get(app.dataset.itemid) || [];
  const section = trail[0];
  const fill = (name, html) => { const el = app.querySelector(`[data-ax="${name}"]`); if (el) el.outerHTML = html; };

  fill('head', headHTML(page === 'home' ? 'home' : section ? section.key : ''));
  fill('sheet', sheetHTML());
  fill('footer', footerHTML());
  app.querySelectorAll('[data-scene]').forEach((f) => { f.insertAdjacentHTML('afterbegin', scene(f.dataset.scene)); });

  if (page === 'home') {
    fill('finder', finderHTML());
    // Actualités : dans l'extension, cette liste est lue à chaque visite dans
    // le module « Actualités » du site ; ici, un exemple de ce qu'il contient.
    const NEWS = [
      { title: 'Coupes d’Alsace', excerpt: 'Veuillez trouver ci-dessous le formulaire d’engagement pour les coupes d’Alsace pour la saison 2026/2027, à faire parvenir pour le 4 novembre 2026 au plus tard.', href: 'actualite.html' },
      { title: 'Individuels 1er tour', excerpt: 'Le 1er tour des championnats individuels aura lieu le samedi 24/10/2026 pour les adultes et le dimanche 25/10/2026 pour les jeunes, à Ingersheim.' },
      { title: 'Championnat par équipes des jeunes', excerpt: 'Comme tous les ans, nous allons organiser un championnat par équipes de jeunes. Vous trouverez ci-dessous le formulaire d’engagement.' },
      { title: 'Calendriers', excerpt: 'Les calendriers définitifs des divisions Excellence, Promotion d’excellence, Honneur et Promotion d’honneur sont désormais saisis sur ce site.' },
      { title: 'Dates à retenir', excerpt: '1re journée de championnat (Excellence, Promotion d’excellence, Honneur et Promotion d’honneur) du 21/09/2026 au 26/09/2026.' },
      { title: 'Certificat médical 2026/2027', excerpt: 'Veuillez trouver ci-joint le certificat médical à remplir ou le questionnaire de santé adultes et jeunes 2026-2027.' },
    ];
    const DATE = /\b\d{1,2}[/.]\d{1,2}([/.]\d{2,4})?\b|\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i;
    const shorten = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
    const newsLink = (n) => (n.href ? `href="${n.href}"` : 'href="#" data-demo');
    const soon = NEWS.slice(0, 2);
    fill('soon', soon.length ? `<div class="ax-why">
      <h2>À ne pas manquer</h2>
      <ul>${soon.map((n) => `<li><a ${newsLink(n)}><span><b>${esc(n.title)}</b><span>${esc(shorten(n.excerpt, 120))}</span></span>${icon(DATE.test(n.excerpt) ? 'cal' : 'file')}</a></li>`).join('')}</ul>
    </div>` : '');
    fill('news-cards', NEWS.slice(2, 11).map((n) => `<a class="ax-card" ${newsLink(n)}><span class="ax-tag">Actualité</span><h3>${esc(n.title)}</h3><p>${esc(shorten(n.excerpt, 150))}</p><span class="ax-more">Lire ${icon('ne')}</span></a>`).join(''));
    // Grande image de l'accueil
    const hero = app.querySelector('[data-hero]');
    if (hero) hero.innerHTML = heroImg();
  } else {
    const node = trail[trail.length - 1];
    const title = app.dataset.title || (node && (SM.pages[node.itemid] || {}).title) || (node && node.label) || '';
    const help = app.dataset.help ?? ((SM.pages[app.dataset.itemid] || {}).help || (trail.length === 1 && section ? section.description : ''));
    fill('pagehead', pageHeadHTML(trail.length ? trail : [{ label: title }], title, help, app.dataset.visual || 'table'));
    if (trail.length === 1 && section.groups.length) fill('hub', hubRowsHTML(section));
  }

  /* =================================================================
     Interactions
     ================================================================= */
  const root = document.documentElement;
  let settings = { contrast: false };
  try { settings = { contrast: !!JSON.parse(localStorage.getItem('agrx-maquette') || '{}').contrast }; } catch { /* ignore */ }
  const apply = () => {
    root.classList.toggle('ax-contrast', !!settings.contrast);
    app.querySelectorAll('[data-contrast]').forEach((b) => b.setAttribute('aria-pressed', String(!!settings.contrast)));
    try { localStorage.setItem('agrx-maquette', JSON.stringify(settings)); } catch { /* ignore */ }
  };
  apply();

  app.addEventListener('click', (e) => {
    if (e.target.closest('[data-contrast]')) { settings.contrast = !settings.contrast; apply(); }
    const d = e.target.closest('[data-demo]');
    if (d) { e.preventDefault(); d.animate([{ opacity: 1 }, { opacity: .35 }, { opacity: 1 }], 400); }
  });

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
  const photo = app.querySelector('[data-finder-photo]');
  const select = (t, focus) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    const key = t.id.replace('ax-tab-', '');
    if (photo) photo.innerHTML = scene(TAB_SCENES[key] || 'table');
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

  // Étapes à déplier (démonstration de l'outil « classement »)
  app.querySelectorAll('.ax-step[aria-controls]').forEach((b) => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
  }));
})();
