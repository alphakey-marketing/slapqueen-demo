// 題材層＋角色＋圖鑑資料（資料化：改呢度唔使改程式）
const SK = (c, a) => ({ type: 'suit', color: c, accent: a });
window.THEME = {
  id: 'rebirth', title: '重生打臉女王', sub: '每集五分鐘，親手打臉',
  power: { name: '前世記憶', icon: '🔮' },
  item: { id: 'precog', name: '預知卡', icon: '🃏', desc: '提前知道敵人陰謀，解鎖隱藏選項' },
  rage: { name: '逆襲值', icon: '🔥' },
  men: ['gu', 'wen', 'xiao'],
  routeName: { gu: '神秘權貴・資本碾壓', wen: '青梅竹馬・證據與法律', xiao: '腹黑對手・反間計', all: '全攻略・三人同場', s2: '第二季・王座' }
};

// 男主檔案：route 選擇頁同圖鑑會用。tag 一句人設；traits 性格；voice 講嘢風格（寫劇本跟住佢）
window.PROFILE = {
  gu: { tag: '冷面權貴・說一不二', traits: ['沉默', '霸道', '護短'], like: '她受傷時，他會沉默地把整座城翻過來', voice: '短句、命令式、不解釋。行動比言語快。' },
  wen: { tag: '溫柔律師・笑裡藏刀', traits: ['溫柔', '腹黑', '守護'], like: '他永遠先問「你想怎麼做」，再默默把路鋪好', voice: '慢條斯理、先問後答，生氣時反而更客氣。' },
  xiao: { tag: '毒舌對手・嘴硬心軟', traits: ['傲嬌', '毒舌', '反轉'], like: '嘴上罵你，轉身替你擋下所有刀', voice: '帶刺、反問、愛打賭，叫全名，耳根會紅。' }
};
window.CHARS = {
  shen: { name: '沈知意', g: 'f', hair: 'long', hairC: '#2b1b3d', eye: '#9b6bff', skin: '#fde3d3', color: '#ff8fb3',
    outfit: { type: 'dress', color: '#f06292', sparkle: false, acc: ['earring'] },
    outfits: { wedding: { type: 'wedding', acc: ['veil', 'tiara', 'earring'] }, dying: { type: 'wedding', acc: ['veil', 'blood'] },
      gala: { type: 'dress', color: '#6f3fa8', acc: ['necklace', 'earring'] }, plain: { type: 'casual', color: '#d9a7c7', acc: [] },
      suit: { type: 'suit', color: '#2f3a66', accent: '#f5c46b', acc: ['earring'], hair: 'updo' } } },
  lu: { name: '陸子謙', g: 'm', hair: 'neat', hairC: '#3a2a22', eye: '#6a7a9a', skin: '#fbdcc8', color: '#8aa0c8',
    outfit: SK('#3b4466', '#c0182b'), outfits: { wedding: { type: 'tux', accent: '#c0182b' } } },
  bai: { name: '白薇薇', g: 'f', hair: 'long', hairC: '#7a4a2a', eye: '#d58a4a', skin: '#fde0d0', color: '#ffb36b',
    outfit: { type: 'dress', color: '#f7a8c4', acc: ['pearl'] }, outfits: { wedding: { type: 'dress', color: '#f5b6d0', acc: ['pearl', 'earring'] }, red: { type: 'dress', color: '#d62d4f', sparkle: true, acc: ['necklace', 'earring'] } } },
  gu: { name: '顧衍之', g: 'm', hair: 'slick', hairC: '#14121c', eye: '#3a5a8a', skin: '#f8d9c4', color: '#7aa2ff', acc: ['mole'],
    outfit: { type: 'coat', color: '#1d2030', accent: '#8f1b3a' }, outfits: { formal: SK('#1d2030', '#8f1b3a') } },
  wen: { name: '溫景行', g: 'm', hair: 'neat', hairC: '#6a5238', eye: '#6aa88a', skin: '#fde0cc', color: '#6fd1a8', acc: ['glasses'],
    outfit: { type: 'cardigan', color: '#c9d4e6', acc: ['scarf'] }, outfits: { law: SK('#2b3445', '#6aa88a') } },
  xiao: { name: '蕭凜', g: 'm', hair: 'wild', hairC: '#7a1f2f', eye: '#e0a030', skin: '#f6d2bc', color: '#ff7a5a', acc: ['earring'],
    outfit: { type: 'jacket', color: '#4a1424', accent: '#e0a030', acc: ['chain'] }, outfits: { formal: SK('#4a1424', '#e0a030') } },
  lm: { name: '陸母', g: 'f', hair: 'bun', hairC: '#2a2024', eye: '#7a5a4a', skin: '#f5d4c0', color: '#c9a0b8', outfit: { type: 'dress', color: '#7a3b66', acc: ['pearl'] } },
  fa: { name: '沈父', g: 'm', hair: 'grey', hairC: '#9a9aa6', eye: '#5a6a7a', skin: '#f2d2bc', color: '#9fb0c8', outfit: SK('#2a2f45', '#5a6a7a') },
  dong: { name: '董事', g: 'm', hair: 'grey', hairC: '#555', eye: '#444', skin: '#f0cdb6', color: '#999', outfit: SK('#3a3a3a', '#8a8a8a') },
  jiang: { name: '江助理', g: 'm', hair: 'neat', hairC: '#1a1a1a', eye: '#3a3a3a', skin: '#f6d8c4', color: '#9aa', outfit: SK('#222', '#555'), acc: ['glasses'] },
  ning: { name: '寧韻', g: 'f', hair: 'updo', hairC: '#1c2a44', eye: '#4a6a9a', skin: '#fbe3d6', color: '#7aa8d8', outfit: { type: 'dress', color: '#2a3a5c', sparkle: true, acc: ['pearl', 'earring'] }, outfits: { suit: { type: 'suit', color: '#2a3a5c', accent: '#c9d4e6' } } },
  rep: { name: '記者', g: 'f', hair: 'side', hairC: '#3a2a2a', eye: '#444', skin: '#fbe0cf', color: '#aaa', outfit: { type: 'casual', color: '#7a8fa6' } }
};

// 名場面 CG（cast: [id, mood, x, scale, outfit, flip]）
window.CGS = {
  cg_fall: { name: '婚禮墜落', bg: 'wedding', cast: [['shen', 'sad', 40, .9, 'dying'], ['bai', 'smirk', 190, .8, 'wedding'], ['lu', 'smirk', -10, .75, 'wedding', 1]], line: '「下輩子，記得別這麼好騙。」' },
  cg_necklace: { name: '當眾拆穿', bg: 'gala', cast: [['bai', 'shock', -10, .85], ['shen', 'cold', 150, .95, 'gala']], line: '項鍊，就在你的夾層裡。' },
  cg_board: { name: '董事會震驚', bg: 'boardroom', cast: [['dong', 'shock', -20, .7], ['shen', 'cold', 110, .95, 'suit'], ['fa', 'smile', 200, .75, null, 1]], line: '「恆通，三個月後會爆雷。」' },
  cg_gown: { name: '星河驚艷', bg: 'gala', cast: [['shen', 'smile', 60, 1, { type: 'dress', color: '#4f6dd8', sparkle: true, acc: ['necklace', 'earring', 'wing'] }], ['xiao', 'shock', 190, .8, null, 1]], line: '全場，鴉雀無聲。' },
  cg_lu_reject: { name: '追妻火葬場', bg: 'street', cast: [['lu', 'sad', -10, .9], ['shen', 'cold', 150, .95, 'gala', 1]], line: '「陸子謙，我們之間，只剩下法庭。」' },
  cg_gu_claim: { name: '她是我的人', bg: 'press', cast: [['gu', 'cold', 40, 1], ['shen', 'shock', 190, .8, 'gala', 1]], line: '「她，是我的人。」', warm: 1 },
  cg_wen_court: { name: '法庭上的光', bg: 'court', cast: [['wen', 'angry', 40, 1], ['shen', 'smile', 190, .8, 'suit', 1]], line: '「各位，請看第三份證據。」' },
  cg_xiao_turn: { name: '倒戈一刻', bg: 'boardroom', cast: [['xiao', 'smirk', 40, 1], ['lu', 'shock', 190, .8, null, 1]], line: '「陸總，這場戲，我不陪你演了。」' },
  cg_all: { name: '三人同場', bg: 'gala', cast: [['wen', 'smile', -30, .72], ['shen', 'smile', 100, .92, 'gala'], ['gu', 'cold', 200, .78, null, 1], ['xiao', 'smirk', 250, .62, null, 1]], line: '「她的人，我們三個。」', warm: 1 },
  cg_gu_buy: { name: '一紙收購', bg: 'boardroom', cast: [['lu', 'shock', -20, .72, null, 0], ['gu', 'cold', 110, 1, 'formal'], ['shen', 'smile', 220, .75, 'suit', 1]], line: '「陸氏，從今天起，姓顧。」' },
  cg_gu_conf: { name: '遲到的告白', bg: 'street', cast: [['gu', 'sad', 30, 1], ['shen', 'smile', 190, .85, 'gala', 1]], line: '「這一世，我不會再遲到。」', warm: 1 },
  cg_wen_cross: { name: '交叉質證', bg: 'court', cast: [['lu', 'shock', -20, .7], ['wen', 'cold', 110, 1, 'law'], ['bai', 'shock', 220, .7, 'red', 1]], line: '「證人，請你再說一次。」' },
  cg_wen_conf: { name: '以追求者之名', bg: 'street', cast: [['wen', 'smile', 30, 1], ['shen', 'smile', 190, .85, 'suit', 1]], line: '「我在。從來都在。」', warm: 1 },
  cg_xiao_ledger: { name: '蕭家賬冊', bg: 'press', cast: [['xiao', 'cold', 30, 1, 'formal'], ['lu', 'shock', 190, .8, null, 1], ['bai', 'shock', 260, .6, 'red', 1]], line: '「陸總，這本賬冊，眼熟嗎？」' },
  cg_xiao_conf: { name: '嘴硬的告白', bg: 'room', cast: [['xiao', 'smile', 30, 1], ['shen', 'smile', 190, .85, 'gala', 1]], line: '「喂，沈知意，一輩子，夠不夠？」', warm: 1 },
  cg_lu_kneel: { name: '跪地求饒', bg: 'street', cast: [['lu', 'sad', 40, .95], ['shen', 'cold', 190, .8, 'suit', 1]], line: '「知意，求你……回頭看我一眼。」' },
  cg_bai_arrest: { name: '東窗事發', bg: 'gala', cast: [['bai', 'shock', 40, .95, 'red'], ['shen', 'cold', 190, .85, 'gala', 1]], line: '「白薇薇，你的戲，演完了。」' },
  cg_ning_fall: { name: '抄襲反噬', bg: 'press', cast: [['ning', 'shock', 40, .95, 'suit'], ['shen', 'cold', 190, .85, 'suit', 1]], line: '「這張草圖，比你的公司，還要老十七歲。」' },
  cg_lm_mask: { name: '面具裂開', bg: 'mansion', cast: [['lm', 'shock', 40, .95], ['shen', 'cold', 190, .85, 'gala', 1]], line: '「這件裙子……你從哪裡找到的？」' },
  cg_throne: { name: '王座之下', bg: 'boardroom', cast: [['shen', 'smile', 100, 1, 'suit']], line: '「這一次，沒有人能把我推下去。」', warm: 1 },
  cg_trio_back: { name: '三道背影', bg: 'boardroom', cast: [['gu', 'cold', -10, .8], ['wen', 'cold', 110, .85, 'law'], ['xiao', 'smirk', 220, .8, 'formal']], line: '「誰動她，先過我們這關。」', warm: 1 },
  cg_outfit: { name: '限定・月下禮服', bg: 'room', cast: [['shen', 'smile', 60, 1, { type: 'dress', color: '#2fb8c9', sparkle: true, acc: ['necklace', 'earring', 'tiara'] }]], line: '首充限定', warm: 1 },
  cg_week: { name: '七日限定・花嫁', bg: 'wedding', cast: [['shen', 'smile', 60, 1, 'wedding']], line: '七日登入限定', warm: 1 }
};
// 好感度升級：每位男主 4 張（升到 1~4 級）
window.LOVE_LINES = {
  gu: ['「沈小姐，需要幫忙，就打給我。」', '「下次，別一個人扛。」', '「你笑的時候，我分心了。」', '「我等了你一輩子，不差這一次。」'],
  wen: ['「知意，有我在。」', '「你小時候摔倒，也是這樣不肯哭。」', '「我的律師函，只為你寫。」', '「這一世，換我站在你前面。」'],
  xiao: ['「喂，別對我笑得這麼假。」', '「……算你有點意思。」', '「看着你，我居然不想贏了。」', '「對手？我早就輸給你了。」']
};
for (const m of THEME.men) LOVE_LINES[m].forEach((l, i) => {
  CGS[`love_${m}_${i + 1}`] = { name: `${CHARS[m].name}・${CONFIG.loveNames[i + 1]}`, bg: ['room', 'gala', 'street', 'wedding'][i], love: m, cast: [[m, ['smile', 'normal', 'smile', 'smile'][i], 40, 1], ['shen', 'smile', 190, .8, 'gala', 1]], line: l, warm: 1 };
});

for (const k in CGS) CGS[k].id = k;

window.ENDINGS = {
  gu_p: '完美：資本與愛之王座', gu_n: '普通：並肩而立', gu_t: '悲劇：遲來的救贖',
  wen_p: '完美：法庭外的白頭', wen_n: '普通：他仍在身旁', wen_t: '悲劇：未寄出的律師函',
  xiao_p: '完美：宿敵變歸人', xiao_n: '普通：棋逢敵手', xiao_t: '悲劇：棋局散場',
  all_p: '隱藏：她的人，我們三個', all_n: '隱藏：三人同行，各留一步',
  s2_p: '終章・完美：王座與家人', s2_n: '終章・普通：她一個人的王座', s2_t: '終章・遺憾：高處不勝寒'
};

// 每日訊息（已選男主每日一條，可回覆，+好感）
window.MESSAGES = {
  gu: [['今天有人欺負你嗎？', '沒有，我現在很強', '有，你快來'], ['會議開完了，第一件事想起你。', '我也想你', '好好工作'], ['看到一條很襯你的項鍊。', '你送我就收', '別亂花錢'], ['下雨了，帶傘。', '你來接我', '知道了'], ['我的助理說我最近笑得太多。', '誰讓你笑的？', '那很好'], ['今晚有空嗎？', '有', '要看你表現'], ['別熬夜。', '你也是', '管很寬']],
  wen: [['早安，吃早餐了嗎？', '吃了', '還沒，等你'], ['今天路過我們小時候的巷子。', '好懷念', '你記性真好'], ['案卷我看完了，別擔心。', '有你真好', '辛苦了'], ['你小時候最愛吃的那家糖水還在。', '帶我去', '改天吧'], ['今天天氣好，想看看你。', '我也是', '你不用工作嗎'], ['知意，我一直都在。', '我知道', '嗯'], ['晚安。', '晚安，景行', '早點睡']],
  xiao: [['喂，今天沒找我麻煩？', '你想我找？', '沒空'], ['我家那老頭又罵我了。', '抱抱', '活該'], ['別誤會，我只是順路。', '嘴硬', '誰誤會了'], ['我今天贏了一場。', '厲害', '有獎勵嗎'], ['你說，對手能做朋友嗎？', '可以', '不行'], ['……睡了嗎？', '還沒', '睡了'], ['下次對決，我不會手下留情。', '拭目以待', '我也是']]
};
