// 入口
window.addEventListener('DOMContentLoaded', () => {
  UI.init($('#app'));
  UI.bindGlobal();
  setInterval(() => { if (UI.tab === 'home' && !$('#stage').classList.contains('on')) UI.refreshBar(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { Sfx.music(null); Notify.sync(); } });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.onerror = (m) => Analytics.track('js_error', { m: String(m).slice(0, 120) });
});
