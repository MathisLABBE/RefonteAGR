/* Scènes de base (outil) : elles sont ensuite transformées en images
   « low poly » par lowpoly.js. Couleurs alignées sur l'illustration
   fournie : vert sauge, beige chaud, raquette rouge brique. */
(() => {
  self.AGRX_SCENES = {
    // Raquette posée sur la table, vue de dessus
    racket: () => `<svg viewBox="0 0 600 640">
      <defs>
        <linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d9670"/><stop offset=".55" stop-color="#55704a"/><stop offset="1" stop-color="#34492d"/></linearGradient>
        <radialGradient id="r" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#c25446"/><stop offset=".6" stop-color="#93332a"/><stop offset="1" stop-color="#5f1d17"/></radialGradient>
        <linearGradient id="h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5434"/><stop offset=".5" stop-color="#c39663"/><stop offset="1" stop-color="#6a4729"/></linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4dc" stop-opacity=".45"/><stop offset=".6" stop-color="#fff4dc" stop-opacity="0"/></linearGradient>
      </defs>
      <rect width="600" height="640" fill="url(#t)"/>
      <path d="M-20 540 L620 400" stroke="#efe6d2" stroke-width="16"/>
      <g transform="translate(24 30)" opacity=".35" fill="#1d2a18"><g transform="rotate(-32 300 300)"><rect x="276" y="400" width="48" height="190" rx="18"/><ellipse cx="300" cy="260" rx="168" ry="182"/></g></g>
      <g transform="rotate(-32 300 300)">
        <rect x="276" y="400" width="48" height="190" rx="18" fill="url(#h)"/>
        <ellipse cx="300" cy="260" rx="168" ry="182" fill="#3d2616"/>
        <ellipse cx="300" cy="260" rx="160" ry="174" fill="url(#r)"/>
      </g>
      <circle cx="484" cy="168" r="30" fill="#2a3a24" opacity=".35"/>
      <circle cx="470" cy="150" r="30" fill="#f6f0e2"/>
      <circle cx="460" cy="140" r="10" fill="#ffffff"/>
      <rect width="600" height="640" fill="url(#sun)"/>
    </svg>`,

    // Salle : grandes fenêtres, parquet clair, tables, un joueur
    hall: () => `<svg viewBox="0 0 600 900">
      <defs>
        <linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9c8a8"/><stop offset="1" stop-color="#b8a27e"/></linearGradient>
        <linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7b98f"/><stop offset="1" stop-color="#a98762"/></linearGradient>
        <linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7e4" stop-opacity=".8"/><stop offset="1" stop-color="#fff7e4" stop-opacity="0"/></linearGradient>
        <linearGradient id="tb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a9469"/><stop offset="1" stop-color="#4c6642"/></linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#w)"/>
      <g fill="#f7eedb"><rect x="300" y="40" width="130" height="430"/><rect x="450" y="40" width="150" height="430"/></g>
      <g stroke="#a48d68" stroke-width="8"><path d="M365 40v430M525 40v430M300 250h300"/></g>
      <polygon points="300,470 600,470 600,900 60,900" fill="url(#l)" opacity=".6"/>
      <rect y="560" width="600" height="340" fill="url(#f)"/>
      <rect x="40" y="430" width="230" height="22" fill="#8d6b49"/><rect x="60" y="452" width="14" height="80" fill="#6f5338"/><rect x="236" y="452" width="14" height="80" fill="#6f5338"/>
      <g transform="translate(-10 0)">
        <polygon points="40,620 360,620 420,700 0,700" fill="url(#tb)"/>
        <rect x="0" y="700" width="420" height="16" fill="#33452d"/>
        <rect x="40" y="716" width="16" height="110" fill="#33452d"/><rect x="380" y="716" width="16" height="110" fill="#33452d"/>
        <polygon points="40,620 360,620 420,700 0,700" fill="none" stroke="#f1e9d8" stroke-width="4"/>
        <rect x="186" y="586" width="44" height="50" fill="#2f4229" opacity=".85"/>
      </g>
      <!-- joueur (dos, maillot vert) -->
      <g>
        <ellipse cx="470" cy="880" rx="90" ry="14" fill="#6d5536" opacity=".4"/>
        <polygon points="430,700 470,700 482,870 448,870" fill="#e5c19b"/>
        <polygon points="476,700 512,700 520,868 490,870" fill="#d6ad86"/>
        <polygon points="420,560 530,560 540,720 410,720" fill="#272b25"/>
        <polygon points="412,420 540,420 552,580 400,580" fill="#3f6a3a"/>
        <polygon points="412,420 470,430 452,580 400,580" fill="#355c31"/>
        <polygon points="400,430 360,520 382,540 420,460" fill="#e2bd96"/>
        <polygon points="540,430 590,500 572,520 528,470" fill="#d9b18b"/>
        <circle cx="356" cy="532" r="26" fill="#a3392f"/>
        <rect x="372" y="540" width="10" height="26" fill="#7b5233" transform="rotate(-30 377 553)"/>
        <rect x="462" y="388" width="30" height="36" fill="#d9b18b"/>
        <ellipse cx="477" cy="360" rx="34" ry="38" fill="#3a2a1f"/>
      </g>
    </svg>`,

    // Balle au bord de la table, filet derrière
    ball: () => `<svg viewBox="0 0 800 520">
      <defs>
        <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f8a62"/><stop offset="1" stop-color="#41593a"/></linearGradient>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9b08a"/><stop offset="1" stop-color="#ecdcbd"/></linearGradient>
        <radialGradient id="ba" cx="36%" cy="30%" r="72%"><stop offset="0" stop-color="#ffffff"/><stop offset=".65" stop-color="#efe7d6"/><stop offset="1" stop-color="#c9bb9c"/></radialGradient>
      </defs>
      <rect width="800" height="520" fill="url(#bg)"/>
      <polygon points="500,0 800,0 800,240 300,240" fill="#fff6e2" opacity=".5"/>
      <rect x="0" y="130" width="800" height="110" fill="#2c3d27"/>
      <g stroke="#7f9a72" stroke-width="2" opacity=".6"><path d="M0 160h800M0 190h800M0 220h800M100 130v110M220 130v110M340 130v110M460 130v110M580 130v110M700 130v110"/></g>
      <rect x="0" y="120" width="800" height="12" fill="#f1e9d8"/>
      <rect x="0" y="240" width="800" height="210" fill="url(#t)"/>
      <rect x="0" y="440" width="800" height="14" fill="#f1e9d8"/>
      <rect x="0" y="454" width="800" height="66" fill="#2c3d27"/>
      <ellipse cx="440" cy="432" rx="84" ry="16" fill="#25351f" opacity=".6"/>
      <circle cx="420" cy="350" r="76" fill="url(#ba)"/>
    </svg>`,
  };
})();
