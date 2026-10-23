// Story identity is chosen before storage loads. Reloading cleanly stops all playback timers.
window.STORIES = {
  rebirth: { title: '重生打臉女王', status: '第一、二季', saveKey: 'slapqueen.save.v1' },
  starlight: { title: '重生之影后不接受潛規則', status: '全 15 章・前 4 章免費', saveKey: 'slapqueen.save.starlight.v1' }
};
window.STORY_ID = (() => {
  const requested = new URLSearchParams(location.search).get('story');
  return Object.hasOwn(STORIES, requested) ? requested : 'rebirth';
})();
// Explicit friend-testing URL; does not grant purchases or alter affection.
CONFIG.demo = new URLSearchParams(location.search).get('demo') === '1';
