// WebAudio 合成音效＋簡單程序 BGM（冇外部音檔，零版權風險；之後可換正式音樂）
const Sfx = (() => {
  let ctx, master, musicGain, musicTimer, mood = null, step = 0;
  const init = () => {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
      return true;
    } catch (e) { return false; }
  };
  const tone = (f, t0, dur, type = 'sine', vol = .2, to) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + .05);
  };
  const noise = (t0, dur, vol = .3, hp = 200) => {
    const n = ctx.sampleRate * dur, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start(t0);
  };
  const FX = {
    tap: t => tone(660, t, .06, 'triangle', .08),
    pick: t => { tone(520, t, .08, 'triangle', .15); tone(780, t + .06, .12, 'triangle', .15); },
    super: t => { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .06, .25, 'sine', .16)); },
    rage: t => tone(300, t, .25, 'sawtooth', .07, 700),
    hit: t => { noise(t, .35, .5, 80); tone(110, t, .5, 'sine', .5, 40); tone(880, t + .02, .2, 'square', .1, 220); },
    gem: t => { tone(1318, t, .1, 'sine', .15); tone(1760, t + .08, .25, 'sine', .15); },
    win: t => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * .09, .3, 'triangle', .16)); },
    lose: t => { tone(330, t, .3, 'triangle', .14, 220); tone(247, t + .2, .4, 'triangle', .14, 150); },
    heart: t => { tone(880, t, .15, 'sine', .14); tone(1175, t + .12, .3, 'sine', .14); },
    err: t => tone(180, t, .2, 'square', .08)
  };
  const play = n => { if (!Store.s.set.sfx || !init()) return; FX[n] && FX[n](ctx.currentTime + .005); };
  // BGM：和弦 + 琶音，三種情緒
  const MOODS = {
    calm: { ch: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], bpm: 70, type: 'sine' },
    tense: { ch: [[57, 60, 63], [56, 59, 63], [53, 56, 60], [55, 58, 62]], bpm: 96, type: 'triangle' },
    triumph: { ch: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], bpm: 112, type: 'triangle' }
  };
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  const tick = () => {
    if (!mood) return;
    const m = MOODS[mood], c = m.ch[Math.floor(step / 8) % 4], t = ctx.currentTime + .05;
    const n = c[[0, 1, 2, 1, 0, 2, 1, 2][step % 8]] + (step % 8 === 7 ? 12 : 0);
    tone(mf(n), t, .5, m.type, .09);
    if (step % 8 === 0) c.forEach(x => tone(mf(x - 12), t, 2.2, 'sine', .05));
    step++;
    musicTimer = setTimeout(tick, 60000 / m.bpm / 2);
  };
  const music = nm => {
    if (!Store.s.set.music || !init()) { mood = null; clearTimeout(musicTimer); return; }
    if (nm === mood) return;
    clearTimeout(musicTimer); mood = nm;
    if (!nm) return;
    step = 0; tick();
  };
  window.addEventListener('pointerdown', () => { if (Store.s.set.sfx || Store.s.set.music) init(); }, { once: true, capture: true });
  return { play, music, init, stop: () => { mood = null; clearTimeout(musicTimer); } };
})();
