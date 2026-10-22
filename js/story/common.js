// 共通線 第 1–6 集（重生復仇）
EP('e1', 1, '婚禮墜落', null, [
  mus('tense'), bg('wedding'),
  show('shen', 'l', 'sad', 'wedding'), show('lu', 'c', 'smirk', 'wedding'), show('bai', 'r', 'smile', 'wedding'),
  nar('婚禮現場。賓客滿座，香檳塔在水晶燈下閃閃發亮。'),
  say('lu', '沈知意，你真以為，我愛你？', { h: 20, mood: 'smirk' }),
  say('bai', '知意，你爸的公司早就是空殼了。我們只缺你簽的那份轉讓書。', { h: 25, mood: 'smile' }),
  say('shen', '……轉讓書？你們從一開始就——', { mood: 'shock' }),
  say('lu', '現在簽完了，你也就沒用了。', { h: 25, mood: 'cold' }),
  nar('賓客席傳來低低的竊笑。沒有一個人站出來。'),
  say('bai', '親愛的，下輩子，記得別這麼好騙。', { h: 30, mood: 'smirk' }),
  fx('shake'), nar('她用力一推——婚紗拖過長長的樓梯，天旋地轉。'),
  cgShow('cg_fall'), fx('black'),
  th('好痛……我的家、我的一切，全被他們奪走了。'),
  th('如果能重來一次……我要他們，一個都跑不掉。'),
  rage0(), fx('rebirth'), mus('calm'), clear(), bg('gala'),
  nar('——三年前。慈善晚宴。'),
  show('shen', 'l', 'shock', 'gala'), show('bai', 'r', 'smile', 'wedding'),
  th('這是……我回來了？回到三年前？'),
  say('bai', '知意，你臉色好差，沒事吧？', { mood: 'smile' }),
  th('這個笑容……我記得。就是今晚，她設下第一個局。'),
  show('lm', 'c', 'angry'),
  say('lm', '陸家傳了三代的翡翠項鍊不見了！剛才更衣室裡，只有薇薇和你！', { h: 30 }),
  mus('tense'),
  say('bai', '伯母別急……我相信知意不是故意的……', { h: 20, mood: 'sad' }),
  hide('lm'), show('lu', 'c', 'cold'),
  say('lu', '知意，把東西拿出來，我可以當作沒發生過。', { h: 30 }),
  nar('四周的目光像針一樣扎過來。', { h: 20 }),
  choice('全場都在等你的反應——', [
    op('忍下來，先解釋', 'n', { then: [
      say('shen', '我沒有拿。', { mood: 'sad' }),
      say('bai', '沒有人說你拿了呀……只要看看你的包，就清楚了。', { mood: 'smile' }),
      nar('我知道，一搜，項鍊就會「剛好」躺在我的手袋裡。'),
      nar('我遞出了手袋。翡翠的綠光，刺痛了所有人的眼。'),
      say('lu', '沈知意，我真是看錯你了。', { mood: 'cold' }),
      show('gu', 'r', 'cold'),
      say('gu', '更衣室外有監控。需要我調出來，還是白小姐自己說？'),
      mood('bai', 'shock'),
      slap('bai', '真相大白', { size: 'small' })
    ], love: { gu: 3 } }),
    op('當眾拆穿：「項鍊在你左手袋夾層」', 's', { cost: 15, free: true, then: [
      say('shen', '不用搜我。白薇薇，你左手袋的夾層裡，是什麼？', { mood: 'cold' }),
      say('bai', '你、你胡說什麼——', { mood: 'shock' }),
      nar('陸母一把搶過手袋。翡翠項鍊「啪」地掉在地上，在寂靜的大廳裡，碎出一聲清響。'),
      slap('bai', '拆穿！', { cg: 'cg_necklace', danmaku: DM.slap }),
      say('lm', '薇薇……這是怎麼回事？', { mood: 'shock' }),
      show('gu', 'r', 'cold')
    ] })
  ]),
  say('gu', '沈小姐，好眼力。', { mood: 'smirk' }),
  choice('這個陌生男人遞來一張名片——', [
    op('接過，道謝', 'n', { love: { gu: 4 }, then: [say('gu', '不用謝。你值得被好好對待。')] }),
    op('淡淡點頭，不多說', 'n', { love: { gu: 2 }, then: [say('gu', '果然，和我想的一樣。')] })
  ]),
  nar('名片上只有一個名字，和一串號碼：顧衍之。'),
  th('顧衍之……前世，我從沒見過這個人。可他看我的眼神，像是等了很久。'),
  end('神秘男人壓低聲音：「如果還有人給你設局——我等你，很久了。」', { next: 'e2' })
]);

EP('e2', 2, '找出破綻', null, [
  mus('calm'), bg('mansion'),
  nar('翌日。白薇薇哭哭啼啼，向整個圈子解釋這只是「誤會」。陸子謙，居然還在替她說話。'),
  show('shen', 'l', 'cold', 'plain'),
  th('她不會停手。我需要真正致命的證據。'),
  show('wen', 'r', 'normal'),
  say('wen', '知意，我看了新聞。你需要的是證據，不是眼淚。'),
  say('wen', '以前每次被欺負，你都只會躲。這次，你想怎麼做？', { mood: 'smile' }),
  choice('面對溫景行——', [
    op('「我想親手找出來。」', 'n', { love: { wen: 4 }, then: [say('wen', '好。那我陪你。', { mood: 'smile' })] }),
    op('「景行，你能幫我查嗎？」', 'n', { love: { wen: 3 }, then: [say('wen', '你開口，我就在。')] }),
    op('拉住他的衣袖：「這次，我不想一個人。」', 'l', { cost: 15, love: { wen: 12 }, then: [mood('wen', 'shock'), say('wen', '……好。這一次，我不會再讓你一個人。', { mood: 'smile' })] })
  ]),
  say('wen', '白薇薇是你的設計助理，她的住處，一定有線索。'),
  clear(), bg('room'), mus('tense'),
  nar('我拿着備用鑰匙，進了白薇薇的家。可惜，她提早回來了。'),
  show('shen', 'l', 'shock', 'plain'), show('bai', 'c', 'angry', 'red'), show('lu', 'r', 'cold'),
  say('bai', '知意？你怎麼會在我房間！', { h: 30, mood: 'angry' }),
  say('lu', '私闖民宅是犯法的。沈知意，你真的太讓我失望了。', { h: 35 }),
  say('bai', '子謙，我好怕……她是不是瘋了？', { h: 35, mood: 'sad' }),
  say('lu', '薇薇，借一步說話。我們去外面談。', { mood: 'smirk' }),
  hide('bai', 'lu'),
  th('他們出去了——我只有三十秒。'),
  game('evidence', { title: '三十秒，找出她的破綻', bg: 'desk', time: 30, need: 2, items: [
    { t: 'laptop', x: 50, y: 56 }, { t: 'cup', x: 80, y: 62 }, { t: 'phone', x: 20, y: 66 },
    { t: 'paper', x: 28, y: 36, flaw: '被撕走一角的設計稿' }, { t: 'usb', x: 74, y: 34, flaw: '來路不明的 U 盤' },
    { t: 'receipt', x: 52, y: 80, flaw: '陸氏的轉帳單據' }, { t: 'book', x: 14, y: 42 }, { t: 'plant', x: 88, y: 40 }
  ] }, [
    love('wen', 6), give({ dia: 10 }),
    th('設計稿、U 盤、轉帳單……全齊了！')
  ], [
    love('wen', 2),
    th('只找到一部分……不夠！')
  ]),
  show('bai', 'c', 'smile', 'red'), show('lu', 'r', 'smirk'),
  say('bai', '知意，你還有什麼話要說嗎？', { mood: 'smirk' }),
  say('shen', '有。這份轉帳記錄，是你把我的設計稿賣給陸氏的收據。', { mood: 'cold' }),
  say('lu', '偽造的！', { mood: 'shock' }),
  show('wen', 'l', 'normal'),
  say('wen', '公證處的原件，我剛取回來。', { mood: 'smile' }),
  slap('bai', '證據確鑿', { danmaku: DM.slap }),
  say('shen', '陸子謙，我們的婚約，到此為止。', { mood: 'cold' }),
  sys('gift30'),
  nar('手機震動。是父親的來電。'),
  end('「知意，爸爸的公司……出事了。」', { next: 'e3' })
]);

EP('e3', 3, '前世記憶', null, [
  mus('tense'), bg('boardroom'),
  nar('沈氏集團董事會。長桌兩側坐滿了人，空氣只有冷意。'),
  show('shen', 'l', 'normal', 'suit'), show('fa', 'c', 'sad'), show('dong', 'r', 'cold'),
  say('fa', '恆通的供貨合約，今天必須定下來……'),
  say('dong', '沈總，我直說吧。讓一個小女孩坐在這裡，不合適。', { h: 35 }),
  say('dong', '沈小姐，董事會不是過家家，請你出去。', { h: 35, mood: 'angry' }),
  cr('「沈總年紀大了，這個位置，該換人了。」', { h: 10 }),
  nar('父親的手，在桌下微微發抖。他不敢看我。', { h: 10 }),
  hide('fa'), show('lu', 'c', 'smirk'),
  say('lu', '各位，陸氏願意注資救急——條件是，沈氏讓出三成股權。', { h: 30 }),
  th('來了。前世，就是這一步，沈氏被一口一口吞掉。'),
  choice('你唯一的武器，是那一世的記憶——', [
    op('「我只是覺得……恆通有問題。」', 'n', { then: [
      say('dong', '沒有證據的直覺，值幾個錢？', { mood: 'angry' }),
      show('fa', 'c', 'smile'),
      say('fa', '……我相信我女兒。給我們一週。'),
      slap('dong', '父愛如山', { size: 'small' }), give({ pow: 5 })
    ] }),
    op('說出前世的記憶：「恆通三個月後會爆雷。」', 's', { cost: 25, then: [
      say('shen', '恆通三個月後會爆雷。他們的倉庫早就是空的，貨單全是假的。', { mood: 'cold' }),
      say('dong', '你、你怎麼可能知道這種內幕？', { mood: 'shock' }),
      say('shen', '陸總要救急？不如先解釋，為什麼恆通的老闆，上週剛和你吃過飯。', { mood: 'cold' }),
      hit('dong', '內幕曝光！'),
      cr('「恆通的老闆……真的和陸總吃過飯？」', {}),
      say('dong', '我、我只是……考慮不周……', { mood: 'shock' }),
      slap('lu', '全場倒吸一口涼氣', { cg: 'cg_board', danmaku: DM.slap }),
      cr('「沈小姐……不，沈總。請你繼續說。」', {}),
      give({ pow: 10 })
    ] }),
    op('🔒 以前世之名，震懾全場', 'h', { req: { pow: 25 }, then: [] })
  ]),
  sys('power'),
  give({ item: 'precog', n: 1 }),
  sys('precog'),
  sys('galleryhint'),
  clear(), bg('street'), mus('calm'),
  nar('夜裡。手機亮起。是顧衍之。'),
  say('gu', '恆通的事，我幫你查過了。你是對的。', {}),
  choice('回覆他——', [
    op('「你為什麼要查這個？」', 'n', { love: { gu: 3 } }),
    op('「謝謝，改天請你吃飯。」', 'n', { love: { gu: 4 } }),
    op('「顧先生，你好像總比我快一步。」', 'l', { cost: 15, love: { gu: 12 } })
  ]),
  say('gu', '恆通三個月後爆雷——連我都沒查到的消息，你是怎麼知道的？', {}),
  end('這個男人，也許不簡單。', { next: 'e4' })
]);

EP('e4', 4, '星河驚艷', null, [
  mus('calm'), bg('gala'),
  nar('蕭氏集團周年晚宴。今晚的主題——「星河」。'),
  show('shen', 'l', 'normal', 'gala'), show('bai', 'r', 'smile', 'red'),
  say('bai', '哎呀，知意，你不會就穿這樣來吧？', { h: 25, mood: 'smirk' }),
  fx('flash'), nar('「嘩」——一杯紅酒潑在禮服上。'),
  say('bai', '對不起嘛～我不是故意的。', { h: 30, mood: 'smirk' }),
  show('xiao', 'c', 'smirk'),
  say('xiao', '沈家的千金，連件像樣的禮服都沒有？', { h: 30 }),
  nar('周圍響起竊笑。有人舉起了手機。', { h: 20 }),
  th('這杯酒，是她安排好的。但這一次——我不會躲。'),
  say('xiao', '去換吧。換不出像樣的，就請沈小姐安靜地離場。', { mood: 'cold' }),
  clear(), bg('room'), mus('tense'),
  nar('更衣室裡，只剩下三排禮服架。'),
  th('今晚主題是「星河」。選對了，就是我的舞台。'),
  game('dress', { set: 'star', time: 45, need: 70 }, [
    love('xiao', 6),
    th('就是這一身！')
  ], [
    love('xiao', 2),
    th('勉強過關……下次再細心一點。')
  ]),
  clear(), bg('gala'), mus('triumph'),
  show('shen', 'l', 'smile', 'gala'), show('xiao', 'r', 'shock'),
  iff('flag.dress_win', [
    slap('xiao', '驚艷全場', { cg: 'cg_gown', danmaku: DM.boss })
  ], [
    slap('xiao', '有點意思', { size: 'small' })
  ]),
  show('bai', 'c', 'angry', 'red'),
  say('bai', '憑什麼……她憑什麼！', { mood: 'angry' }),
  choice('蕭凜走近，打量着你——', [
    op('「蕭先生，欣賞完了？」', 'n', { love: { xiao: 5 }, then: [say('xiao', '嘴還挺利。', { mood: 'smirk' })] }),
    op('「欠我一句道歉。」', 'n', { love: { xiao: 4 }, then: [say('xiao', '……抱歉。下不為例。', { mood: 'smirk' })] }),
    op('舉杯：「星河是借的光——你敢不敢也試試？」', 'l', { cost: 15, love: { xiao: 12 }, then: [say('xiao', '有意思。我記住你了。', { mood: 'smile' })] })
  ]),
  clear(), bg('street'), mus('calm'),
  nar('晚宴後。街邊的路燈把雨絲照成金線。'),
  show('shen', 'l', 'smile', 'gala'), show('wen', 'r', 'smile'),
  say('wen', '我在外面等了你一個晚上。', {}),
  choice('他把外套披到你肩上——', [
    op('「你怎麼不進去？」', 'n', { love: { wen: 4 }, then: [say('wen', '那種場合，我怕你分心。')] }),
    op('「謝謝你，景行。」', 'n', { love: { wen: 3 }, then: [say('wen', '不必謝。')] })
  ]),
  th('他的手，微微發抖——像從前每一次，擔心我受傷那樣。'),
  end('蕭氏的暗處，有人把你的照片，擺到了陸子謙面前。', { next: 'e5' })
]);

EP('e5', 5, '死敵', null, [
  mus('tense'), bg('mansion'),
  nar('陸氏與蕭氏的秘密酒會。我借送文件之名，混進了會所。'),
  th('前世，陸子謙就是靠這筆交易，吞下沈氏。今晚，我要親眼看看。'),
  show('lu', 'l', 'smirk'), show('xiao', 'r', 'smirk'),
  say('lu', '蕭少，顧衍之那邊，你有把握？'),
  say('xiao', '他最近護着一個姓沈的女人，有趣。'),
  say('lu', '沈知意？不過是一顆棋子。等沈氏到手……'),
  show('shen', 'c', 'shock', 'gala'),
  say('lu', '知意？你怎麼會在這裡！', { mood: 'shock' }),
  say('lu', '偷聽？沈知意，你現在連一點教養都沒有了。', { h: 35, mood: 'angry' }),
  say('xiao', '沈小姐，站錯隊的人，下場都不太好。', { h: 35, mood: 'cold' }),
  say('bai', '知意……別鬧了，快向子謙道歉吧。', { h: 30, mood: 'sad' }),
  choice('三面圍堵，你的籌碼只有一個——', [
    op('「我只是路過。」', 'n', { then: [
      say('lu', '路過？保安！', { mood: 'angry' }),
      show('gu', 'c', 'cold'),
      say('gu', '這位小姐，是我的客人。', {}),
      slap('lu', '誰敢動她', { size: 'small' })
    ] }),
    op('「陸子謙，你和蕭氏簽的對賭協議，需要我當眾念第七條嗎？」', 'h', { req: { pow: 12 }, love: { xiao: 5 }, then: [
      say('lu', '你、你怎麼會知道第七條？', { mood: 'shock' }),
      say('xiao', '……她居然看過原稿。', { mood: 'shock' }),
      hit('lu', '第七條！'),
      say('lu', '那份文件，只有我和蕭凜看過！', { mood: 'shock' }),
      say('xiao', '……別看我。我連原稿都沒給她看過。', { mood: 'shock' }),
      cr('「對賭協議第七條……那不是要吞併蕭氏的條款嗎？」', {}),
      say('xiao', '陸總。你在條款裡，寫了要吞掉蕭氏？', { mood: 'cold' }),
      slap('lu', '底牌盡掀', { danmaku: DM.slap })
    ] }),
    op('取出錄音筆，按下播放', 's', { cost: 25, then: [
      nar('錄音筆裡，傳出陸子謙那句「沈氏不過是顆棋子」。一遍，又一遍。'),
      slap('lu', '自食其果', { danmaku: DM.slap })
    ] })
  ]),
  choice('蕭凜眯起了眼——', [
    op('「蕭先生，你是來看戲，還是下場？」', 'n', { love: { xiao: 5 }, then: [say('xiao', '……我開始期待了。', { mood: 'smirk' })] }),
    op('不理他，轉身離開', 'n', { love: { xiao: 2 }, then: [say('xiao', '喂，我還沒說完。', { mood: 'angry' })] })
  ]),
  show('gu', 'c', 'cold'),
  say('lu', '顧衍之……你果然跟她是一夥的！', { mood: 'shock' }),
  say('gu', '陸子謙，我們不是早就站在對面了嗎。', { mood: 'cold' }),
  choice('顧衍之朝你伸出手——', [
    op('把手放進他的掌心', 'n', { love: { gu: 5 }, then: [say('gu', '別怕，我在。')] }),
    op('自己走出去', 'n', { love: { gu: 3 }, then: [say('gu', '……你比我想像的更倔。', { mood: 'smile' })] })
  ]),
  end('「沈知意，你認不認識我，不重要。重要的是——前世你死的那天，我也在場。」', { next: 'e6' })
]);

EP('e6', 6, '三面受敵', null, [
  mus('tense'), bg('press'),
  nar('翌日，沈氏股價暴跌。一份偽造的「財務欺詐合約」流出，簽名——沈知意。'),
  show('shen', 'l', 'shock', 'suit'), show('rep', 'c', 'angry'), show('lu', 'r', 'sad'),
  say('rep', '沈小姐，請問你怎麼解釋偽造簽名一事？', { h: 30 }),
  say('lu', '作為前未婚夫，我痛心疾首……為了社會，我只能大義滅親。', { h: 35, mood: 'sad' }),
  say('bai', '我、我作證……知意她從小就愛撒謊……', { h: 35, mood: 'sad' }),
  nar('手機震動：「你的帳戶已被凍結。」是蕭氏的手筆。', { h: 15 }),
  th('他們佈了天羅地網。我，還有最後一張牌。'),
  choice('鎂光燈逼近，你無路可退——', [
    op('「我會用法律途徑。」', 'n', { love: { wen: 4 }, then: [say('lu', '法律？你還有時間嗎？', { mood: 'smirk' })] }),
    op('「請給我一點時間。」', 'n', { love: { gu: 3 }, then: [say('rep', '時間？股民等不起！', { mood: 'angry' })] }),
    op('翻開預知卡：「第三份文件的日期，有問題。」', 'h', { req: { item: 'precog' }, love: { gu: 5, wen: 3, xiao: 3 }, then: [
      say('shen', '你們手上那份文件，簽名頁的日期寫着二月三十日。', { mood: 'cold' }),
      nar('記者的鏡頭，微微偏向了陸子謙。但他們早已準備了第二層。')
    ] })
  ]),
  cr('「看來沈氏真的完了。」', {}),
  nar('記者散去。閃光燈熄滅。大廳裡，只剩下碎紙和我的影子。'),
  th('所有人轉身離去。只有三個人，沒有走。'),
  show('gu', 'l', 'cold', 'coat'),
  nar('第一個人，站在最遠的柱子旁。他一句話也沒說，只是脫下大衣，隔着十步的距離，朝我走來。'),
  say('gu', '遲了。', { mood: 'cold' }),
  say('gu', '三個小時，查到了所有源頭。給我一句話，我替你清場。', { mood: 'cold' }),
  show('wen', 'c', 'normal'),
  nar('第二個人，從側門匆匆趕來。氣還沒喘勻，先替我撫平了衣領。'),
  say('wen', '知意，你的胃藥。還有，保險箱裡的原件，我取回來了。', { mood: 'smile' }),
  say('wen', '你想怎麼做？我來鋪路。', { mood: 'smile' }),
  show('xiao', 'r', 'smirk', 'coat'),
  nar('第三個人，倚在門框上，吹着口哨。像是這場風暴，與他無關。'),
  say('xiao', '喂，沈知意。凍你帳戶的，是我手下的人。', { mood: 'smirk' }),
  say('xiao', '現在我要把他們都抓回來。順便，打個賭——你能不能贏？', { mood: 'smirk' }),
  th('三個人。三雙伸向我的手。冷的、暖的、不羈的。'),
  th('這一世，我該握住誰？'),
  route(),
  end('他的手，握緊了你的。', { nextBy: 'route' })
]);
