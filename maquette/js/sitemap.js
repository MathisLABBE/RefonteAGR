/* Plan du site AGR Tennis de Table – Haut-Rhin (saison 2026-2027),
   organisé par type d'information : Résultats, Classements, Calendriers,
   Clubs & joueurs, Documents.
   Chaque page du site d'origine est rangée ici par son « Itemid » (le
   numéro à la fin de son adresse). « aliases » : anciennes pages
   intermédiaires qui affichent la rubrique correspondante.
   Pour ajouter une page : ajoutez une ligne dans la bonne rubrique. */
(() => {
  const art = (id, itemid, label, extra = {}) =>
    ({ label, itemid, href: `index.php?option=com_content&view=article&id=${id}&Itemid=${itemid}`, ...extra });
  const wrap = (itemid, label, extra = {}) =>
    ({ label, itemid, href: `index.php?option=com_wrapper&view=wrapper&Itemid=${itemid}`, ...extra });

  const COUPES = ['Dames', 'Jeunes A', 'Jeunes B', 'Jeunes C', 'Messieurs A', 'Messieurs B',
    'Messieurs C', 'Vétérans A', 'Vétérans B', 'Vétérans C', 'Mixtes'];
  const coupes = (ids) => COUPES.map((label, i) => art(ids[i][0], ids[i][1], label));

  const sections = [
    art(12, 43, 'Résultats', {
      key: 'resultats',
      icon: 'trophy',
      color: 'orange',
      text: 'Feuilles de match, individuels et coupes',
      question: 'Les résultats de quelle compétition ?',
      description: 'Les feuilles de match du championnat, les résultats des individuels et des coupes.',
      aliases: [37],
      groups: [
        wrap(39, 'Championnat', { icon: 'users', text: 'Les feuilles de match de chaque journée' }),
        art(13, 44, 'Individuels', {
          icon: 'user',
          text: 'Séries féminines et masculines',
          question: 'Quelle série ?',
          children: [
            art(39, 75, 'Séries féminines', {
              question: 'Quelle catégorie ?',
              children: [
                art(41, 77, 'Toutes catégories'), art(42, 78, 'Secteur A'), art(43, 79, 'Secteur B'),
                art(44, 80, 'Vétérans'), art(45, 81, 'Cadettes'), art(46, 82, 'Minimes'),
                art(47, 83, 'Benjamines'), art(48, 84, 'Poussines'),
              ],
            }),
            art(40, 76, 'Séries masculines', {
              question: 'Quelle catégorie ?',
              children: [
                art(49, 85, 'Toutes catégories'), art(50, 86, 'Départementaux A'), art(51, 87, 'Départementaux B'),
                art(52, 88, 'Secteur A'), art(53, 89, 'Secteur B'), art(54, 90, 'Secteur C'),
                art(55, 91, 'Vétérans A'), art(56, 92, 'Vétérans B'), art(57, 93, 'Vétérans C'), art(58, 94, 'Vétérans D'),
                art(59, 95, 'Cadets'), art(60, 96, 'Minimes'), art(61, 97, 'Benjamins'), art(62, 98, 'Poussins'),
              ],
            }),
          ],
        }),
        art(14, 45, 'Coupes', {
          icon: 'cup',
          text: 'Par catégorie : dames, jeunes, messieurs, vétérans…',
          question: 'Quelle coupe ?',
          children: coupes([[28, 62], [29, 63], [30, 64], [31, 65], [32, 66], [33, 67], [34, 68], [35, 69], [36, 70], [37, 71], [38, 72]]),
        }),
      ],
    }),
    art(12, 38, 'Classements', {
      key: 'classements',
      icon: 'chart',
      color: 'green',
      text: 'Équipes par poule, Top 12, simulateur',
      question: 'Quel classement ?',
      description: 'Le classement des équipes par poule, les meilleurs joueurs et le simulateur de classement.',
      groups: [
        wrap(47, 'Classement des équipes', { icon: 'chart', text: 'Le classement de chaque poule du championnat' }),
        wrap(46, 'Top 12 des joueurs', { icon: 'star', text: 'Les meilleurs joueurs de chaque division' }),
        wrap(100, 'Simulateur de classement', { icon: 'calc', text: 'Estimer l’évolution du classement d’un joueur' }),
      ],
    }),
    art(5, 23, 'Calendriers', {
      key: 'calendriers',
      icon: 'calendar',
      color: 'blue',
      text: 'Les dates du championnat, des individuels et des coupes',
      question: 'Le calendrier de quelle compétition ?',
      description: 'Les dates des rencontres du championnat, des individuels et des coupes.',
      aliases: [24, 29],
      groups: [
        wrap(25, 'Championnat', { icon: 'users', text: 'Les rencontres de chaque poule, journée par journée' }),
        art(9, 31, 'Individuels', { icon: 'user', text: 'Les dates des tours', aliases: [30] }),
        art(8, 32, 'Coupes', {
          icon: 'cup',
          text: 'Les tirages par catégorie',
          question: 'Quelle coupe ?',
          children: coupes([[17, 51], [18, 52], [19, 53], [20, 54], [21, 55], [22, 56], [23, 57], [24, 58], [25, 59], [26, 60], [27, 61]]),
        }),
      ],
    }),
    art(1, 2, 'Clubs & joueurs', {
      key: 'clubs',
      icon: 'pin',
      color: 'red',
      text: 'Adresses, salles, équipes et fiches des joueurs',
      question: 'Que voulez-vous trouver ?',
      description: 'Les coordonnées des clubs, leurs salles, leurs équipes et la fiche de chaque joueur.',
      aliases: [4, 5, 10, 11, 16, 22],
      groups: [
        wrap(6, "Fiche d'un club", { icon: 'pin', text: 'Adresse, salles, correspondant et équipes' }),
        wrap(17, "Fiche d'un joueur", { icon: 'user', text: 'Classement, licence et équipe' }),
        wrap(102, "Joueurs d'un club", { icon: 'users', text: 'La liste des licenciés d’un club', aliases: [104] }),
        wrap(12, "Équipes d'un club", { icon: 'shield', text: 'Les équipes engagées par un club' }),
        wrap(3, 'Les secteurs', { icon: 'map', text: 'Les clubs de chaque secteur' }),
      ],
    }),
    art(110, 110, 'Documents', {
      key: 'documents',
      icon: 'file',
      color: 'slate',
      text: 'Formulaires et règlements à télécharger',
      description: 'Formulaires, règlements et documents à télécharger.',
      groups: [],
    }),
    art(63, 103, 'Liens utiles', {
      key: 'liens',
      icon: 'link',
      color: 'slate',
      inNav: false,
      description: 'Les sites utiles du tennis de table en Alsace.',
      groups: [],
    }),
  ];

  // Consigne affichée en tête des pages « outils »
  const pages = {
    3: { help: 'Choisissez un secteur dans la liste pour afficher ses clubs.' },
    6: { help: 'Choisissez un club dans la liste : ses coordonnées, ses salles et ses équipes s’affichent.' },
    102: { help: 'Choisissez un club pour afficher la liste de ses joueurs licenciés.' },
    104: { help: 'Choisissez un club pour afficher la liste de ses joueurs licenciés.' },
    12: { help: 'Choisissez un club pour afficher ses équipes engagées.' },
    17: { help: 'Choisissez un joueur dans la liste (classée par nom de famille).' },
    100: { help: 'Choisissez un joueur, puis indiquez ses résultats pour estimer l’évolution de son classement.' },
    25: { title: 'Calendrier du championnat', help: 'Touchez le secteur, puis la phase, la division et la poule : le calendrier s’affiche.' },
    39: { title: 'Résultats du championnat', help: 'Touchez la division, puis la poule, la journée et la rencontre : la feuille de match s’affiche.' },
    47: { help: 'Touchez la division, puis la poule : le classement s’affiche.' },
    46: { help: 'Touchez la division, puis la poule : les meilleurs joueurs s’affichent.' },
    31: { title: 'Calendrier des individuels' },
  };

  const links = [
    { label: 'Avant-Garde du Rhin (AGR)', href: 'http://agr-fscf.fr/' },
    { label: 'Ligue d’Alsace de Tennis de Table', href: 'http://www.alsacett.com' },
    { label: 'Section du Bas-Rhin', href: '/agrtt67' },
    { label: 'Haut-Rhin : saison précédente', href: '/agrtt68_A-1' },
  ];

  self.AGRX_SITEMAP = { sections, pages, links };
})();
