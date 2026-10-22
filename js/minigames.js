// 小遊戲池：每款 60 秒內、單指、輸咗都會推進劇情
const DRESS_SETS = {
  star: { theme: '星河', hint: '銀藍・閃耀・優雅', slots: [
    { name: '禮服', key: 'dress', opts: [
      { n: '星河藍紗裙', color: '#4f6dd8', sparkle: true, score: 40 }, { n: '正紅長裙', color: '#d62d4f', score: 22 },
      { n: '黑色小禮服', color: '#22222c', score: 14 }, { n: '素白襯衫裙', color: '#e9e5ee', score: 6 }] },
    { name: '首飾', key: 'acc', opts: [
      { n: '銀羽耳環', acc: ['earring', 'wing'], score: 30 }, { n: '珍珠項鍊', acc: ['pearl'], score: 20 },
      { n: '翡翠項鍊（陸家）', acc: ['necklace'], score: 6 }, { n: '什麼都不戴', acc: [], score: 4 }] },
    { name: '髮型', key: 'hair', opts: [
      { n: '優雅盤發', hair: 'updo', score: 30 }, { n: '披肩長髮', hair: 'long', score: 22 }, { n: '阿姨髮髻', hair: 'bun', score: 4 }] }
  ] },
  night: { theme: '黑金之夜', hint: '黑金・氣場・貴氣', slots: [
    { name: '禮服', key: 'dress', opts: [
      { n: '黑金魚尾裙', color: '#1b1b2a', sparkle: true, score: 40 }, { n: '香檳色禮服', color: '#e6c996', score: 22 },
      { n: '粉色公主裙', color: '#f7a8c4', score: 10 }, { n: '白色 T 恤裙', color: '#f2f2f2', score: 4 }] },
    { name: '首飾', key: 'acc', opts: [
      { n: '金色寶石項鍊', acc: ['necklace', 'tiara'], score: 30 }, { n: '鑽石耳環', acc: ['earring'], score: 22 },
      { n: '珍珠項鍊', acc: ['pearl'], score: 12 }, { n: '不戴', acc: [], score: 5 }] },
    { name: '髮型', key: 'hair', opts: [
      { n: '利落盤發', hair: 'updo', score: 30 }, { n: '披肩長髮', hair: 'long', score: 25 }, { n: '阿姨髮髻', hair: 'bun', score: 6 }] }
  ] }
};

const Minigames = (() => {
  const ICON = {
    paper: '<rect x="14" y="8" width="36" height="48" rx="3" fill="#fff"/><path d="M20 20h24M20 28h24M20 36h16" stroke="#9aa" stroke-width="3"/>',
    usb: '<rect x="18" y="20" width="28" height="30" rx="4" fill="#4a5a8a"/><rect x="24" y="8" width="16" height="14" fill="#cfd6e6"/><rect x="27" y="11" width="3" height="5" fill="#333"/><rect x="34" y="11" width="3" height="5" fill="#333"/>',
    laptop: '<rect x="10" y="14" width="44" height="28" rx="3" fill="#3b3f55"/><rect x="14" y="18" width="36" height="20" fill="#7fb2ff"/><path d="M4 46h56l-6 8H10z" fill="#9aa0b8"/>',
    cup: '<path d="M16 20h28v22a10 10 0 0 1-10 10h-8a10 10 0 0 1-10-10z" fill="#f4eee6"/><path d="M44 26h6a6 6 0 0 1 0 12h-6" fill="none" stroke="#f4eee6" stroke-width="4"/><path d="M24 12q4-6 0-10M34 12q4-6 0-10" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>',
    phone: '<rect x="20" y="6" width="24" height="52" rx="5" fill="#22232e"/><rect x="23" y="12" width="18" height="36" fill="#6fa8ff"/>',
    receipt: '<path d="M16 6h32v52l-6-4-6 4-4-4-4 4-6-4-6 4z" fill="#fffbe8"/><path d="M22 18h20M22 26h20M22 34h12" stroke="#aa9" stroke-width="3"/>',
    book: '<rect x="12" y="10" width="40" height="46" rx="3" fill="#8a3b4a"/><rect x="18" y="10" width="4" height="46" fill="#6a2a38"/><path d="M28 24h18M28 32h14" stroke="#f5d9a0" stroke-width="3"/>',
    plant: '<path d="M22 40h20l-3 18H25z" fill="#b5654a"/><path d="M32 40C20 34 18 20 24 10c6 8 10 16 8 30zM32 40C44 34 46 20 40 10c-6 8-10 16-8 30z" fill="#4ea36a"/>'
  };
  // 開局說明卡：玩家按「開始」先計時
  const intro = (root, o) => new Promise(r => {
    const d = document.createElement('div'); d.className = 'mg-intro';
    d.innerHTML = `<div class="mgi-card"><div class="mgi-ic">${o.icon}</div><h3>${esc(o.title)}</h3><p class="mgi-goal">${o.goal}</p><ol>${o.steps.map(t => `<li>${t}</li>`).join('')}</ol><p class="mgi-lose">${o.lose}</p><button class="btn gold">開始（${o.time} 秒）</button></div>`;
    root.appendChild(d); d.querySelector('button').onclick = () => { Sfx.play('tap'); d.remove(); r(); };
  });
  const evIcon = (t, flaw) => Art.has('evidence', `${t}_${flaw ? 'suspicious' : 'normal'}`) ? `<img src="assets/evidence/${t}_${flaw ? 'suspicious' : 'normal'}.webp" alt="">` : `<svg viewBox="0 0 64 64">${ICON[t]}</svg>`;
  const wrap = (cls, inner) => { const d = document.createElement('div'); d.className = 'mg ' + cls; d.innerHTML = inner; return d; };

  function evidence(cfg, host) {
    return new Promise(async res => {
      const items = cfg.items, need = cfg.need || 2, total = items.filter(i => i.flaw).length;
      const root = wrap('mg-ev', `<div class="mg-top"><b>🔍 ${esc(cfg.title || '找出破綻')}</b><span class="mg-count">0 / ${need}</span></div><div class="mg-bar"><i></i></div><div class="ev-scene">${Art.bgSvg(cfg.bg === 'desk' ? 'desk' : 'room')}${items.map((it, i) => `<button class="ev-item" data-i="${i}" style="left:${it.x}%;top:${it.y}%">${evIcon(it.t, it.flaw)}</button>`).join('')}</div><div class="mg-foot"><span class="mg-tip">點擊有發光邊、看起來不對勁的物件</span><button class="btn ghost sm" data-hint>提示</button></div>`);
      host.appendChild(root);
      await intro(root, { icon: '🔍', title: cfg.title || '找出破綻', time: cfg.time, goal: `房間裡藏着 <b>${total}</b> 件可疑物件，至少找出 <b>${need}</b> 件。`,
        steps: ['看一看桌上的物件，找出「樣子怪怪」的（顏色、缺角、來路不明）', '直接點它，破綻就會寫出來', '點錯扣 2 秒；卡住就按「提示」，可疑物件會發光'], lose: '時間到仍未找夠，只會令劇情難一點，不會失敗結束。' });
      const t0 = Date.now(), dur = cfg.time * 1000; let found = 0, penalty = 0, done = false, hinted = false;
      const bar = $('.mg-bar i', root), cnt = $('.mg-count', root), tip = $('.mg-tip', root);
      const finish = () => {
        if (done) return; done = true; clearInterval(tm);
        const win = found >= need; Sfx.play(win ? 'win' : 'lose');
        setTimeout(() => { root.remove(); res({ win, score: found / Math.max(total, 1) }); }, 900);
        tip.textContent = win ? `找到 ${found} 處破綻！` : `只找到 ${found} 處……`;
      };
      const tm = setInterval(() => { const r = 1 - (Date.now() - t0 + penalty) / dur; bar.style.width = clamp(r * 100, 0, 100) + '%'; if (r < .35) bar.classList.add('low'); if (r <= 0) finish(); if (r < .6 && !hinted) { hinted = true; $$('.ev-item', root).forEach(b => items[b.dataset.i].flaw && b.classList.add('glint')); } }, 100);
      root.addEventListener('click', e => {
        if (done) return;
        if (e.target.closest('[data-hint]')) { hinted = true; $$('.ev-item', root).forEach(b => items[b.dataset.i].flaw && !b.classList.contains('hit') && b.classList.add('glint')); Sfx.play('tap'); return; }
        const b = e.target.closest('.ev-item'); if (!b || b.classList.contains('hit')) return;
        const it = items[b.dataset.i];
        if (it.flaw) {
          b.classList.add('hit'); b.classList.remove('glint'); found++; cnt.textContent = `${found} / ${need}`; Sfx.play('gem'); vibrate(20);
          b.insertAdjacentHTML('beforeend', `<em>${esc(it.flaw)}</em>`);
          if (found >= total) finish();
        } else { penalty += 2000; b.classList.add('miss'); setTimeout(() => b.classList.remove('miss'), 400); Sfx.play('err'); tip.textContent = '這個沒有問題（-2 秒）'; }
      });
    });
  }

  function dress(cfg, host) {
    const set = DRESS_SETS[cfg.set || 'star'];
    return new Promise(async res => {
      const pick = {}; let tab = 0, done = false;
      const layered = Art.has('dress', 'shen_base');
      const root = wrap('mg-dress', `<div class="mg-top"><b>👗 今晚主題：${esc(set.theme)}</b><span class="mg-count">${esc(set.hint)}</span></div><div class="mg-bar"><i></i></div><div class="dr-stage"><div class="dr-prev"></div><div class="dr-judge"></div></div><div class="dr-tabs"></div><div class="dr-opts"></div><div class="mg-foot"><span class="mg-tip">三格都要選：禮服・首飾・髮型，切換上面分頁；選好按「登場」</span><button class="btn gold" data-go>登場</button></div>`);
      host.appendChild(root);
      const prev = $('.dr-prev', root), tabs = $('.dr-tabs', root), opts = $('.dr-opts', root);
      const outfit = () => { const o = { type: 'dress', color: '#cfc9d6', sparkle: false, acc: [], hair: 'long' }; set.slots.forEach(s => { const p = pick[s.key]; if (!p) return; if (p.color) { o.color = p.color; o.sparkle = !!p.sparkle; } if (p.acc) o.acc = p.acc; if (p.hair) o.hair = p.hair; }); return o; };
      const render = () => {
        if (layered) {
          const L = f => (f && Art.has('dress', f)) ? `<img class="lay" src="assets/dress/${f}.webp" alt="">` : '';
          const pre = cfg.set || 'star', ix = k => pick[k] ? set.slots.find(x => x.key === k).opts.indexOf(pick[k]) : -1;
          prev.innerHTML = `<img class="lay" src="assets/dress/shen_base.webp" alt="">${ix('dress') >= 0 ? L(`${pre}_dress_${ix('dress')}`) : ''}${ix('hair') >= 0 ? L(`${pre}_hair_${ix('hair')}`) : ''}${ix('acc') >= 0 ? L(`${pre}_acc_${ix('acc')}`) : ''}`;
        } else prev.innerHTML = Art.portrait('shen', pick.dress ? 'smile' : 'normal', outfit());
        tabs.innerHTML = set.slots.map((s, i) => `<button class="${i === tab ? 'on' : ''}" data-t="${i}">${s.name}${pick[s.key] ? ' ✓' : ''}</button>`).join('');
        opts.innerHTML = set.slots[tab].opts.map((o, i) => `<button class="${pick[set.slots[tab].key] === o ? 'on' : ''}" data-o="${i}">${o.color ? `<i style="background:${o.color}"></i>` : '<i class="ic">✦</i>'}${esc(o.n)}</button>`).join('');
      };
      render();
      await intro(root, { icon: '👗', title: `換裝：${set.theme}`, time: cfg.time, goal: `今晚主題是「<b>${esc(set.theme)}</b>」（${esc(set.hint)}），打扮到 <b>${cfg.need || 70}</b> 分以上就贏。`,
        steps: ['點上方分頁：禮服、首飾、髮型，每格選一件', '貼合主題顏色與氣質的得分高，土氣或礙眼的得分低', '預覽會即時更新；選好三件按「登場」，時間到會自動登場'], lose: '分數不夠劇情會尷尬，但仍會繼續。' });
      const t0 = Date.now(), dur = cfg.time * 1000, bar = $('.mg-bar i', root);
      const score = () => set.slots.reduce((a, s) => a + (pick[s.key] ? pick[s.key].score : 0), 0);
      const finish = () => {
        if (done) return; done = true; clearInterval(tm);
        const sc = score(), win = sc >= (cfg.need || 70);
        const judge = $('.dr-judge', root); judge.innerHTML = `<div class="stars">${'★'.repeat(sc >= 90 ? 5 : sc >= 70 ? 4 : sc >= 50 ? 3 : 2)}</div><div>${sc >= 90 ? '全場驚艷！' : sc >= 70 ? '目光聚焦' : sc >= 50 ? '中規中矩' : '有點尷尬'}</div><small>${sc} 分</small>`;
        judge.classList.add('show'); Sfx.play(win ? 'win' : 'lose');
        setTimeout(() => { root.remove(); res({ win, score: sc / 100 }); }, 1700);
      };
      const tm = setInterval(() => { const r = 1 - (Date.now() - t0) / dur; bar.style.width = clamp(r * 100, 0, 100) + '%'; if (r < .3) bar.classList.add('low'); if (r <= 0) finish(); }, 100);
      root.addEventListener('click', e => {
        if (done) return;
        const t = e.target.closest('[data-t]'), o = e.target.closest('[data-o]');
        if (t) { tab = +t.dataset.t; Sfx.play('tap'); render(); }
        else if (o) { pick[set.slots[tab].key] = set.slots[tab].opts[+o.dataset.o]; Sfx.play('pick'); if (tab < set.slots.length - 1 && !pick[set.slots[tab + 1].key]) tab++; render(); }
        else if (e.target.closest('[data-go]')) finish();
      });
    });
  }
  return { run: (id, cfg, host) => ({ evidence, dress })[id](cfg, host) };
})();
