// 全局設定。上線前只改呢度。
window.CONFIG = {
  appName: '重生打臉女王',
  version: '1.0.0',
  // billing: 'mock' = 測試模式（假廣告、假購買），'live' = 接真 SDK（見 docs/LAUNCH.md）
  billing: 'mock',
  analyticsUrl: '',          // 有後端先填，空 = 只存本機
  startTickets: 4,           // ep1-4 用 4 張，ep5 送 1 張（框架 12:00 位）
  maxTickets: 5,
  ticketRegenMs: 2 * 3600 * 1000,
  adDailyCap: 5,
  unlockHour: 8,             // 每日早上 8 點解鎖新集
  skipGateCost: 30,          // 鑽石提前解鎖一集
  ticketDiaCost: 20,         // 鑽石買 1 張票
  loveLevels: [0, 8, 20, 35, 55],
  loveNames: ['陌生', '在意', '心動', '傾心', '專屬'],
  allRouteLove: 20,          // 全攻略線：三人好感度要到「心動」（要付費選項先夠）
  // 第幾集（序號）最早喺第幾日解鎖
  releaseDay: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 2, 8: 3, 9: 4, 10: 5 },
  products: {
    first:   { id: 'first_pack', name: '首充禮包', desc: '80 鑽石＋限定換裝 CG', price: 0.99, dia: 80, cg: 'cg_outfit', once: true },
    dia100:  { id: 'dia_100',  name: '100 鑽石', price: 1.99, dia: 100 },
    dia330:  { id: 'dia_330',  name: '330 鑽石', price: 4.99, dia: 330, tag: '多送 30' },
    dia700:  { id: 'dia_700',  name: '700 鑽石', price: 9.99, dia: 700, tag: '多送 100' },
    vipW:    { id: 'vip_week', name: 'VIP 週卡', desc: '門票無限・每日 20 鑽石・免廣告', price: 4.99, vip: 7 },
    vipM:    { id: 'vip_month', name: 'VIP 月卡', desc: '同週卡＋每月限定番外', price: 14.99, vip: 30, tag: '最抵' },
    season:  { id: 'season_pass', name: '整季買斷', desc: '全部劇集＋全部爽選項', price: 9.99, own: 'season' },
    allpass: { id: 'allroute_pass', name: '全攻略通行證', desc: '直接開通隱藏全攻略線', price: 19.99, own: 'allpass' }
  },
  legal: { privacyUrl: '', termsUrl: '', support: 'support@example.com' }
};
