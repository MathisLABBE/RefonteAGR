/* Générateur « low poly » (outil de fabrication des images de la maquette).
   Dessine une scène SVG sur un canevas, place des points (davantage sur les
   contours), les relie en triangles (Delaunay) et remplit chaque triangle
   de la couleur moyenne de l'image, avec une légère variation d'ombre. */
(() => {
  // Générateur pseudo-aléatoire reproductible
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Triangulation de Delaunay (algorithme de Bowyer-Watson)
  function delaunay(pts) {
    const big = 1e5;
    const P = pts.concat([[-big, -big], [big * 2, -big], [-big, big * 2]]);
    const n = pts.length;
    let tris = [[n, n + 1, n + 2]];
    const circ = (t) => {
      const [ax, ay] = P[t[0]], [bx, by] = P[t[1]], [cx, cy] = P[t[2]];
      const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
      const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
      const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
      return [ux, uy, (ax - ux) ** 2 + (ay - uy) ** 2];
    };
    let circles = tris.map(circ);
    for (let i = 0; i < n; i++) {
      const [px, py] = P[i];
      const bad = [];
      const keep = [];
      const keepC = [];
      tris.forEach((t, k) => {
        const [ux, uy, r2] = circles[k];
        if ((px - ux) ** 2 + (py - uy) ** 2 < r2) bad.push(t); else { keep.push(t); keepC.push(circles[k]); }
      });
      const edges = new Map();
      bad.forEach((t) => [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]].forEach(([a, b]) => {
        const key = a < b ? a + ',' + b : b + ',' + a;
        edges.set(key, edges.has(key) ? null : [a, b]);
      }));
      tris = keep;
      circles = keepC;
      edges.forEach((e) => {
        if (!e) return;
        const t = [e[0], e[1], i];
        tris.push(t);
        circles.push(circ(t));
      });
    }
    return tris.filter((t) => t[0] < n && t[1] < n && t[2] < n);
  }

  async function rasterize(svg, W, H) {
    const s = svg.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" `);
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    await img.decode();
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, W, H);
    return g.getImageData(0, 0, W, H).data;
  }

  self.makeLowPoly = async function (svg, W, H, { uniform = 420, edge = 520, seed = 7, shade = 0.07, gap = 14 } = {}) {
    const d = await rasterize(svg, W, H);
    const rand = rng(seed);
    const lum = (x, y) => { const i = (y * W + x) * 4; return 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; };

    // Points : bords, grille aléatoire, puis contours (forte variation de lumière)
    const pts = [];
    // Écart minimal entre deux points (évite les triangles trop fins)
    const cell = gap, grid = new Map();
    const key = (x, y) => Math.floor(x / cell) + ',' + Math.floor(y / cell);
    const free = (x, y) => {
      const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        for (const [px, py] of grid.get((cx + i) + ',' + (cy + j)) || []) if ((px - x) ** 2 + (py - y) ** 2 < gap * gap) return false;
      }
      return true;
    };
    const add = (x, y) => { pts.push([x, y]); const k = key(x, y); if (!grid.has(k)) grid.set(k, []); grid.get(k).push([x, y]); };
    const stepX = W / 8, stepY = H / 6;
    for (let x = 0; x <= W; x += stepX) { add(x, 0); add(x, H); }
    for (let y = stepY; y < H; y += stepY) { add(0, y); add(W, y); }
    for (let i = 0; i < uniform; i++) { const x = rand() * W, y = rand() * H; if (free(x, y)) add(x, y); }
    let added = 0, tries = 0;
    while (added < edge && tries < edge * 80) {
      tries++;
      const x = 1 + Math.floor(rand() * (W - 2)), y = 1 + Math.floor(rand() * (H - 2));
      const gx = lum(x + 1, y) - lum(x - 1, y), gy = lum(x, y + 1) - lum(x, y - 1);
      if (Math.hypot(gx, gy) > 18 + rand() * 40 && free(x, y)) { add(x, y); added++; }
    }

    const tris = delaunay(pts);
    const hex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    const paths = tris.map((t) => {
      const [a, b, c] = t.map((k) => pts[k]);
      // couleur moyenne : centre + milieux des côtés
      const samples = [
        [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3],
        [(a[0] * 2 + b[0] + c[0]) / 4, (a[1] * 2 + b[1] + c[1]) / 4],
        [(a[0] + b[0] * 2 + c[0]) / 4, (a[1] + b[1] * 2 + c[1]) / 4],
        [(a[0] + b[0] + c[0] * 2) / 4, (a[1] + b[1] + c[1] * 2) / 4],
      ];
      let r = 0, gg = 0, bb = 0;
      samples.forEach(([x, y]) => {
        const i = (Math.min(H - 1, Math.max(0, Math.round(y))) * W + Math.min(W - 1, Math.max(0, Math.round(x)))) * 4;
        r += d[i]; gg += d[i + 1]; bb += d[i + 2];
      });
      const f = 1 + (rand() - 0.5) * 2 * shade;   // variation d'ombre par facette
      const col = '#' + hex(r / 4 * f) + hex(gg / 4 * f) + hex(bb / 4 * f);
      const p = (q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
      return `<path fill="${col}" stroke="${col}" d="M${p(a)}L${p(b)}L${p(c)}Z"/>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><g stroke-width=".8" stroke-linejoin="round">${paths.join('')}</g></svg>`;
  };
})();
