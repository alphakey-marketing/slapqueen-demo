// 介面：主頁、劇集、圖鑑、商店、我的、彈窗。劇情播放喺 player.js。
const UI = {
  root: null, tab: 'home', gtab: 'cg',

  init(root) {
    this.root = root; Player.mount($('#stage', root));
    Store.onChange(() => this.refreshBar());
    this.go('home');
    setTimeout(() => this.startup(), 400);
  },
  async startup() {
    const s = Store.s;
    if (Eco.isVip() && s.vipDaily !== dayKey()) { s.vipDaily = dayKey(); Eco.addDia(20, 'vip_daily'); this.toast('VIP 每日禮：💎 +20'); }
    const d = Eco.dailyReward();
    if (d) await this.dailyModal(d);
    Notify.sync();
  },

  // ───── 工具 ─────
  toast(t) {
    const d = el(`<div class="toast">${esc(t)}</div>`); document.body.appendChild(d); setTimeout(() => d.classList.add('out'), 1800); setTimeout(() => d.remove(), 2300);
  },
  modal(html, { dismiss = true, cls = '' } = {}) {
    return new Promise(res => {
      const m = el(`<div class="modal ${cls}"><div class="card">${html}</div></div>`);
      const close = v => { const t = $('textarea', m); this.lastInput = t ? t.value : ''; m.remove(); res(v); };
      m.onclick = e => {
        const b = e.target.closest('[data-r]');
        if (b) { Sfx.play('tap'); close(b.dataset.r); }
        else if (dismiss && e.target === m) close(null);
      };
      document.body.appendChild(m);
    });
  },
  go(tab) {
    this.tab = tab; Player.abort(); Sfx.music(null);
    $('#stage', this.root).classList.remove('on'); $('#stage', this.root).innerHTML = '';
    Player.mount($('#stage', this.root));
    $$('.nav button', this.root).forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    $('.nav', this.root).style.display = '';
    this.render();
  },
  render() {
    const v = $('#view', this.root);
    v.innerHTML = (Eco.isDemo() ? '<p class="hint">朋友試玩模式・門票無限・結局條件照常判定</p>' : '') + ({ home: () => this.vHome(), gallery: () => this.vGallery(), shop: () => this.vShop(), me: () => this.vMe() })[this.tab]();
    if (Eco.isDemo()) v.querySelectorAll('.story-card').forEach(a => { const url = new URL(a.href); url.searchParams.set('demo', '1'); a.href = url.href; });
    v.scrollTop = 0; this.refreshBar();
  },
  refreshBar() {
    const b = $('#bar', this.root); if (!b) return;
    const s = Store.s, vip = Eco.isVip();
    const tk = (Eco.isDemo() || vip || s.own.season) ? '∞' : `${Eco.tickets()}/${CONFIG.maxTickets}`;
    const nx = Eco.nextTicketMs();
    b.innerHTML = `<span class="chip" data-a="tickets">🎫 ${tk}${!vip && !s.own.season && nx ? `<small>${fmtTime(nx)}</small>` : ''}</span><span class="chip" data-a="shop">💎 ${s.dia}<b>＋</b></span>${vip ? '<span class="chip vip">VIP</span>' : ''}`;
  },

  // ───── 主頁 ─────
  nextEp() {
    const p = Store.s.p;
    if (p.cur) return EPISODES.find(e => e.id === p.cur.ep);
    if (THEME.terminalFlag && p.flags[THEME.terminalFlag]) return null;
    const list = this.epList().filter(e => !e.ph);
    return list.find(e => !p.done[e.id]) || null;
  },
  epList() {
    const p = Store.s.p, common = EPISODES.filter(e => !e.route);
    if (THEME.preview || THEME.linear) return common;
    let list = [...common];
    if (p.route) {
      list = list.concat(EPISODES.filter(e => e.route === p.route).sort((a, b) => a.seq - b.seq));
      const s1end = { gu: 'g9', wen: 'w9', xiao: 'x9', all: 'a8' }[p.route];
      if (p.done[s1end]) list = list.concat(EPISODES.filter(e => e.route === 's2').sort((a, b) => a.seq - b.seq));
      else list.push({ ph: 1, seq: 10, title: '第二季・完成第一季後解鎖', id: 'ph2' });
    } else list.push({ ph: 1, seq: 7, title: '選線後解鎖', id: 'ph' });
    return list;
  },
  vHome() {
    this.dailyMsgRoll();
    const s = Store.s, p = s.p, nx = this.nextEp(), started = Object.keys(p.done).length || p.cur;
    const man = p.route && p.route !== 'all' ? p.route : null;
    const hero = Art.portrait(THEME.hero || 'shen', 'smile', THEME.heroOutfit || 'gala');
    let msg = '';
    const mm = this.msgMan();
    if (mm && started && MESSAGES[mm]) {
      const m = s.msg, T = MESSAGES[mm][m.idx % 7];
      msg = `<div class="msg"><div class="av">${Art.portrait(mm, 'smile')}</div><div class="bd"><b>${CHARS[mm].name}</b><p>${esc(T[0])}</p>${m.replied ? '<small>已回覆・好感 +1</small>' : `<div class="rp"><button data-a="reply" data-i="1">${esc(T[1])}</button><button data-a="reply" data-i="2">${esc(T[2])}</button></div>`}</div></div>`;
    }
    const list = this.epList();
    return `<div class="story-picker" aria-label="選擇故事">${Object.entries(STORIES).map(([id, story]) => `<a class="story-card ${id === STORY_ID ? 'on' : ''}" href="?story=${id}" ${id === STORY_ID ? 'aria-current="page"' : ''}><b>${esc(story.title)}</b><small>${esc(story.status)}</small></a>`).join('')}</div><div class="hero ${THEME.linear || THEME.preview ? 'story-hero' : ''}"><div class="hero-art">${hero}</div><div class="hero-t"><h1>${esc(THEME.title)}</h1><p>${esc(THEME.sub)}</p></div></div>
<button class="btn big gold" data-a="continue">${nx ? (p.cur ? '▶ 繼續第' + nx.seq + '集' : (started ? '▶ 第' + nx.seq + '集　' + nx.title : '▶ 開始遊戲')) : (THEME.linear ? '✦ 本故事已完結・可回溯探索其他結局' : THEME.preview ? '✦ 試玩已完成・後續製作中' : '✦ 第一季已完結')}</button>${msg}
<div class="sec"><h3>劇集</h3>${p.route ? `<button class="link" data-a="timeback">⏪ 時光回溯</button>` : ''}</div>
<div class="eps">${list.map(e => this.epRow(e)).join('')}</div>
${THEME.linear ? '<p class="hint">全 15 章・前 4 章免費。第 6 章可選單人、全攻略或不攻略；結局依好感與關鍵選擇改變。</p>' : THEME.preview ? '<p class="hint">全作規劃 15 集・目前開放前 4 集免費試玩；第 6 集選線尚未開放。</p>' : p.done.e6 || p.route ? '' : '<p class="hint">完成第 6 集後，選擇你的男主線</p>'}`;
  },
  epRow(e) {
    const p = Store.s.p;
    if (THEME.terminalFlag && p.flags[THEME.terminalFlag] && !p.done[e.id] && !(p.cur && p.cur.ep === e.id)) return `<div class="ep lock"><i>${e.seq}</i><div><b>${esc(e.title)}</b><small>此輪已進入壞結局・可回溯重試</small></div><span>🔒</span></div>`;
    if (THEME.linear && !p.done[e.id] && !(p.cur && p.cur.ep === e.id) && EPISODES.some(previous => previous.seq < e.seq && !p.done[previous.id])) return `<div class="ep lock"><i>${e.seq}</i><div><b>${esc(e.title)}</b><small>完成前章後開放</small></div><span>🔒</span></div>`;
    if (e.ph) return `<div class="ep lock"><i>${e.seq}</i><div><b>${e.title}</b><small>三條男主線各 3 集</small></div><span>🔒</span></div>`;
    const done = p.done[e.id], gate = Eco.gateMs(e), cur = p.cur && p.cur.ep === e.id;
    const st = done ? '<span class="ok">✓ 重溫</span>' : gate > 0 ? `<span>⏳ ${fmtTime(gate)}</span>` : cur ? '<span class="go">繼續</span>' : (e.free ? '<span class="go">免費播放</span>' : '<span class="go">🎫 播放</span>');
    return `<div class="ep ${done ? 'done' : ''}" data-a="ep" data-id="${e.id}"><i>${e.seq}</i><div><b>${esc(e.title)}</b><small>${e.route ? esc(THEME.routeName[e.route]) : '主線'}</small></div>${st}</div>`;
  },
  msgMan() {
    const p = Store.s.p;
    if (p.route && p.route !== 'all') return p.route;
    return [...THEME.men].sort((a, b) => p.love[b] - p.love[a])[0];
  },
  dailyMsgRoll() {
    const m = Store.s.msg, k = dayKey();
    if (m.day !== k) { m.day = k; m.replied = false; m.idx = (m.idx || 0) + 1; Store.save(); }
  },

  // ───── 圖鑑 ─────
  vGallery() {
    const g = Store.s.gal, t = this.gtab;
    const tabs = `<div class="tabs">${[['cg', 'CG'], ['end', '結局'], ['chr', '角色']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-a="gtab" data-k="${k}">${n}</button>`).join('')}</div>`;
    let body = '';
    if (t === 'cg') {
      const ids = Object.keys(CGS), have = ids.filter(i => g.cg[i]).length;
      body = `<p class="hint">已收集 ${have} / ${ids.length}</p><div class="grid">${ids.map(i => g.cg[i] ? `<div class="th" data-a="cg" data-id="${i}">${Art.cg(CGS[i])}<small>${esc(CGS[i].name)}</small></div>` : `<div class="th lock"><span>🔒</span><small>？？？</small></div>`).join('')}</div>`;
    } else if (t === 'end') {
      const ks = Object.keys(ENDINGS), have = ks.filter(k => g.end[k]).length;
      body = `<p class="hint">已解鎖 ${have} / ${ks.length}</p><div class="list">${ks.map(k => { const [r, gr] = k.split('_'); const on = g.end[k]; return `<div class="row ${on ? '' : 'lock'}"><b>${on ? esc(ENDINGS[k]) : '？？？'}</b><small>${esc(THEME.routeName[r])}・${{ p: '完美', n: '普通', t: '遺憾' }[gr]}</small></div>`; }).join('')}</div>`;
    } else {
      const ks = Object.keys(CHARS);
      body = `<div class="cards">${ks.map(k => g.chr[k] ? `<div class="chr">${Art.portrait(k, 'normal')}<b>${esc(CHARS[k].name)}</b>${CHARS[k].desc ? `<small>${esc(CHARS[k].desc)}</small>` : ''}</div>` : `<div class="chr lock"><span>？</span></div>`).join('')}</div>`;
    }
    return `<h2 class="ttl">圖鑑</h2>${tabs}${body}`;
  },

  // ───── 商店 ─────
  vShop() {
    if (THEME.preview || THEME.shopEnabled === false) return '<h2 class="ttl">商店</h2><p class="hint">故事二暫不販售禮包或通行證。前四章免費，其後每章使用一張門票，可等待回復。進度、圖鑑與資源按故事分開保存。</p>';
    const P = CONFIG.products, s = Store.s;
    const card = (k, cls = '') => {
      const p = P[k], owned = (p.once && s.own[k]) || (p.own && s.own[p.own]);
      return `<div class="prod ${cls} ${owned ? 'owned' : ''}" data-a="buy" data-k="${k}">${p.tag ? `<em>${esc(p.tag)}</em>` : ''}<div><b>${esc(p.name)}</b>${p.desc ? `<small>${esc(p.desc)}</small>` : ''}</div><span>${owned ? '已擁有' : 'US$' + p.price}</span></div>`;
    };
    const adBtn = Eco.isVip() ? '' : `<div class="prod ad" data-a="ad"><div><b>📺 看廣告領 💎 10</b><small>今日剩 ${Eco.adsLeft()} 次</small></div><span>免費</span></div><div class="prod ad" data-a="adticket"><div><b>📺 看廣告領 🎫 1</b><small>今日剩 ${Eco.adsLeft()} 次</small></div><span>免費</span></div>`;
    const rules = `<div class="rules"><b>🎫 門票</b>：看一集用 1 張，每 2 小時回 1 張。<br>${CONFIG.dailyUnlock ? `<b>⏳ 解鎖時間</b>：新集每日 8 點開放，想提早看可花 💎 ${CONFIG.skipGateCost}（已包含門票）。<br>` : ''}<b>VIP／整季買斷</b>：門票無限、免廣告。<br>門票不夠？看廣告、花 💎 ${CONFIG.ticketDiaCost}，或等它回復。</div>`;
    return `<h2 class="ttl">商店</h2>${rules}${CONFIG.billing === 'mock' ? '<p class="test">⚠ 測試模式：不會真正扣款</p>' : ''}
${s.own.first ? '' : card('first', 'hot')}<h3>會員</h3>${card('vipW')}${card('vipM', 'hot')}${card('season')}${card('allpass')}<h3>鑽石</h3>${card('dia100')}${card('dia330')}${card('dia700')}<h3>免費</h3>${adBtn}
<div class="prod" data-a="ticketdia"><div><b>🎫 用鑽石買門票</b><small>💎 ${CONFIG.ticketDiaCost} = 1 張</small></div><span>兌換</span></div>
<button class="link" data-a="restore">恢復購買</button>`;
  },

  // ───── 我的 ─────
  vMe() {
    const s = Store.s, set = s.set;
    const tg = (k, n) => `<div class="row tg" data-a="tg" data-k="${k}"><b>${n}</b><i class="sw ${set[k] ? 'on' : ''}"></i></div>`;
    const lv = m => { const l = Eco.love(m); return `<div class="love"><span>${CHARS[m].name}</span><div class="lb"><i style="width:${clamp(s.p.love[m] / CONFIG.loveLevels[4] * 100, 0, 100)}%"></i></div><b>${CONFIG.loveNames[l]}</b></div>`; };
    return `<h2 class="ttl">我的</h2>
<div class="stat"><div><b>${Object.keys(s.p.done).length}</b><small>已看集數</small></div><div><b>${s.p.slaps}</b><small>打臉次數</small></div><div><b>${s.p.power}</b><small>${THEME.power.name}</small></div></div>
<h3>好感度</h3>${THEME.men.map(lv).join('')}
${CHARS.lu ? `<div class="love"><span>${CHARS.lu.name}</span><div class="lb lu"><i style="width:${clamp(s.p.love.lu, 0, 100)}%"></i></div><b>追妻火葬場</b></div>` : ''}
<h3>設定</h3>${tg('sfx', '音效')}${tg('music', '音樂')}${tg('vibe', '震動')}${tg('notif', '通知提醒')}
<h3>資料</h3>
<div class="row" data-a="savecode"><b>進度碼（備份／轉機）</b><span>›</span></div>
<div class="row" data-a="loadcode"><b>輸入進度碼</b><span>›</span></div>
<div class="row" data-a="restore"><b>恢復購買</b><span>›</span></div>
<div class="row" data-a="privacy"><b>隱私政策</b><span>›</span></div>
<div class="row" data-a="terms"><b>服務條款</b><span>›</span></div>
<div class="row" data-a="support"><b>聯絡客服</b><span>${esc(CONFIG.legal.support)}</span></div>
<div class="row danger" data-a="wipe"><b>刪除此故事資料</b><span>›</span></div>
<p class="ver" data-a="ver">v${CONFIG.version}　年滿 12 歲　含虛擬貨幣與廣告</p>`;
  },

  // ───── 行為 ─────
  bindGlobal() {
    this.root.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) { const n = e.target.closest('.nav button'); if (n) { Sfx.play('tap'); this.go(n.dataset.t); } return; }
      this.act(a.dataset.a, a);
    });
  },
  async act(k, d) {
    Sfx.init && Sfx.init(); Sfx.play('tap');
    const s = Store.s;
    switch (k) {
      case 'shop': case 'tickets': this.go('shop'); break;
      case 'continue': { const e = this.nextEp(); if (e) this.play(e); else this.toast(THEME.linear ? '可用時光回溯探索其他路線與結局' : THEME.preview ? '第 5–15 集製作中' : '敬請期待第二季'); break; }
      case 'ep': this.play(EPISODES.find(e => e.id === d.dataset.id)); break;
      case 'reply': {
        const m = s.msg; if (m.replied) break; m.replied = true; const man = this.msgMan(); s.p.love[man] += 1; Store.save();
        this.toast(`${CHARS[man].name}：「${LOVE_LINES[man][Math.min(Eco.love(man), 3) ? Eco.love(man) - 1 : 0].replace(/[「」]/g, '')}」`); Sfx.play('heart'); this.render(); break;
      }
      case 'gtab': this.gtab = d.dataset.k; this.render(); break;
      case 'cg': this.viewCg(d.dataset.id); break;
      case 'buy': { const key = d.dataset.k; if (await Monet.buy(key)) { Sfx.play('win'); this.toast('購買成功'); this.render(); } break; }
      case 'ad': if (await Monet.rewardAd('shop_dia')) { Eco.addDia(10, 'ad'); this.toast('💎 +10'); this.render(); } break;
      case 'adticket': if (await Monet.rewardAd('shop_ticket')) { Eco.addTicket(1); this.toast('🎫 +1'); this.render(); } break;
      case 'ticketdia': if (Eco.spendDia(CONFIG.ticketDiaCost, 'ticket')) { Eco.addTicket(1); this.toast('🎫 +1'); this.render(); } else this.toast('鑽石不足'); break;
      case 'restore': { const n = await Monet.restore(); this.toast(n ? `已恢復 ${n} 項購買` : '沒有可恢復的購買'); break; }
      case 'tg': {
        const key = d.dataset.k;
        if (key === 'notif' && !s.set.notif) { const ok = await Notify.ask(); if (!ok) this.toast('請於系統設定開啟通知權限'); }
        else s.set[key] = !s.set[key];
        Store.save(); if (key === 'music' || key === 'sfx') Sfx.music(null); this.render(); break;
      }
      case 'savecode': { const c = Store.exportCode(); try { await navigator.clipboard.writeText(c); } catch (e) {} await this.modal(`<h3>進度碼</h3><p>已嘗試複製。請收好，換機時貼上。</p><textarea readonly>${c}</textarea><button class="btn" data-r="ok">好</button>`); break; }
      case 'loadcode': {
        const r = await this.modal(`<h3>輸入進度碼</h3><p>會覆蓋目前進度。</p><textarea id="code"></textarea><div class="two"><button class="btn ghost" data-r="no">取消</button><button class="btn gold" data-r="ok">匯入</button></div>`, { dismiss: false });
        if (r === 'ok') { if (Store.importCode(this.lastInput)) { this.toast('匯入成功'); this.go('home'); } else this.toast('進度碼無效或屬於其他故事'); }
        break;
      }
      case 'privacy': case 'terms': this.legal(k); break;
      case 'support': this.toast(CONFIG.legal.support); break;
      case 'wipe': {
        const r = await this.modal('<h3>刪除此故事資料？</h3><p>此故事的進度、鑽石、圖鑑將清除，無法復原。（已購買項目請用「恢復購買」找回）</p><div class="two"><button class="btn ghost" data-r="no">取消</button><button class="btn danger" data-r="ok">刪除</button></div>');
        if (r === 'ok') { Store.reset(); try { localStorage.removeItem('slapqueen.ev'); } catch (e) {} this.go('home'); this.toast('已刪除'); }
        break;
      }
      case 'ver': this._v = (this._v || 0) + 1; if (this._v >= 7) { this._v = 0; this.debug(); } break;
      case 'timeback': this.timeBack(); break;
    }
  },

  async legal(k) {
    const t = k === 'privacy' ? '隱私政策' : '服務條款', u = CONFIG.legal[k + 'Url'];
    if (u) { window.open(u, '_blank'); return; }
    await this.modal(`<h3>${t}</h3><div class="legal"><p>【草稿・上架前須由法律顧問審閱並放上公開網址】</p>${k === 'privacy' ? '<p>本遊戲於裝置本機儲存遊玩進度與設定。若啟用匿名統計，僅收集遊玩事件（如集數完成、選項類型），不收集姓名、電話或定位。廣告服務商可能依其政策使用廣告識別碼。你可於「我的 → 刪除所有資料」清除本機資料。</p>' : '<p>本遊戲為虛構劇情作品。虛擬貨幣「鑽石」僅可於遊戲內使用，不可兌現或轉讓。購買後依應用商店規則處理退款。</p>'}<p>聯絡：${esc(CONFIG.legal.support)}</p></div><button class="btn" data-r="ok">關閉</button>`);
  },
  async viewCg(id) {
    const d = CGS[id]; await this.modal(`<div class="cgv">${Art.cg(d)}<h3>${esc(d.name)}</h3><p>${esc(d.line || '')}</p></div><button class="btn" data-r="ok">關閉</button>`, { cls: 'wide' });
  },
  async debug() {
    const r = await this.modal('<h3>除錯面板</h3><div class="col"><button class="btn" data-r="dia">+500 鑽石</button><button class="btn" data-r="tk">+5 門票</button><button class="btn" data-r="unlock">全部集數解鎖</button><button class="btn" data-r="love">三人好感 +40</button><button class="btn" data-r="ev">匯出事件(console)</button><button class="btn ghost" data-r="x">關閉</button></div>');
    const s = Store.s;
    if (r === 'dia') Eco.addDia(500, 'debug'); if (r === 'tk') Eco.addTicket(5);
    if (r === 'unlock') EPISODES.forEach(e => s.p.unlocked[e.id] = true);
    if (r === 'love') THEME.men.forEach(m => s.p.love[m] += 40);
    if (r === 'ev') console.log(JSON.stringify(Analytics.dump()));
    Store.save(); this.render();
  },
  async dailyModal(day) {
    const R = [[5], [5], [10], [10], [15], [15], (THEME.preview || THEME.linear) ? [30] : [30, 'cg_week']];
    const cells = R.map((r, i) => `<div class="day ${i + 1 < day ? 'got' : i + 1 === day ? 'now' : ''}"><small>第${i + 1}日</small><b>${r[1] ? '🖼' : '💎'}${r[0]}</b></div>`).join('');
    await this.modal(`<h3>每日登入</h3><p>連續登入第 ${day} 日</p><div class="days">${cells}</div><button class="btn gold" data-r="ok">領取</button>`, { dismiss: false });
    const r = R[day - 1]; Eco.addDia(r[0], 'daily'); if (r[1]) { Store.s.gal.cg[r[1]] = Date.now(); Store.save(); }
    Sfx.play('gem'); this.toast(`💎 +${r[0]}${r[1] ? '　並解鎖限定 CG' : ''}`);
  },

  // ───── 開播流程 ─────
  async play(ep, o = {}) {
    if (!ep) return;
    const p = Store.s.p, done = !!p.done[ep.id], resume = !!(p.cur && p.cur.ep === ep.id);
    if (THEME.terminalFlag && p.flags[THEME.terminalFlag] && !done && !resume) { this.toast('此輪已進入壞結局，請用時光回溯重試'); return; }
    if (THEME.linear && !done && !resume && EPISODES.some(previous => previous.seq < ep.seq && !p.done[previous.id])) { this.toast('請先完成前一章'); return; }
    const replay = done;
    if (!replay && !resume && !ep.free) {
      const gate = Eco.gateMs(ep); let paidSkip = false;
      if (gate > 0) {
        const r = await this.modal(`<h3>第${ep.seq}集 未到更新時間</h3><p>新劇集每日早上 8 點開放，還有 <b>${fmtTime(gate)}</b>。<br>等到時間後，每集再用 🎫 1 張門票觀看。</p><div class="col"><button class="btn gold" data-r="skip">💎 ${CONFIG.skipGateCost} 現在就看（已包含門票，不再扣 🎫）</button><button class="btn ghost" data-r="no">等明天（免費）</button></div>`);
        if (r !== 'skip') return;
        if (!Eco.spendDia(CONFIG.skipGateCost, 'skip_gate')) { if (!await this.needDia(CONFIG.skipGateCost) || !Eco.spendDia(CONFIG.skipGateCost, 'skip_gate')) return; }
        p.unlocked[ep.id] = true; paidSkip = true; Store.save();
      }
      if (!paidSkip && !Eco.hasTicket()) {
        if (!Store.s.tut.gift) { Store.s.tut.gift = true; Eco.addTicket(1); this.toast('🎫 送你一張門票！'); }
        else {
          const r = await this.modal(`<h3>🎫 門票用完了</h3><p>看一集要 1 張門票，每 2 小時自動回復 1 張（最多 ${CONFIG.maxTickets}）。下一張：${fmtTime(Eco.nextTicketMs())}</p><div class="col">${Eco.adsLeft() > 0 ? '<button class="btn gold" data-r="ad">📺 看廣告 +1 門票</button>' : ''}<button class="btn" data-r="dia">💎 ${CONFIG.ticketDiaCost} 買門票</button><button class="btn ghost" data-r="vip">VIP／買斷：門票無限</button><button class="btn ghost" data-r="no">等一等</button></div>`);
          if (r === 'ad') { if (await Monet.rewardAd('ticket')) Eco.addTicket(1); else return; }
          else if (r === 'dia') { if (!Eco.spendDia(CONFIG.ticketDiaCost, 'ticket')) { if (!await this.needDia(CONFIG.ticketDiaCost) || !Eco.spendDia(CONFIG.ticketDiaCost, 'ticket')) return; } Eco.addTicket(1); }
          else if (r === 'vip') { this.go('shop'); return; }
          else return;
        }
      }
      if (!paidSkip) Eco.useTicket();
    }
    this.startStage(ep, replay, resume);
  },
  async startStage(ep, replay, resume) {
    const st = $('#stage', this.root); st.classList.add('on'); $('.nav', this.root).style.display = 'none';
    Sfx.init && Sfx.init();
    Player.after = null;
    await Player.start(ep, { replay, resume });
    const act = Player.after; if (!act) return;
    await this.afterEp(ep, act, replay);
  },
  async afterEp(ep, act, replay) {
    const s = Store.s, t = s.tut;
    if (!replay) {
      if (ep.seq === 2 && !t.savePrompt) { t.savePrompt = true; Store.save(); await this.modal('<h3>要保存進度嗎？</h3><p>目前進度存在這部手機。到「我的」可取得進度碼，換機時貼上即可。</p><button class="btn" data-r="ok">知道了</button>'); }
      if (ep.id === 'e5' && !t.firstShown) {
        t.firstShown = true; Store.save();
        if (!t.notifAsked) { const r = await this.modal('<h3>要提醒你追劇嗎？</h3><p>新一集解鎖、門票回滿時通知你。只會在這些時候出現。</p><div class="two"><button class="btn ghost" data-r="no">不用</button><button class="btn gold" data-r="ok">好</button></div>'); if (r === 'ok') await Notify.ask(); else { t.notifAsked = true; Store.save(); } }
        if (!s.own.first) { const r = await this.modal(`<h3>🎁 新人首充禮包</h3><p>${CONFIG.products.first.desc}</p><div class="prod hot"><div><b>${CONFIG.products.first.name}</b></div><span>US$${CONFIG.products.first.price}</span></div><div class="two"><button class="btn ghost" data-r="no">之後再說</button><button class="btn gold" data-r="ok">購買</button></div>`); if (r === 'ok' && await Monet.buy('first')) this.toast('購買成功'); }
      }
    }
    if (act.go === 'next' && act.next) { this.go('home'); this.play(act.next); }
    else this.go(act.go === 'gallery' ? 'gallery' : 'home');
  },

  // ───── 播放中用到嘅彈出 ─────
  async sys(id) {
    const m = {
      gift30: () => { Eco.addDia(30, 'gift'); return ['🎁 重生見面禮', '送你 💎 30 鑽石。遇到「爽」選項時使用，一擊必殺。']; },
      power: () => ['🔮 前世記憶', `你的${THEME.power.name}會隨打臉成長。某些隱藏選項，需要足夠的${THEME.power.name}才能解鎖。`],
      precog: () => ['🃏 獲得預知卡', THEME.item.desc + '。'],
      galleryhint: () => ['🖼 圖鑑已解鎖', '名場面、結局與角色，會收錄在「圖鑑」。']
    }[id];
    if (!m) return; const [t, b] = m(); Sfx.play('gem');
    await this.modal(`<h3>${t}</h3><p>${b}</p><button class="btn gold" data-r="ok">收下</button>`, { dismiss: false });
  },
  async needDia(cost) {
    const r = await this.modal(`<h3>鑽石不足</h3><p>需要 💎 ${cost}，你有 💎 ${Store.s.dia}。</p><div class="col">${Eco.adsLeft() > 0 ? '<button class="btn gold" data-r="ad">📺 看廣告 +💎 10</button>' : ''}<button class="btn" data-r="buy">US$${CONFIG.products.dia100.price} 買 💎 100</button><button class="btn ghost" data-r="no">算了</button></div>`);
    if (r === 'ad') { if (await Monet.rewardAd('need_dia')) Eco.addDia(10, 'ad'); }
    else if (r === 'buy') await Monet.buy('dia100');
    return Store.s.dia >= cost;
  },
  routeSelect(host) {
    return new Promise(res => {
      const s = Store.s, L = s.p.love, threshold = THEME.allRouteLove ?? CONFIG.allRouteLove, allOk = s.own.allpass || THEME.men.every(m => L[m] >= threshold);
      const card = m => `<button class="rt" data-m="${m}"><div class="av">${Art.portrait(m, 'smile')}</div><div><b>${CHARS[m].name}</b><small>${esc(PROFILE[m].tag)}・${PROFILE[m].traits.join('／')}</small><small>${esc(THEME.routeName[m])}</small><u>好感：${CONFIG.loveNames[Eco.love(m)]}</u></div></button>`;
      const allHint = THEME.linear ? (threshold === 0 ? '同時發展三條感情線；兼顧彼此的信任與選擇，才能走向特別結局。' : `三人好感皆需 ${threshold}，目前：${THEME.men.map(m => CHARS[m].name + ' ' + L[m]).join('／')}`) : (allOk ? '三人好感已達「心動」，隱藏線開啟' : '三人好感皆達「心動」，或購買通行證');
      const solo = THEME.allowSolo ? `<button class="rt" data-m="solo"><div class="av ico">✦</div><div><b>全部不攻略・只選自己</b><small>專注作品與同行的夥伴，擁有獨立結局。</small></div></button>` : '';
      const v = el(`<div class="route"><h2>選擇你的路</h2><p>這一世，你想站在誰身邊？</p>${THEME.men.map(card).join('')}<button class="rt all ${allOk ? '' : 'locked'}" data-m="all"><div class="av ico">👑</div><div><b>${THEME.routeName.all}</b><small>${esc(allHint)}</small></div></button>${solo}</div>`);
      host.appendChild(v);
      v.onclick = async e => {
        const b = e.target.closest('.rt'); if (!b) return; const m = b.dataset.m;
        if (m === 'all' && !allOk) { if (THEME.shopEnabled === false) { this.toast('先與三位男主建立默契，再選全攻略線；可用時光回溯重新選擇。'); return; } if (await Monet.buy('allpass')) { v.remove(); res('all'); } return; }
        Sfx.play('super'); v.remove(); res(m);
      };
    });
  },
  endCard(host, ep, n, nxt, replay) {
    return new Promise(res => {
      const fin = n.finale, gate = nxt ? Eco.gateMs(nxt) : 0;
      const v = el(`<div class="epend"><small>第${ep.seq}集 完</small><h2>${esc(ep.title)}</h2>${n.hook ? `<p class="hook">${esc(n.hook)}</p>` : ''}${replay ? '<small>重溫模式：不計獎勵</small>' : ''}<div class="col">${nxt && !fin ? `<button class="btn gold" data-g="next">▶ 下一集　${gate > 0 ? '⏳' + fmtTime(gate) : nxt.free ? '免費' : '🎫'}</button>` : ''}${fin ? '<button class="btn gold" data-g="gallery">看圖鑑</button>' : ''}<button class="btn ghost" data-g="home">返回</button></div></div>`);
      host.appendChild(v);
      v.onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; const g = b.dataset.g; v.remove(); res(g === 'next' ? { go: 'next', next: nxt } : { go: g }); };
    });
  },
  async pauseMenu() {
    const r = await this.modal(`<h3>暫停</h3><div class="col"><button class="btn gold" data-r="c">繼續</button><button class="btn" data-r="m">音樂：${Store.s.set.music ? '開' : '關'}</button><button class="btn ghost" data-r="h">返回主頁（進度已保存）</button></div>`);
    if (r === 'm') { Store.s.set.music = !Store.s.set.music; Store.save(); Sfx.music(null); }
    if (r === 'h') this.go('home');
  },
  async timeBack() {
    const p = Store.s.p; if (!p.snap) return;
    const cost = Eco.isVip() ? 0 : 30;
    const r = await this.modal(`<h3>⏪ 時光回溯</h3><p>回到第 6 集選線之前，重新選擇男主。好感度與進度會還原。${cost ? '<br>需要 💎 ' + cost : '（VIP 免費）'}</p><div class="two"><button class="btn ghost" data-r="no">取消</button><button class="btn gold" data-r="ok">回溯</button></div>`);
    if (r !== 'ok') return;
    if (cost && !Eco.spendDia(cost, 'timeback')) { if (!await this.needDia(cost) || !Eco.spendDia(cost, 'timeback')) return; }
    const e6 = EPISODES.find(e => e.id === (THEME.routeEpisode || 'e6')), idx = e6.nodes.findIndex(n => n.k === 'route');
    Object.assign(p, JSON.parse(JSON.stringify(p.snap)), { route: null });
    EPISODES.filter(e => THEME.linear ? e.seq >= e6.seq : e.route).forEach(e => { delete p.done[e.id]; for (const key of Object.keys(p.picks)) if (key.startsWith(e.id + '#')) delete p.picks[key]; });
    delete p.done[e6.id]; p.cur = { ep: e6.id, i: idx, rage: p.snap.rage, bg: null, cast: {} };
    Store.save(); this.go('home'); this.toast('已回到選線之前');
  },

  // ───── 測試模式：假廣告／假購買 ─────
  mockAd() {
    return new Promise(res => {
      let n = 3;
      const m = el(`<div class="modal mock"><div class="card"><small>測試模式廣告（非真實廣告）</small><h3>獎勵廣告</h3><div class="adbox">AD</div><button class="btn" disabled>${n} 秒後可領取</button><button class="link" data-x>關閉（無獎勵）</button></div></div>`);
      document.body.appendChild(m); const b = $('.btn', m);
      const iv = setInterval(() => { n--; if (n <= 0) { clearInterval(iv); b.disabled = false; b.textContent = '領取獎勵'; b.classList.add('gold'); } else b.textContent = `${n} 秒後可領取`; }, 1000);
      m.onclick = e => { if (e.target.closest('[data-x]')) { clearInterval(iv); m.remove(); res(false); } else if (e.target === b && !b.disabled) { m.remove(); res(true); } };
    });
  },
  mockPurchase(p) {
    return this.modal(`<small>測試模式（不會扣款）</small><h3>${esc(p.name)}</h3><p>US$${p.price}</p><div class="two"><button class="btn ghost" data-r="no">取消</button><button class="btn gold" data-r="ok">模擬付款</button></div>`, { cls: 'mock' }).then(r => r === 'ok');
  }
};
