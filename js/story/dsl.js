// 劇本 DSL：編劇只用呢啲函數填空，唔使碰引擎。
// say 的 h = 逆襲值增量；op 的 kind: n 普通 / s 爽選項(鑽石) / h 隱藏(條件) / l 心動(鑽石)
window.EPISODES = [];
const bg = (id, fx) => ({ k: 'bg', id, fx });
const show = (id, pos, mood, outfit) => ({ k: 'show', id, pos, mood, outfit });
const hide = (...ids) => ({ k: 'hide', ids });
const clear = () => ({ k: 'clear' });
const mood = (id, m) => ({ k: 'mood', id, m });
const say = (who, t, o = {}) => ({ k: 'say', who, t, ...o });
const nar = (t, o = {}) => say(null, t, o);
const th = (t, o = {}) => say('shen', t, { think: 1, ...o });
const choice = (q, opts) => ({ k: 'choice', q, opts });
const op = (t, kind, o = {}) => ({ t, kind, ...o });
const slap = (on, text, o = {}) => ({ k: 'slap', on, text, size: 'big', ...o });
const game = (id, cfg, win, lose) => ({ k: 'game', id, cfg, win, lose });
// hit = 連環重擊：震屏＋大字，唔清逆襲值、唔派獎勵（爽點中段逐層打臉用）
const hit = (on, text) => ({ k: 'hit', on, text });
// cr = 旁人／圍觀者反應
const cr = (t, o = {}) => say(null, '〔旁人〕' + t, o);
const give = o => ({ k: 'give', ...o });
const cgShow = id => ({ k: 'cg', id });
const sys = id => ({ k: 'sys', id });
const fx = name => ({ k: 'fx', name });
const mus = m => ({ k: 'mus', m });
const rage0 = () => ({ k: 'rage', set: 0 });
const iff = (c, then, els = []) => ({ k: 'if', c, then, els });
const flag = (f) => ({ k: 'flag', f });
const love = (m, n) => ({ k: 'love', m, n });
const route = () => ({ k: 'route' });
const ending = (r, p, n, t) => ({ k: 'ending', r, p, n, t });
const end = (hook, o = {}) => ({ k: 'end', hook, ...o });
const EP = (id, seq, title, route, nodes, o = {}) => EPISODES.push({ id, seq, title, route, nodes, ...o });
const DM = {
  slap: ['全場震驚', '打臉了！', '大快人心', '剛才誰在笑？', '證據確鑿', '爽！！', '這就是重生的力量', '她變了'],
  boss: ['跪了跪了', '氣場兩米八', '全員倒吸一口涼氣', '這才是她', '爽到起飛']
};
