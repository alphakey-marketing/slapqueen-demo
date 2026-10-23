// 劇情播放器：固定層。讀劇本節點，駕馭畫面、逆襲值、選項、打臉演出、存檔。
const ABORT = 'abort';
const Player = {
  el: null, ep: null, P: null, replay: false, cast: {}, bgId: null, tapRes: null, abortRej: null, ff: false, choiceN: 0,
  mount(el) { this.el = el; },
  $(s) { return $(s, this.el); },

  async start(ep, { replay = false, resume = false } = {}) {
    this.ep = ep; this.replay = replay; this.choiceN = 0; this.ff = false;
    const real = Store.s.p;
    this.P = replay ? JSON.parse(JSON.stringify(real)) : real;
    if (replay) this.P.rage = 0;
    this.cast = {}; this.bgId = null;
    this.el.innerHTML = this.tpl();
    this.$('.ep-title').textContent = `第${ep.seq}集 ${ep.title}`;
    this.bind(); this.hud();
    let from = 0;
    if (resume && real.cur && real.cur.ep === ep.id) {
      from = real.cur.i; this.P.rage = real.cur.rage;
      if (real.cur.bg) this.setBg(real.cur.bg, true);
      this.cast = real.cur.cast || {}; this.drawChars(); this.hud();
    } else if (!replay) { real.cur = null; Analytics.track('ep_start', { ep: ep.id }); }
    const abort = new Promise((_, rej) => { this.abortRej = rej; });
    abort.catch(() => {});
    this.abortP = abort;
    try { await this.run(ep.nodes, from, true); }
    catch (e) { if (e !== ABORT) { console.error(e); UI.toast('播放出錯，已返回'); } }
  },
  abort() { this.abortRej && this.abortRej(ABORT); Sfx.music(null); },

  tpl() {
    return `<div class="st-bg"></div><div class="st-chars"><div class="char" data-pos="l"></div><div class="char" data-pos="c"></div><div class="char" data-pos="r"></div></div><div class="st-fx"></div>
<div class="st-hud"><button class="hbtn" data-p="menu" aria-label="選單">☰</button><div class="ep-title"></div><div class="hdia" title="鑽石">💎<b></b></div><div class="rage" title="逆襲值"><span>🔥</span><div class="rage-bar"><i></i></div><b>0</b></div><button class="hbtn" data-p="auto">自動</button><button class="hbtn" data-p="ff">快進</button></div>
<div class="st-box"><div class="name"></div><div class="txt"></div><div class="nx">▼</div></div><div class="st-choice"></div><div class="st-layer"></div>`;
  },
  bind() {
    this.el.onclick = e => {
      const b = e.target.closest('[data-p]');
      if (b) {
        const a = b.dataset.p;
        if (a === 'menu') UI.pauseMenu();
        if (a === 'auto') { Store.s.set.auto = !Store.s.set.auto; Store.save(); this.hud(); }
        if (a === 'ff') { this.ff = !this.ff; this.hud(); if (this.ff) this.tap(); }
        return;
      }
      // cg 同結局卡喺 st-layer 入面，要放行點擊
      if (e.target.closest('.cgview,.endcard,.heart')) { this.tap(); return; }
      if (e.target.closest('.st-choice,.st-layer,.mg')) return;
      this.tap();
    };
  },
  tap() { if (this.tapRes) { const r = this.tapRes; this.tapRes = null; r(); } },
  hud() {
    const P = this.P, r = this.$('.rage'); if (!r) return;
    $('i', r).style.width = P.rage + '%'; $('b', r).textContent = P.rage;
    r.classList.toggle('full', P.rage >= 100);
    const hd = this.$('.hdia b'); if (hd) hd.textContent = Store.s.dia;
    this.$('[data-p=auto]').classList.toggle('on', !!Store.s.set.auto);
    this.$('[data-p=ff]').classList.toggle('on', this.ff);
  },
  race(p) { return Promise.race([p, this.abortP]); },
  waitTap(ms) {
    return this.race(new Promise(res => {
      this.tapRes = res;
      const t = (this.ff ? 90 : Store.s.set.auto ? ms : 0);
      if (t) setTimeout(() => { if (this.tapRes === res) { this.tapRes = null; res(); } }, t);
    }));
  },
  async delay(ms) { await this.race(sleep(this.ff ? Math.min(ms, 80) : ms)); },

  checkpoint(i) {
    if (this.replay) return;
    const P = this.P;
    P.cur = { ep: this.ep.id, i, rage: P.rage, bg: this.bgId, cast: JSON.parse(JSON.stringify(this.cast)) };
    Store.save();
  },

  async run(list, from = 0, top = false) {
    const MUT = new Set(['choice', 'game', 'slap', 'give', 'love', 'flag', 'rage', 'route', 'ending', 'cg', 'sys', 'if']);
    for (let i = from; i < list.length; i++) {
      const n = list[i];
      await this.exec(n, i);
      if (top && MUT.has(n.k)) this.checkpoint(i + 1);
    }
  },

  // ───── 條件 ─────
  val(path) {
    const P = this.P;
    if (path.startsWith('flag.r_')) return P.route === path.slice(7);
    if (path.startsWith('flag.')) return !!P.flags[path.slice(5)];
    if (path.startsWith('love.')) return P.love[path.slice(5)];
    if (path.startsWith('item.')) return P.items[path.slice(5)] || 0;
    return { pow: P.power, power: P.power, rage: P.rage, slaps: P.slaps }[path] ?? 0;
  },
  cond(c) {
    return c.split('||').some(or => or.split('&&').every(t => {
      const m = t.trim().match(/^([\w.]+)\s*(>=|<=|==|!=|>|<)?\s*(\d+)?$/); if (!m) return false;
      const v = this.val(m[1]); if (!m[2]) return !!v; const n = +m[3];
      return { '>=': v >= n, '<=': v <= n, '==': v == n, '!=': v != n, '>': v > n, '<': v < n }[m[2]];
    }));
  },

  async exec(n, idx) {
    const P = this.P;
    switch (n.k) {
      case 'bg': this.setBg(n.id); break;
      case 'show': this.show(n); break;
      case 'hide': n.ids.forEach(id => { for (const p in this.cast) if (this.cast[p].id === id) delete this.cast[p]; }); this.drawChars(); break;
      case 'clear': this.cast = {}; this.drawChars(); break;
      case 'mood': for (const p in this.cast) if (this.cast[p].id === n.id) this.cast[p].mood = n.m; this.drawChars(); break;
      case 'mus': Sfx.music(n.m); break;
      case 'say': await this.say(n); break;
      case 'choice': await this.choice(n); break;
      case 'slap': await this.slap(n); break;
      case 'hit': await this.hit(n); break;
      case 'game': await this.game(n); break;
      case 'give': if (!this.replay) await this.give(n); break;
      case 'cg': await this.cgView(n.id); break;
      case 'sys': if (!this.replay) await UI.sys(n.id); break;
      case 'fx': await this.fx(n.name); break;
      case 'rage': P.rage = n.set; this.hud(); break;
      case 'flag': P.flags[n.f] = true; break;
      case 'love': if (!this.replay) await this.addLove(n.m, n.n); break;
      case 'if': await this.run(this.cond(n.c) ? n.then : n.els); break;
      case 'route': await this.route(); break;
      case 'ending': await this.ending(n); break;
      case 'end': await this.end(n); break;
    }
  },

  // ───── 舞台 ─────
  setBg(id, instant) {
    this.bgId = id; const b = this.$('.st-bg');
    const nb = el(`<div class="bgl">${Art.bgSvg(id)}</div>`);
    b.appendChild(nb); requestAnimationFrame(() => nb.classList.add('in'));
    setTimeout(() => { while (b.children.length > 1) b.removeChild(b.firstChild); }, instant ? 0 : 700);
  },
  show(n) {
    for (const p in this.cast) if (this.cast[p].id === n.id) delete this.cast[p];
    const old = this.cast[n.pos];
    this.cast[n.pos] = { id: n.id, mood: n.mood || 'normal', outfit: n.outfit !== undefined ? n.outfit : (old && old.id === n.id ? old.outfit : undefined) };
    this.drawChars(n.pos);
    if (!Store.s.gal.chr[n.id]) { Store.s.gal.chr[n.id] = Date.now(); Store.save(); }
  },
  drawChars(enterPos) {
    for (const pos of ['l', 'c', 'r']) {
      const d = this.$(`.char[data-pos=${pos}]`), c = this.cast[pos];
      if (!c) { d.innerHTML = ''; d.dataset.id = ''; continue; }
      const key = `${c.id}|${c.mood}|${c.outfit && (c.outfit.type || c.outfit)}`;
      if (d.dataset.key !== key) { d.innerHTML = Art.portrait(c.id, c.mood, c.outfit); d.dataset.key = key; }
      d.dataset.id = c.id;
      if (enterPos === pos) { d.classList.remove('enter'); void d.offsetWidth; d.classList.add('enter'); }
    }
  },
  speakers(id) { $$('.char', this.el).forEach(d => d.classList.toggle('dim', !!id && d.dataset.id !== id && d.dataset.id !== '')); },

  async say(n) {
    const P = this.P;
    if (n.mood && n.who) for (const p in this.cast) if (this.cast[p].id === n.who) { this.cast[p].mood = n.mood; this.drawChars(); }
    this.speakers(n.who);
    const box = this.$('.st-box'), nm = this.$('.name'), tx = this.$('.txt');
    box.className = 'st-box on' + (n.who ? '' : ' nar') + (n.think ? ' think' : '');
    nm.textContent = n.who ? CHARS[n.who].name : ''; nm.style.setProperty('--c', n.who ? CHARS[n.who].color : '#fff');
    nm.style.display = n.who ? '' : 'none';
    const text = n.think ? `（${n.t}）` : n.t;
    this.$('.nx').style.visibility = 'hidden';
    if (n.h && !this.replay) {
      const before = P.rage; P.rage = clamp(P.rage + n.h, 0, 100);
      if (P.rage > before) { Sfx.play('rage'); this.floatText(`逆襲值 +${P.rage - before}`); if (P.rage >= 100 && before < 100) { vibrate([40, 30, 40]); this.floatText('逆襲值滿格！', 1); } }
      this.hud();
    }
    // 打字機
    let k = 0, done = false; tx.textContent = '';
    const speed = (this.ff ? 3 : 1) * Store.s.set.speed;
    await this.race(new Promise(res => {
      const tm = setInterval(() => { k += 1; tx.textContent = text.slice(0, k); if (k >= text.length) { clearInterval(tm); done = true; res(); } }, 32 / speed);
      this.tapRes = () => { clearInterval(tm); tx.textContent = text; done = true; res(); };
    }));
    this.tapRes = null;
    this.$('.nx').style.visibility = 'visible';
    await this.waitTap(Math.max(1100, text.length * 90));
  },
  floatText(t, big) {
    const f = el(`<div class="float${big ? ' big' : ''}">${esc(t)}</div>`); this.$('.st-fx').appendChild(f); setTimeout(() => f.remove(), 1600);
  },
  async fx(name) {
    const f = this.$('.st-fx');
    if (name === 'shake') { this.el.classList.add('shake'); Sfx.play('hit'); vibrate(80); await this.delay(500); this.el.classList.remove('shake'); }
    else if (name === 'flash') { const d = el('<div class="flash"></div>'); f.appendChild(d); await this.delay(350); d.remove(); }
    else if (name === 'black') { const d = el('<div class="blackout"></div>'); f.appendChild(d); this.$('.st-box').className = 'st-box'; await this.delay(900); d.classList.add('out'); setTimeout(() => d.remove(), 600); }
    else if (name === 'rebirth') {
      this.$('.st-box').className = 'st-box'; const d = el('<div class="rebirth"><span>重生</span></div>'); f.appendChild(d); Sfx.play('win'); await this.delay(2200); d.classList.add('out'); setTimeout(() => d.remove(), 800);
    }
  },

  // ───── 選項 ─────
  affordable(o) {
    if (o.kind === 'h') return this.reqOk(o.req);
    return true;
  },
  reqOk(r) {
    if (!r) return true; const P = this.P;
    if (r.pow && P.power < r.pow) return false;
    if (r.item && !(P.items[r.item] > 0)) return false;
    if (r.love) for (const m in r.love) if (P.love[m] < r.love[m]) return false;
    return true;
  },
  reqText(r) {
    if (r.pow) return `需要${THEME.power.name} ${r.pow}（現有 ${this.P.power}）`;
    if (r.item) return `需要${THEME.item.name}`;
    return '條件未達成';
  },
  async choice(n) {
    const P = this.P, key = `${this.ep.id}#${this.choiceN++}`;
    this.$('.st-box').className = 'st-box'; this.speakers(null);
    let picked;
    if (this.replay) {
      const rec = Store.s.p.picks[key]; picked = n.opts[rec != null ? rec : n.opts.findIndex(o => o.kind === 'n' || !o.kind)];
      if (!picked) picked = n.opts[0];
    } else {
      const wrap = this.$('.st-choice'); const slapTime = P.rage >= 100;
      const firstFree = !Store.s.tut.freeUsed;
      wrap.className = 'st-choice on' + (slapTime ? ' slap-time' : '');
      wrap.innerHTML = (slapTime ? '<div class="slap-banner">⚡ 打臉時刻 ⚡</div>' : '') + `<div class="q">${esc(n.q)}</div>` + n.opts.map((o, i) => {
        const free = o.free && firstFree, season = Store.s.own.season && (o.kind === 's' || o.kind === 'l');
        const locked = o.kind === 'h' && !this.reqOk(o.req);
        const price = (o.kind === 's' || o.kind === 'l') ? (free ? '<em>首次免費</em>' : season ? '<em>已買斷</em>' : `<em>💎${o.cost}</em>`) : '';
        const tag = { s: '爽', l: '心動', h: '隱藏' }[o.kind] || '';
        return `<button class="opt k-${o.kind || 'n'}${locked ? ' locked' : ''}" data-i="${i}">${tag ? `<i class="tag">${tag}</i>` : ''}<span>${esc(o.t)}</span>${price}${locked ? `<small>🔒 ${this.reqText(o.req)}</small>` : o.kind === 'h' ? '<small>✨ 條件已達成</small>' : ''}${o.love ? '<u>' + Object.keys(o.love).map(m => (CHARS[m] ? '💗' : '')).join('') + '</u>' : ''}</button>`;
      }).join('');
      Analytics.track('choice_show', { ep: this.ep.id, n: this.choiceN });
      for (;;) {
        const i = await this.race(new Promise(res => { wrap.onclick = e => { const b = e.target.closest('.opt'); if (b) res(+b.dataset.i); }; }));
        const o = n.opts[i];
        if (o.kind === 'h' && !this.reqOk(o.req)) { Sfx.play('err'); UI.toast(this.reqText(o.req)); continue; }
        if (o.kind === 's' || o.kind === 'l') {
          const free = o.free && firstFree, season = Store.s.own.season;
          if (!free && !season) {
            if (!Eco.spendDia(o.cost, 'opt_' + o.kind)) { Sfx.play('err'); const got = await UI.needDia(o.cost); if (!got) continue; Eco.spendDia(o.cost, 'opt_' + o.kind); }
          }
          if (free) { Store.s.tut.freeUsed = true; Store.save(); }
          Sfx.play(o.kind === 'l' ? 'heart' : 'super');
        } else Sfx.play('pick');
        if (o.kind === 'h' && o.req && o.req.item) { P.items[o.req.item]--; }
        picked = o; Store.s.p.picks[key] = i; Analytics.track('choice', { ep: this.ep.id, n: this.choiceN, kind: o.kind || 'n' });
        break;
      }
      wrap.className = 'st-choice'; wrap.innerHTML = '';
      if (picked.kind === 's' || picked.kind === 'l') await this.sparkle(picked.kind);
    }
    if (!this.replay) {
      if (picked.love) for (const m in picked.love) await this.addLove(m, picked.love[m]);
      if (picked.pow) P.power += picked.pow;
    }
    if (picked.then) await this.run(picked.then);
  },
  async sparkle(kind) {
    const d = el(`<div class="sparkle ${kind}"></div>`); this.$('.st-fx').appendChild(d); await this.delay(650); d.remove();
  },
  async addLove(m, n) {
    const P = this.P;
    if (this.replay) return;
    const lv0 = Eco.love(m); P.love[m] = clamp(P.love[m] + n, 0, 100);
    if (m === 'lu') return;
    this.floatText(`${CHARS[m].name} 好感 +${n}`); Sfx.play('heart');
    const lv1 = Eco.love(m);
    if (lv1 > lv0) for (let l = lv0 + 1; l <= lv1; l++) { await this.heartScene(m, l); await this.cgView(`love_${m}_${l}`, `${CHARS[m].name}・好感度升級：${CONFIG.loveNames[l]}`); }
  },
  // 心動戲：升級 CG 之前先演一小段
  async heartScene(m, l) {
    const sc = window.HEART && HEART[m] && HEART[m][l]; if (!sc) return;
    this.$('.st-box').className = 'st-box';
    const c = CHARS[m].color || '#ff8fb0';
    const v = el(`<div class="heart"><div class="ht-bg">${Art.bgSvg(sc.bg)}</div><div class="ht-who">${Art.portrait(m, sc.mood || 'normal')}</div><div class="ht-tag">♥ ${esc(CHARS[m].name)}・${CONFIG.loveNames[l]}</div><div class="ht-box"><b></b><p></p><i>▼</i></div></div>`);
    this.$('.st-layer').appendChild(v); Sfx.play('heart'); await this.delay(400);
    const nm = $('b', v), tx = $('p', v);
    for (const [w, t] of sc.lines) {
      nm.textContent = w === 'm' ? CHARS[m].name : w === 's' ? '（心聲）' : ''; nm.style.background = w === 'm' ? c : '#8a5aa8'; nm.style.display = w === 'n' ? 'none' : '';
      tx.textContent = t; tx.className = w === 'n' ? 'nar' : w === 's' ? 'think' : '';
      await this.waitTap(0);
    }
    v.classList.add('out'); await this.delay(350); v.remove();
  },
  async give(n) {
    const P = this.P, bits = [];
    if (n.dia) { Eco.addDia(n.dia, 'story'); bits.push(`💎 ${n.dia}`); Sfx.play('gem'); }
    if (n.ticket) { Eco.addTicket(n.ticket); bits.push(`🎫 ${n.ticket}`); }
    if (n.pow) { P.power += n.pow; bits.push(`${THEME.power.icon} ${THEME.power.name} +${n.pow}`); }
    if (n.item) { P.items[n.item] = (P.items[n.item] || 0) + (n.n || 1); bits.push(`${THEME.item.icon} ${THEME.item.name}`); }
    if (bits.length) { this.floatText(bits.join('　'), 1); await this.delay(900); }
    Store.save();
  },

  // ───── 打臉演出 ─────
  async hit(n) {
    this.$('.st-box').className = 'st-box'; this.speakers(null);
    if (n.on) for (const p in this.cast) if (this.cast[p].id === n.on) this.cast[p].mood = 'shock';
    this.drawChars(); this.floatText(n.text || '', true);
    this.el.classList.add('shake'); Sfx.play('hit'); vibrate(60);
    await this.delay(1100); this.el.classList.remove('shake');
  },
  async slap(n) {
    const P = this.P, full = n.size === 'big' && P.rage >= 100;
    const L = this.$('.st-layer'); this.$('.st-box').className = 'st-box'; this.speakers(null);
    const tgt = n.on && CHARS[n.on] ? n.on : 'lu';
    const cut = el(`<div class="slapcut ${full ? 'big' : 'small'}"><div class="lines"></div><div class="face">${Art.portrait(tgt, 'shock')}</div><div class="word">${esc(n.text || '打臉！')}</div></div>`);
    L.appendChild(cut); Sfx.play('hit'); vibrate(full ? [60, 40, 120] : 40);
    this.el.classList.add('shake');
    await this.delay(full ? 1500 : 800);
    this.el.classList.remove('shake');
    if (full) {
      const dm = n.danmaku || DM.slap;
      for (let i = 0; i < 8; i++) {
        const d = el(`<div class="dm" style="top:${10 + (i * 37) % 70}%;animation-duration:${3 + (i % 3) * .6}s;animation-delay:${i * .22}s">${esc(dm[i % dm.length])}</div>`); cut.appendChild(d);
      }
      await this.delay(2300);
    }
    cut.classList.add('out'); await this.delay(350); cut.remove();
    P.rage = 0; this.hud();
    if (!this.replay) {
      if (full) {
        P.slaps++;
        const dia = n.dia ?? 5, pow = n.pow ?? 3;
        Eco.addDia(dia, 'slap'); P.power += pow; Sfx.play('win');
        Analytics.track('slap', { ep: this.ep.id });
        const r = el(`<div class="reward"><h3>打臉成功！</h3><p>逆襲值已清空</p><div class="chips"><span>💎 +${dia}</span><span>${THEME.power.icon} +${pow}</span></div>${Eco.isVip() ? '' : '<button class="btn gold sm" data-x2>📺 看廣告，鑽石 ×2</button>'}<button class="btn sm" data-ok>繼續</button></div>`);
        L.appendChild(r);
        await this.race(new Promise(res => {
          r.onclick = async e => {
            if (e.target.closest('[data-x2]')) { const b = e.target.closest('[data-x2]'); b.disabled = true; if (await Monet.rewardAd('slap_x2')) { Eco.addDia(dia, 'slap_x2'); this.floatText(`💎 +${dia} 雙倍！`, 1); } r.remove(); res(); }
            else if (e.target.closest('[data-ok]')) { r.remove(); res(); }
          };
        }));
      } else { P.power += 1; }
    }
    if (n.cg) await this.cgView(n.cg);
  },

  // ───── 小遊戲 ─────
  async game(n) {
    const key = `${this.ep.id}#g`;
    let r;
    if (this.replay) { r = { win: Store.s.p.picks[key] !== 0 }; }
    else {
      this.$('.st-box').className = 'st-box'; Sfx.music('tense');
      Analytics.track('game_start', { ep: this.ep.id, g: n.id });
      r = await this.race(Minigames.run(n.id, n.cfg, this.$('.st-layer')));
      Analytics.track('game_end', { ep: this.ep.id, g: n.id, win: r.win });
      Store.s.p.picks[key] = r.win ? 1 : 0;
    }
    this.P.flags[n.id === 'dress' ? 'dress_win' : 'evidence_win'] = r.win;
    await this.run(r.win ? n.win : n.lose);
    if (!this.replay && r.win) {
      const bonus = n.id === 'dress' ? 1 : 1; this.P.power += bonus;
    }
  },

  // ───── CG ─────
  async cgView(id, title) {
    const def = CGS[id]; if (!def) return;
    const isNew = !Store.s.gal.cg[id];
    if (this.replay && !isNew) return;
    if (isNew) { Store.s.gal.cg[id] = Date.now(); Store.save(); Analytics.track('cg', { id }); }
    this.$('.st-box').className = 'st-box';
    const L = this.$('.st-layer');
    const v = el(`<div class="cgview"><div class="cgart">${Art.cg(def)}</div><div class="cgcap">${isNew ? '<span class="new">NEW 名場面</span>' : ''}<h3>${esc(title || def.name)}</h3><p>${esc(def.line || '')}</p></div></div>`);
    L.appendChild(v); Sfx.play(def.love ? 'heart' : 'win'); await this.delay(500);
    await this.waitTap(3500); v.classList.add('out'); await this.delay(350); v.remove();
  },

  // ───── 選線 / 結局 / 完結 ─────
  async route() {
    if (this.replay) { return; }
    const P = this.P;
    this.$('.st-box').className = 'st-box';
    P.snap = JSON.parse(JSON.stringify({ love: P.love, power: P.power, rage: P.rage, items: P.items, slaps: P.slaps, flags: P.flags }));
    const choice = await this.race(UI.routeSelect(this.$('.st-layer')));
    P.route = choice; Store.save(); Analytics.track('route', { r: choice });
    if (choice === 'all') P.rage = Math.max(P.rage, 100);
    const names = THEME.routeName; this.floatText(`選擇：${names[choice]}`, 1); await this.delay(1000);
  },
  async ending(n) {
    const P = this.P, r = n.r;
    const love = P.love[r] || 0, slaps = P.slaps;
    const G = CONFIG.endGrade, L3 = ['gu', 'wen', 'xiao'].map(m => P.love[m] || 0);
    let grade, shown = love;
    if (r === 'all') { shown = Math.min(...L3); grade = shown >= G.all.p ? 'p' : 'n'; }
    else if (r === 's2') { shown = P.route === 'all' ? Math.min(...L3) : (P.love[P.route] || 0); grade = (shown >= G.s2.p && P.flags.ning_ally) ? 'p' : shown < G.s2.t ? 't' : 'n'; }
    else grade = (love >= G.s1.p && slaps >= G.s1.slaps) ? 'p' : love < G.s1.t ? 't' : 'n';
    this.speakers(null);
    await this.run(n[grade]);
    const key = `${r}_${grade}`;
    if (!this.replay) {
      const first = !Store.s.gal.end[key]; Store.s.gal.end[key] = Date.now(); Store.save();
      if (first) Eco.addDia(20, 'ending');
      Analytics.track('ending', { key });
    }
    const L = this.$('.st-layer');
    const card = el(`<div class="endcard ${grade}"><small>${grade === 'p' ? 'PERFECT ENDING' : grade === 'n' ? 'NORMAL ENDING' : 'BAD ENDING'}</small><h2>${esc(ENDINGS[key])}</h2><p>${esc(THEME.routeName[r])}　好感 ${shown}　打臉 ${slaps} 次</p><span>已收錄至圖鑑</span></div>`);
    L.appendChild(card); Sfx.play(grade === 't' ? 'lose' : 'win'); await this.delay(600); await this.waitTap(0); card.classList.add('out'); await this.delay(300); card.remove();
  },
  async end(n) {
    const P = this.P, ep = this.ep;
    if (!this.replay) {
      P.done[ep.id] = true; P.cur = null; Store.save(); Analytics.track('ep_end', { ep: ep.id });
    }
    Sfx.music(null);
    this.$('.st-box').className = 'st-box';
    let next = n.next || (n.nextBy === 'route' ? `${P.route === 'all' ? 'a' : P.route[0]}${ep.seq + 1}` : null);
    if (this.replay && n.nextBy === 'route') next = null;
    const nxt = next && EPISODES.find(e => e.id === next);
    const act = await this.race(UI.endCard(this.$('.st-layer'), ep, n, nxt, this.replay));
    Player.after = act; // 交俾 UI 處理：{go:'next'|'home'|...}
  }
};
