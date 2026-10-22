// 廣告＋內購轉接層。billing='mock' 用假廣告／假購買（UI 會標明測試模式）。
// 上線：實作 Providers.live（AdMob／RevenueCat 或原生 IAP），config.billing 改 'live'。見 docs/LAUNCH.md
const Providers = {
  mock: {
    async rewardedAd() { return UI.mockAd(); },
    async purchase(p) { return UI.mockPurchase(p); },
    async restore() { return []; }
  },
  live: {
    async rewardedAd() { throw new Error('live ads provider not configured'); },
    async purchase() { throw new Error('live billing provider not configured'); },
    async restore() { return []; }
  }
};
const prov = () => Providers[CONFIG.billing] || Providers.mock;

const Monet = {
  // 獎勵廣告。永遠只喺玩家主動按下先出，打臉演出中途唔出。
  async rewardAd(placement) {
    if (Eco.isVip()) return true;
    if (Eco.adsLeft() <= 0) { UI.toast('今日廣告次數已用完'); return false; }
    Analytics.track('ad_start', { placement });
    try {
      const ok = await prov().rewardedAd(placement);
      if (ok) { Eco.countAd(); Analytics.track('ad_reward', { placement }); }
      return ok;
    } catch (e) { UI.toast('廣告暫時不可用'); Analytics.track('ad_fail', { placement }); return false; }
  },
  async buy(key) {
    const p = CONFIG.products[key];
    if (p.once && Store.s.own[key]) { UI.toast('此禮包只可購買一次'); return false; }
    if (p.own && Store.s.own[p.own]) { UI.toast('你已擁有'); return false; }
    Analytics.track('iap_start', { id: p.id });
    try {
      const ok = await prov().purchase(p);
      if (!ok) return false;
      this.grant(key); Analytics.track('iap_ok', { id: p.id, price: p.price });
      return true;
    } catch (e) { UI.toast('購買失敗，請稍後再試'); Analytics.track('iap_fail', { id: p.id }); return false; }
  },
  grant(key) {
    const p = CONFIG.products[key], s = Store.s;
    if (p.dia) s.dia += p.dia;
    if (p.cg) s.gal.cg[p.cg] = Date.now();
    if (p.once) s.own[key] = true;
    if (p.vip) s.vipUntil = Math.max(Date.now(), s.vipUntil) + p.vip * 864e5;
    if (p.own) s.own[p.own] = true;
    Store.save(); Notify.sync();
  },
  async restore() { const r = await prov().restore(); return r.length; }
};

// 本地推送（Capacitor LocalNotifications）。網頁版冇排程，直接忽略。
const Notify = {
  plugin: () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications,
  async ask() {
    const p = this.plugin(); let ok = false;
    try { if (p) { const r = await p.requestPermissions(); ok = r.display === 'granted'; } else if ('Notification' in window) ok = (await Notification.requestPermission()) === 'granted'; } catch (e) {}
    Store.s.set.notif = ok; Store.s.tut.notifAsked = true; Store.save(); if (ok) this.sync(); return ok;
  },
  async sync() {
    const p = this.plugin(); if (!p || !Store.s.set.notif) return;
    try {
      await p.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }] });
      const n = [], now = Date.now();
      const full = Eco.nextTicketMs() + (CONFIG.maxTickets - Math.min(CONFIG.maxTickets, Eco.tickets()) - 1) * CONFIG.ticketRegenMs;
      if (Eco.tickets() < CONFIG.maxTickets) n.push({ id: 1, title: '門票回滿了', body: '佢終於要揭穿你未婚夫……快回來追劇！', schedule: { at: new Date(now + Math.max(full, 6e4)) } });
      const nx = new Date(); nx.setHours(CONFIG.unlockHour, 0, 0, 0); if (nx <= now) nx.setDate(nx.getDate() + 1);
      n.push({ id: 2, title: '新一集已解鎖', body: '集尾斷在最關鍵一句——今天終於揭曉。', schedule: { at: nx } });
      const d3 = new Date(Store.s.t0 + 3 * 864e5); d3.setHours(20, 0, 0, 0);
      if (d3 > now) n.push({ id: 3, title: '第 7 日登入獎勵倒數', body: '連續登入 7 日，送限定 CG 與換裝。', schedule: { at: d3 } });
      const d6 = new Date(Store.s.t0 + 6 * 864e5); d6.setHours(20, 0, 0, 0);
      if (d6 > now) n.push({ id: 4, title: '明日領取限定 CG', body: '連續登入第 7 日可領取，別斷簽。', schedule: { at: d6 } });
      await p.schedule({ notifications: n.map(x => ({ ...x, smallIcon: 'ic_stat_icon', sound: null })) });
    } catch (e) {}
  }
};
