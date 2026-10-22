// 動漫風程序化美術：角色立繪、場景、CG 全部用 SVG 畫。
// 換正式美術：喺 assets/chars/<id>_<mood>.png 放圖，並喺 CHARS[id].img = true，Art.portrait 會自動用圖。
const Art = (() => {
  let uid = 0;
  const has = (k, n) => !!(window.ASSETS && ASSETS[k] && ASSETS[k].includes(n));
  // 正式立繪：<id>_<表情>_<服裝>.webp。冇對應表情就用 normal，冇對應服裝就用 default；自訂服裝（換裝小遊戲）一律用 SVG
  const OUTFIT_ALIAS = { law: 'suit', formal: 'default', coat: 'coat' };
  function charImg(id, m, o) {
    if (o && typeof o === 'object') return null;
    const key = o || 'default', al = OUTFIT_ALIAS[key] || key;
    for (const cand of [`${id}_${m}_${key}`, `${id}_normal_${key}`, `${id}_normal_${al}`, `${id}_normal_default`]) if (has('chars', cand)) return cand;
    return null;
  }
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (h, a) => '#' + hex(h).map(v => Math.round(clamp(a < 0 ? v * (1 + a) : v + (255 - v) * a, 0, 255)).toString(16).padStart(2, '0')).join('');

  function eye(x, s, m, ch, u) {
    const iris = ch.eye, lash = '#2a1626', skin = ch.skin;
    if (m === 'smile' || m === 'happy') return `<path d="M${x - 16},192 Q${x},172 ${x + 16},192" fill="none" stroke="${lash}" stroke-width="4.5" stroke-linecap="round"/>`;
    const shock = m === 'shock';
    const ry = shock ? 23 : 19, irx = shock ? 8 : 11, iry = shock ? 12 : 15, pr = shock ? 3 : 5.5;
    let o = `<linearGradient id="ig${u}${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(iris, -.5)}"/><stop offset=".6" stop-color="${iris}"/><stop offset="1" stop-color="${mix(iris, .45)}"/></linearGradient>`;
    o += `<ellipse cx="${x}" cy="189" rx="17" ry="${ry}" fill="#fff"/><ellipse cx="${x}" cy="191" rx="${irx}" ry="${iry}" fill="url(#ig${u}${s})"/><ellipse cx="${x}" cy="192" rx="${pr}" ry="${pr * 1.4}" fill="${lash}"/><circle cx="${x - 4}" cy="184" r="4.2" fill="#fff"/><circle cx="${x + 4.5}" cy="197" r="2" fill="#fff" opacity=".8"/>`;
    if (m === 'angry') o += `<polygon points="${x - s * 22},158 ${x + s * 22},158 ${x + s * 22},190 ${x - s * 22},176" fill="${skin}"/><path d="M${x - s * 19},176 L${x + s * 19},190" stroke="${lash}" stroke-width="4.5" stroke-linecap="round"/>`;
    else if (m === 'cold' || m === 'smirk') o += `<polygon points="${x - 22},158 ${x + 22},158 ${x + 22},184 ${x - 22},184" fill="${skin}"/><path d="M${x - 18},184 L${x + 18},184" stroke="${lash}" stroke-width="4.5" stroke-linecap="round"/>`;
    else o += `<path d="M${x - 18},187 Q${x},164 ${x + 18},187" fill="none" stroke="${lash}" stroke-width="4.5" stroke-linecap="round"/><path d="M${x - s * 18},187 l${-s * 5},-4" stroke="${lash}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (m === 'sad') o += `<circle cx="${x + 5}" cy="196" r="3" fill="#fff" opacity=".9"/><path d="M${x},206 q-5,9 0,14 q5,-5 0,-14z" fill="#a8dcff" opacity=".9"/>`;
    return o;
  }
  function brow(x, s, m, c) {
    let ox = x - s * 18, ix = x + s * 17, oy = 160, iy = 160;
    if (m === 'angry') { oy = 154; iy = 170; }
    else if (m === 'sad') { oy = 165; iy = 152; }
    else if (m === 'shock') { oy = 150; iy = 150; }
    else if (m === 'smirk' && s === 1) { oy = 150; iy = 152; }
    else if (m === 'cold') { oy = 158; iy = 164; }
    return `<path d="M${ox},${oy} Q${(ox + ix) / 2},${Math.min(oy, iy) - 7} ${ix},${iy}" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/>`;
  }
  function mouth(m, ch) {
    const l = ch.g === 'f' ? '#d9566b' : '#b9605f';
    switch (m) {
      case 'smile': case 'happy': return `<path d="M134,238 Q150,260 166,238 Q150,244 134,238Z" fill="${l}" stroke="${mix(l, -.4)}" stroke-width="2.5" stroke-linejoin="round"/>`;
      case 'angry': return `<path d="M137,250 Q150,238 163,250" fill="none" stroke="${mix(l, -.3)}" stroke-width="3.5" stroke-linecap="round"/>`;
      case 'sad': return `<path d="M139,249 Q150,242 161,249" fill="none" stroke="${mix(l, -.3)}" stroke-width="3" stroke-linecap="round"/>`;
      case 'shock': return `<ellipse cx="150" cy="248" rx="7" ry="9" fill="#7a2230"/>`;
      case 'smirk': return `<path d="M137,246 Q152,248 165,236" fill="none" stroke="${mix(l, -.3)}" stroke-width="3.5" stroke-linecap="round"/>`;
      case 'cold': return `<path d="M141,245 L159,245" stroke="${mix(l, -.3)}" stroke-width="3" stroke-linecap="round"/>`;
      default: return `<path d="M138,243 Q150,249 162,243" fill="none" stroke="${l}" stroke-width="3.2" stroke-linecap="round"/>`;
    }
  }

  const HAIR = {
    long: { back: 'M72,175 C58,95 100,46 150,46 C200,46 242,95 228,175 C226,250 240,330 236,420 L64,420 C60,330 74,250 72,175Z', front: 'M88,170 C84,100 116,62 150,62 C184,62 216,100 212,170 C205,130 190,112 176,108 C168,130 150,140 134,128 C122,122 104,142 88,170Z M88,170 C80,220 84,262 94,304 L106,304 C100,262 100,220 106,172Z M212,170 C220,220 216,262 206,304 L194,304 C200,262 200,220 194,172Z' },
    updo: { back: 'M84,170 C70,90 106,50 150,50 C194,50 230,90 216,170Z M150,20 a24,24 0 1,0 .1,0Z', front: 'M88,170 C84,100 116,64 150,64 C184,64 216,100 212,170 C205,130 190,112 176,108 C168,130 150,140 134,128 C122,122 104,142 88,170Z M96,190 C92,230 98,250 104,262 L110,258 C106,240 108,214 108,186Z M204,190 C208,230 202,250 196,262 L190,258 C194,240 192,214 192,186Z' },
    side: { back: 'M84,170 C70,90 106,46 150,46 C194,46 230,90 216,170Z', front: 'M86,165 C80,100 112,62 152,62 C192,62 220,96 214,165 C208,138 196,118 176,108 C160,134 126,138 100,150 C94,154 90,158 86,165Z' },
    slick: { back: 'M84,170 C70,88 106,44 150,44 C194,44 230,88 216,170Z', front: 'M88,152 C84,94 112,56 152,56 C192,56 218,94 212,152 C206,124 190,104 150,98 C112,104 94,124 88,152Z M144,98 q-6,26 6,42 q-12,-16 -2,-42Z' },
    neat: { back: 'M84,170 C72,92 108,48 150,48 C192,48 228,92 216,170Z', front: 'M86,168 C78,100 112,60 152,60 C194,60 222,98 214,168 C206,140 190,116 164,106 C150,128 118,136 98,152 C92,158 88,162 86,168Z' },
    wild: { back: 'M84,170 C70,92 106,48 150,48 C194,48 230,92 216,170Z', front: 'M84,168 L88,122 L100,102 L112,70 L132,92 L150,54 L170,90 L190,68 L202,100 L214,124 L216,168 C206,138 190,120 160,112 C140,130 112,138 96,152Z' },
    bun: { back: 'M80,175 C68,95 104,50 150,50 C196,50 232,95 220,175Z M150,18 a26,26 0 1,0 .1,0Z', front: 'M84,170 C80,100 114,64 150,64 C186,64 220,100 216,170 C208,132 190,116 150,114 C112,116 92,132 84,170Z' },
    grey: { back: 'M84,170 C72,92 108,50 150,50 C192,50 228,92 216,170Z', front: 'M88,150 C84,100 114,66 152,66 C190,66 216,100 212,150 C204,122 186,108 150,104 C114,108 96,122 88,150Z' }
  };

  const BODY = {
    suit: c => `<path d="M20,420 C20,340 70,304 120,296 L150,338 L180,296 C230,304 280,340 280,420Z" fill="${c.color}"/><path d="M120,296 L150,348 L180,296 L168,292 L150,306 L132,292Z" fill="#f7f7fb"/><path d="M144,318 L156,318 L160,348 L150,366 L140,348Z" fill="${c.accent}"/><path d="M142,350 L150,420 L158,350Z" fill="${c.accent}"/><path d="M120,296 L108,380 M180,296 L192,380" stroke="rgba(0,0,0,.28)" stroke-width="3" fill="none"/>`,
    dress: c => `<path d="M24,420 C24,345 74,310 118,300 C132,326 168,326 182,300 C226,310 276,345 276,420Z" fill="${c.color}"/><path d="M60,360 C100,380 200,380 240,360" stroke="${mix(c.color, .35)}" stroke-width="3" fill="none" opacity=".6"/>${c.sparkle ? [[80, 350], [120, 380], [180, 372], [220, 348], [150, 400], [100, 405], [205, 402]].map(([x, y]) => `<path d="M${x},${y - 6} L${x + 2},${y - 2} L${x + 6},${y} L${x + 2},${y + 2} L${x},${y + 6} L${x - 2},${y + 2} L${x - 6},${y} L${x - 2},${y - 2}Z" fill="#fff" opacity=".85"/>`).join('') : ''}`,
    wedding: c => `<path d="M16,420 C16,345 70,308 118,300 C132,328 168,328 182,300 C230,308 284,345 284,420Z" fill="#fdf7fb"/><path d="M40,370 C100,392 200,392 260,370 M30,400 C100,420 200,420 270,400" stroke="#e6d3e2" stroke-width="3" fill="none"/><path d="M118,300 C132,328 168,328 182,300" stroke="#e6d3e2" stroke-width="3" fill="none"/><g fill="#fbd0dc"><circle cx="64" cy="350" r="9"/><circle cx="82" cy="342" r="7"/><circle cx="236" cy="350" r="9"/><circle cx="218" cy="342" r="7"/></g>`,
    casual: c => `<path d="M26,420 C26,345 72,308 122,298 Q150,326 178,298 C228,308 274,345 274,420Z" fill="${c.color}"/><path d="M122,298 L150,340 L178,298 L166,292 L150,310 L134,292Z" fill="#f4f4f8"/><path d="M122,298 L112,420 M178,298 L188,420" stroke="rgba(0,0,0,.22)" stroke-width="3" fill="none"/>`,
    coat: c => `<path d="M16,420 C16,336 66,300 118,290 L150,330 L182,290 C234,300 284,336 284,420Z" fill="${c.color}"/><path d="M118,290 L150,372 L128,420 L104,420 L98,330Z" fill="${mix(c.color, .14)}"/><path d="M182,290 L150,372 L172,420 L196,420 L202,330Z" fill="${mix(c.color, .14)}"/><path d="M130,292 L150,336 L170,292 L160,286 L150,300 L140,286Z" fill="#e8e8f0"/><path d="M150,336 L150,420" stroke="rgba(0,0,0,.4)" stroke-width="3"/><path d="M186,346 L206,344 L206,352 L188,354Z" fill="${c.accent}"/>`,
    jacket: c => `<path d="M18,420 C18,338 68,302 118,294 L150,330 L182,294 C232,302 282,338 282,420Z" fill="${c.color}"/><path d="M130,296 L150,420 L170,296 Q150,314 130,296Z" fill="#241a1e"/><path d="M118,294 L132,420 L96,420Z" fill="${mix(c.color, .1)}"/><path d="M182,294 L168,420 L204,420Z" fill="${mix(c.color, .1)}"/><path d="M118,294 L96,334 M182,294 L204,334" stroke="${c.accent}" stroke-width="3.5" stroke-linecap="round"/>`,
    cardigan: c => `<path d="M26,420 C26,345 72,308 122,298 Q150,326 178,298 C228,308 274,345 274,420Z" fill="${c.color}"/><path d="M134,300 L150,420 L166,300 Q150,318 134,300Z" fill="#f6f6fa"/><g fill="${mix(c.color, -.3)}"><circle cx="150" cy="340" r="3.5"/><circle cx="150" cy="370" r="3.5"/><circle cx="150" cy="400" r="3.5"/></g><path d="M60,360 C100,372 120,372 130,364 M170,364 C180,372 200,372 240,360" stroke="${mix(c.color, -.15)}" stroke-width="2.5" fill="none" opacity=".6"/>`,
    tux: c => `<path d="M20,420 C20,340 70,304 120,296 L150,338 L180,296 C230,304 280,340 280,420Z" fill="#17131c"/><path d="M120,296 L150,348 L180,296 L168,292 L150,306 L132,292Z" fill="#fff"/><path d="M136,306 L150,314 L164,306 L164,322 L150,316 L136,322Z" fill="${c.accent || '#c0182b'}"/>`
  };

  function acc(a, ch) {
    return (ch.acc || []).concat(a || []).map(k => ({
      glasses: `<g fill="rgba(255,255,255,.1)" stroke="#d9b55a" stroke-width="3"><ellipse cx="122" cy="190" rx="25" ry="21"/><ellipse cx="178" cy="190" rx="25" ry="21"/><path d="M147,186 Q150,182 153,186" fill="none"/></g>`,
      necklace: `<path d="M126,302 Q150,336 174,302" fill="none" stroke="#e8c26a" stroke-width="2.5"/><circle cx="150" cy="326" r="5.5" fill="#5fd6c2" stroke="#e8c26a" stroke-width="2"/>`,
      pearl: `<path d="M122,300 Q150,334 178,300" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="1 7" stroke-linecap="round"/>`,
      earring: `<circle cx="92" cy="226" r="4" fill="#e8c26a"/><circle cx="92" cy="236" r="4" fill="#5fd6c2"/><circle cx="208" cy="226" r="4" fill="#e8c26a"/><circle cx="208" cy="236" r="4" fill="#5fd6c2"/>`,
      wing: `<path d="M92,222 q-18,8 -24,26 q16,-6 24,-6z M208,222 q18,8 24,26 q-16,-6 -24,-6z" fill="#cfe2ff" stroke="#fff" stroke-width="1.5"/>`,
      veil: ``,
      tiara: `<path d="M110,76 L120,58 L132,72 L150,50 L168,72 L180,58 L190,76 Q150,66 110,76Z" fill="#f0d27a" stroke="#fff" stroke-width="1.5"/>`,
      blood: `<path d="M158,254 q4,12 0,22" stroke="#c0182b" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="196" cy="216" rx="10" ry="7" fill="rgba(110,50,140,.38)"/>`,
      chain: `<path d="M128,306 Q150,338 172,306" fill="none" stroke="#d9d9e6" stroke-width="3"/><circle cx="150" cy="332" r="4" fill="#e0a030"/>`,
      scarf: `<path d="M116,290 Q150,332 184,290 L178,316 Q150,342 122,316Z" fill="#b9c7e0"/><path d="M160,326 L170,366 L156,362Z" fill="#a7b7d6"/>`,
      mole: `<circle cx="190" cy="214" r="2.6" fill="#3a2a2a"/>`,
      scar: `<path d="M190,170 l12,22" stroke="#b34" stroke-width="2.5" opacity=".7"/>`
    }[k] || '')).join('');
  }

  // 立繪：ch = CHARS[id]，m = 表情，o = 衣著 key 或自訂 outfit 物件
  function portrait(id, m = 'normal', o, extra) {
    const ch = CHARS[id]; if (!ch) return '';
    const im = charImg(id, m, o); if (im) return `<img class="portrait" src="assets/chars/${im}.webp" alt="">`;
    const u = ++uid;
    const outfit = typeof o === 'object' && o ? o : (ch.outfits && ch.outfits[o]) || ch.outfit;
    const hs = HAIR[(outfit && outfit.hair) || ch.hair] || HAIR.side;
    const face = ch.g === 'm' ? 'M92,156 C92,215 112,262 150,276 C188,262 208,215 208,156 C208,108 186,88 150,88 C114,88 92,108 92,156Z' : 'M92,158 C92,228 126,272 150,272 C174,272 208,228 208,158 C208,108 184,88 150,88 C116,88 92,108 92,158Z';
    const veil = ((ch.acc || []).concat(outfit.acc || []).includes('veil')) ? `<path d="M66,70 C36,200 36,330 24,420 L276,420 C264,330 264,200 234,70 C190,30 110,30 66,70Z" fill="rgba(255,255,255,.3)" stroke="rgba(255,255,255,.6)" stroke-width="2"/>` : '';
    const blush = ch.g === 'f' ? `<ellipse cx="106" cy="222" rx="14" ry="7" fill="${m === 'angry' ? 'rgba(255,60,80,.3)' : 'rgba(255,120,140,.28)'}"/><ellipse cx="194" cy="222" rx="14" ry="7" fill="${m === 'angry' ? 'rgba(255,60,80,.3)' : 'rgba(255,120,140,.28)'}"/>` : '';
    const hl = `<path d="M110,92 C128,80 150,78 170,86" stroke="${mix(ch.hairC, .5)}" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>`;
    return `<svg class="portrait" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="${hs.back}" fill="${ch.hairC}"/>${veil}
${(BODY[outfit.type] || BODY.suit)(outfit)}
<path d="M132,258 L132,304 Q150,318 168,304 L168,258Z" fill="${mix(ch.skin, -.1)}"/>
<path d="${face}" fill="${ch.skin}"/><path d="M96,200 C100,240 126,268 150,272" fill="none" stroke="${mix(ch.skin, -.08)}" stroke-width="6" opacity=".4"/>
${blush}${eye(122, 1, m, ch, u)}${eye(178, -1, m, ch, u)}${brow(122, 1, m, ch.hairC)}${brow(178, -1, m, ch.hairC)}
<path d="M150,210 q-3,10 1,14" stroke="${mix(ch.skin, -.25)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${mouth(m, ch)}
<path d="${hs.front}" fill="${ch.hairC}" stroke="${mix(ch.hairC, -.3)}" stroke-width="1.5" stroke-linejoin="round"/>${hl}
${acc(outfit.acc, ch)}${extra || ''}</svg>`;
  }

  // ---------- 場景 ----------
  const SC = {
    wedding: { g: ['#fff3f6', '#f7c9d8', '#b9728f'], fx: ['arches', 'carpet', 'bokeh:#fff:20', 'garland'] },
    rebirth: { g: ['#ffffff', '#e9d9ff', '#9b8cc9'], fx: ['bokeh:#fff:30'] },
    black: { g: ['#050207', '#0b0510', '#1a0b22'], fx: [] },
    gala: { g: ['#1b1440', '#3b2468', '#8a4d8c'], fx: ['columns', 'chandelier', 'bokeh:#ffd68a:28', 'floor'] },
    mansion: { g: ['#2b1f33', '#5b3f57', '#b98d86'], fx: ['window', 'columns', 'floor', 'bokeh:#ffe2b0:10'] },
    office: { g: ['#121b3a', '#2d4a78', '#f0a67a'], fx: ['skyline', 'deskline', 'bokeh:#9fd0ff:12'] },
    boardroom: { g: ['#10162e', '#233559', '#6a86b3'], fx: ['skyline', 'table', 'bokeh:#9fd0ff:10'] },
    press: { g: ['#0b0612', '#25103a', '#5a2a63'], fx: ['spots', 'bokeh:#fff:24', 'floor'] },
    street: { g: ['#080b1e', '#1c2250', '#6a4f8a'], fx: ['skyline', 'bokeh:#ffd0a0:26', 'rain'] },
    court: { g: ['#2a1c14', '#5a3b28', '#a8764b'], fx: ['columns', 'bench', 'bokeh:#ffe0a0:8'] },
    room: { g: ['#2c1b3a', '#6a4670', '#e9b7c4'], fx: ['window', 'bokeh:#fff:12', 'floor'] },
    car: { g: ['#06070f', '#171a3a', '#3d3a6a'], fx: ['bokeh:#ff9f7a:22', 'bokeh:#9fd0ff:14', 'rain'] },
    desk: { g: ['#3a2a30', '#6b4d52', '#caa08a'], fx: ['bokeh:#fff:6'] }
  };
  function bgSvg(id) {
    if (has('bg', id)) return `<img class="bgimg" src="assets/bg/${id}.webp" alt="">`;
    return bgRaw(id);
  }
  function bgRaw(id) {
    const sc = SC[id] || SC.mansion, r = rng(id.length * 977 + id.charCodeAt(0));
    let d = `<defs><linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sc.g[0]}"/><stop offset=".55" stop-color="${sc.g[1]}"/><stop offset="1" stop-color="${sc.g[2]}"/></linearGradient><radialGradient id="vg${id}" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs><rect width="360" height="640" fill="url(#bg${id})"/>`;
    for (const f of sc.fx) {
      const [k, a, b] = f.split(':');
      if (k === 'bokeh') for (let i = 0; i < +b; i++) d += `<circle cx="${r() * 360}" cy="${r() * 520}" r="${4 + r() * 16}" fill="${a}" opacity="${.05 + r() * .16}"/>`;
      else if (k === 'columns') for (const x of [18, 342]) d += `<rect x="${x - 14}" y="0" width="28" height="560" fill="rgba(255,255,255,.1)"/><rect x="${x - 18}" y="520" width="36" height="40" fill="rgba(0,0,0,.2)"/>`;
      else if (k === 'arches') for (let i = 0; i < 3; i++) d += `<path d="M${20 + i * 110},470 L${20 + i * 110},200 Q${75 + i * 110},90 ${130 + i * 110},200 L${130 + i * 110},470Z" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="3"/>`;
      else if (k === 'carpet') d += `<path d="M130,640 L230,640 L215,440 L145,440Z" fill="#b32a4a"/><path d="M0,520 L360,520 L360,640 L0,640Z" fill="rgba(255,240,245,.55)"/>`;
      else if (k === 'garland') d += `<path d="M0,60 Q90,130 180,60 T360,60" fill="none" stroke="#f6a9c0" stroke-width="10" stroke-linecap="round"/>` + [30, 90, 150, 210, 270, 330].map(x => `<circle cx="${x}" cy="${70 + Math.sin(x / 60) * 25}" r="9" fill="#fff"/>`).join('');
      else if (k === 'chandelier') d += `<path d="M180,0 L180,60 M120,90 Q180,60 240,90" stroke="#f0d27a" stroke-width="3" fill="none"/>` + [120, 150, 180, 210, 240].map(x => `<circle cx="${x}" cy="${96 + Math.abs(x - 180) / 4}" r="7" fill="#ffe9a8"/><circle cx="${x}" cy="${96 + Math.abs(x - 180) / 4}" r="22" fill="#ffe9a8" opacity=".2"/>`).join('');
      else if (k === 'floor') d += `<rect y="500" width="360" height="140" fill="rgba(0,0,0,.28)"/><path d="M0,500 L360,500" stroke="rgba(255,255,255,.18)"/>`;
      else if (k === 'window') d += `<rect x="60" y="90" width="240" height="280" rx="6" fill="rgba(180,210,255,.28)" stroke="rgba(255,255,255,.4)" stroke-width="4"/><path d="M180,90 V370 M60,230 H300" stroke="rgba(255,255,255,.4)" stroke-width="3"/>`;
      else if (k === 'skyline') { let x = 0; while (x < 360) { const w = 20 + r() * 34, h = 80 + r() * 220; d += `<rect x="${x}" y="${470 - h}" width="${w}" height="${h}" fill="rgba(10,15,40,.62)"/>`; for (let i = 0; i < 6; i++) d += `<rect x="${x + 4 + r() * (w - 10)}" y="${470 - h + 8 + r() * (h - 16)}" width="4" height="5" fill="#ffd98a" opacity=".7"/>`; x += w + 2; } }
      else if (k === 'deskline') d += `<rect y="520" width="360" height="120" fill="rgba(40,20,20,.55)"/>`;
      else if (k === 'table') d += `<path d="M0,540 Q180,500 360,540 L360,640 L0,640Z" fill="rgba(30,18,18,.7)"/>`;
      else if (k === 'spots') d += [70, 180, 290].map(x => `<path d="M${x},0 L${x - 60},560 L${x + 60},560Z" fill="rgba(255,255,255,.07)"/>`).join('');
      else if (k === 'bench') d += `<rect y="540" width="360" height="100" fill="rgba(30,18,10,.6)"/><rect x="120" y="150" width="120" height="14" fill="rgba(255,225,160,.35)"/>`;
      else if (k === 'rain') for (let i = 0; i < 40; i++) { const x = r() * 360, y = r() * 640; d += `<path d="M${x},${y} l-5,16" stroke="rgba(200,220,255,.28)" stroke-width="1.2"/>`; }
    }
    return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${d}<rect width="360" height="640" fill="url(#vg${id})"/></svg>`;
  }

  // CG：兩個角色＋場景＋標題框
  function cg(def) {
    if (def.id && has('cg', def.id)) return `<img class="cgimg" src="assets/cg/${def.id}.webp" alt="">`;
    const parts = (def.cast || []).map(([id, m, x, sc, o, flip]) => `<g transform="${flip ? `translate(${x + 300 * sc},${640 - 420 * sc - 60}) scale(${-sc},${sc})` : `translate(${x},${640 - 420 * sc - 60}) scale(${sc})`}">${portrait(id, m, o).replace('<svg class="portrait" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">', '<g>').replace('</svg>', '</g>')}</g>`).join('');
    const hearts = def.warm ? [...Array(10)].map((_, i) => `<path d="M${40 + i * 30},${90 + (i * 53) % 200} c-6,-8 -16,0 -8,8 l8,8 l8,-8 c8,-8 -2,-16 -8,-8z" fill="#ff7aa0" opacity=".5"/>`).join('') : '';
    return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${bgRaw(def.bg).replace(/<svg[^>]*>/, '<g>').replace('</svg>', '</g>')}${hearts}${parts}<rect width="360" height="640" fill="url(#cgv)"/><defs><linearGradient id="cgv" x1="0" y1=".6" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></linearGradient></defs><rect x="6" y="6" width="348" height="628" fill="none" stroke="#f5c46b" stroke-width="3" rx="10"/></svg>`;
  }
  return { portrait, bgSvg, cg, mix, has };
})();
