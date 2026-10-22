// 存檔、經濟（門票／鑽石／VIP／廣告上限）、數據事件
const Store = (() => {
  const KEY = 'slapqueen.save.v1';
  const fresh = () => ({
    v: 1, t0: Date.now(), tickets: CONFIG.startTickets, tAt: Date.now(), dia: 0,
    vipUntil: 0, own: { season: false, allpass: false, first: false },
    p: { done: {}, route: null, flags: {}, love: { gu: 0, wen: 0, xiao: 0, lu: 0 }, power: 0, rage: 0, items: { precog: 0 }, slaps: 0, picks: {}, snap: null, unlocked: {}, cur: null },
    gal: { cg: {}, end: {}, chr: {}, claimed: {} },
    daily: { last: '', streak: 0 }, ads: { day: '', n: 0 }, msg: { day: '', replied: false, idx: 0 },
    tut: { gift: false, firstShown: false, savePrompt: false, notifAsked: false },
    set: { sfx: true, music: true, auto: false, vibe: true, notif: false, speed: 1 },
    vipDaily: ''
  });
  let s;
  const load = () => {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.v === 1) { s = deepMerge(fresh(), j); return; } } catch (e) {}
    s = fresh();
  };
  const deepMerge = (a, b) => { for (const k in b) a[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k]) ? deepMerge(a[k], b[k]) : b[k]; return a; };
  const listeners = new Set();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} listeners.forEach(f => f()); };
  load();
  const api = {
    get s() { return s; },
    save, onChange: f => { listeners.add(f); return () => listeners.delete(f); },
    reset() { s = fresh(); save(); },
    // 進度碼：unicode 安全 base64
    exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(s)))); },
    importCode(c) { try { const j = JSON.parse(decodeURIComponent(escape(atob(c.trim())))); if (j.v !== 1) return false; s = deepMerge(fresh(), j); save(); return true; } catch (e) { return false; } }
  };
  return api;
})();

const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

const Eco = {
  isVip: () => Store.s.vipUntil > Date.now(),
  tickets() {
    const s = Store.s, max = CONFIG.maxTickets;
    if (s.tickets >= max) { s.tAt = Date.now(); return s.tickets; }
    const n = Math.floor((Date.now() - s.tAt) / CONFIG.ticketRegenMs);
    if (n > 0) { s.tickets = Math.min(max, s.tickets + n); s.tAt = s.tickets >= max ? Date.now() : s.tAt + n * CONFIG.ticketRegenMs; Store.save(); }
    return s.tickets;
  },
  nextTicketMs() { const s = Store.s; return this.tickets() >= CONFIG.maxTickets ? 0 : s.tAt + CONFIG.ticketRegenMs - Date.now(); },
  addTicket(n = 1, cap = false) { Eco.tickets(); const s = Store.s; if (cap) s.tickets = Math.min(CONFIG.maxTickets, s.tickets + n); else s.tickets += n; if (s.tickets >= CONFIG.maxTickets) s.tAt = Date.now(); Store.save(); },
  useTicket() { if (Eco.isVip() || Store.s.own.season) return true; Eco.tickets(); const s = Store.s; if (s.tickets <= 0) return false; if (s.tickets >= CONFIG.maxTickets) s.tAt = Date.now(); s.tickets--; Store.save(); return true; },
  hasTicket: () => Eco.isVip() || Store.s.own.season || Eco.tickets() > 0,
  addDia(n, src) { Store.s.dia += n; Store.save(); Analytics.track('dia_gain', { n, src }); if (typeof Player !== 'undefined' && Player.hud) Player.hud(); },
  spendDia(n, why) { if (Store.s.dia < n) return false; Store.s.dia -= n; Store.save(); Analytics.track('dia_spend', { n, why }); if (typeof Player !== 'undefined' && Player.hud) Player.hud(); return true; },
  adsLeft() { const a = Store.s.ads, k = dayKey(); if (a.day !== k) { a.day = k; a.n = 0; } return Eco.isVip() ? 0 : CONFIG.adDailyCap - a.n; },
  countAd() { Eco.adsLeft(); Store.s.ads.n++; Store.save(); },
  // 解鎖日：本機日期 08:00 為界
  dayIndex(now = Date.now()) { const d = new Date(Store.s.t0); d.setHours(CONFIG.unlockHour, 0, 0, 0); if (d.getTime() > Store.s.t0) d.setDate(d.getDate() - 1); return Math.floor((now - d.getTime()) / 864e5); },
  unlockAt(seq) { const need = CONFIG.releaseDay[seq] ?? 0; const d = new Date(Store.s.t0); d.setHours(CONFIG.unlockHour, 0, 0, 0); if (d.getTime() > Store.s.t0) d.setDate(d.getDate() - 1); return d.getTime() + need * 864e5; },
  gateMs(ep) { if (!CONFIG.dailyUnlock) return 0; const p = Store.s.p; if (Store.s.own.season || Eco.isVip() || p.unlocked[ep.id] || p.done[ep.id]) return 0; return Math.max(0, Eco.unlockAt(ep.seq) - Date.now()); },
  love(m) { const L = CONFIG.loveLevels, v = Store.s.p.love[m]; let lv = 0; L.forEach((t, i) => { if (v >= t) lv = i; }); return lv; },
  // 每日登入
  dailyReward() {
    const d = Store.s.daily, k = dayKey();
    if (d.last === k) return null;
    const y = dayKey(Date.now() - 864e5);
    d.streak = d.last === y ? (d.streak % 7) + 1 : 1; d.last = k; Store.save();
    return d.streak;
  }
};

const Analytics = {
  q: [],
  track(name, props = {}) {
    const e = { n: name, t: Date.now(), ...props };
    try { const k = 'slapqueen.ev'; const a = JSON.parse(localStorage.getItem(k) || '[]'); a.push(e); localStorage.setItem(k, JSON.stringify(a.slice(-500))); } catch (x) {}
    if (CONFIG.analyticsUrl) { try { navigator.sendBeacon(CONFIG.analyticsUrl, JSON.stringify(e)); } catch (x) {} }
  },
  dump() { try { return JSON.parse(localStorage.getItem('slapqueen.ev') || '[]'); } catch (e) { return []; } }
};
