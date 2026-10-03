/* Skipper Prep — illustration library.
   Every function returns an SVG string. Real navigation colours are fixed constants and must
   never follow the theme; everything else uses CSS variables so it works in light and dark.
   This file is built out by the illustration stage; the helpers below are the shared base. */
window.BOAT_SVG = (function () {
  'use strict';
  const COLORS = {
    red: '#e2231a', green: '#19a84a', white: '#fffbe6', yellow: '#f5c400', black: '#111111',
    blue: '#1d5fd1', orange: '#f2771a', hullLight: '#e9e2d0', hullDark: '#3a4a58',
    sea: '#7fb3c9', night: '#0a1420',
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function svg(w, h, inner, opts) {
    opts = opts || {};
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${opts.width || w}" ${opts.height ? `height="${opts.height}"` : ''} role="img" aria-label="${esc(opts.label || '')}" style="max-width:100%;height:auto;font-family:var(--font-body);">${opts.bg ? `<rect width="${w}" height="${h}" fill="${opts.bg}" rx="8"/>` : ''}${inner}</svg>`;
  }
  const deg = d => d * Math.PI / 180;
  /* Arc sector path centred (cx,cy), radius r, from a1 to a2 degrees (0 = up/north, clockwise). */
  function sector(cx, cy, r, a1, a2, fill, opacity) {
    let span = ((a2 - a1) % 360 + 360) % 360; if (span === 0) span = 360;
    if (span >= 359.99) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity == null ? .55 : opacity}"/>`;
    const p = a => [cx + r * Math.sin(deg(a)), cy - r * Math.cos(deg(a))];
    const [x1, y1] = p(a1), [x2, y2] = p(a1 + span);
    return `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${span > 180 ? 1 : 0},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${fill}" opacity="${opacity == null ? .55 : opacity}"/>`;
  }
  function text(x, y, s, o) {
    o = o || {};
    return `<text x="${x}" y="${y}" font-size="${o.size || 12}" font-weight="${o.weight || 500}" fill="${o.fill || 'var(--ink)'}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="${o.baseline || 'middle'}" ${o.family ? `font-family="${o.family}"` : ''}${o.italic ? ' font-style="italic"' : ''}>${esc(s)}</text>`;
  }
  const gallery = [];
  return { COLORS, svg, sector, text, esc, deg, gallery };
})();
