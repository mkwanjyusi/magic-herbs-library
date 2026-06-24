const HERBS = Array.isArray(window.__HERBS) ? window.__HERBS : [];
const TAXONOMY = window.__TAXONOMY || {};
const RECIPES = Array.isArray(window.__RECIPES) ? window.__RECIPES : [];
const app = document.querySelector("#app");

const state = {
  view: "home",
  query: "",
  filter: null,
  initial: "all",
  currentId: null,
  currentRecipeId: null,
  contactCopied: false
};

const CONTACT_WECHAT = "Margaret77";
const viewHistory = [];
let touchStart = null;

const elements = { "火": "#c2604a", "水": "#5f82b0", "风": "#6f9e78", "土": "#a6824f", "未知": "#9a93a6" };
const planets = { "太阳": "☉", "月亮": "☽", "水星": "☿", "金星": "♀", "火星": "♂", "木星": "♃", "土星": "♄", "未知": "·" };
const genders = { "阳性": "☉", "阴性": "☾", "未知": "·" };
const powerCats = [
  { key: "保护", label: "保护 · 辟邪", hue: "#b5503c", match: ["保护", "辟邪", "防护", "护身", "守护"] },
  { key: "爱情", label: "爱情 · 吸引", hue: "#c07a86", match: ["爱情", "吸引", "恋", "情侣", "婚", "倾慕", "爱"] },
  { key: "金钱", label: "金钱 · 财富", hue: "#c4a04e", match: ["金钱", "财", "繁荣", "富", "发达"] },
  { key: "治疗", label: "治疗 · 健康", hue: "#6fae8e", match: ["治疗", "治療", "疗", "健康", "治愈", "康复"] },
  { key: "净化", label: "净化 · 洁净", hue: "#5fa3b0", match: ["净化", "洁净", "纯净", "清洁", "洁化"] },
  { key: "通灵", label: "通灵 · 预言", hue: "#7e86c0", match: ["通灵", "灵性", "灵力", "预言", "占卜", "预知", "灵视"] },
  { key: "梦境", label: "梦境 · 睡眠", hue: "#9a7bb0", match: ["梦", "睡眠", "安眠", "失眠"] },
  { key: "力量", label: "力量 · 勇气", hue: "#c2724e", match: ["力量", "力气", "勇气", "勇敢", "强大"] },
  { key: "生育", label: "生育 · 繁殖", hue: "#7faa5e", match: ["生育", "繁殖", "生殖", "生子", "怀孕"] },
  { key: "幸福", label: "幸福 · 和平", hue: "#6db0a0", match: ["幸福", "和平", "快乐", "安宁", "平静"] },
  { key: "驱邪", label: "驱邪 · 破咒", hue: "#b56a78", match: ["驱邪", "驱魔", "破除", "逆转", "除魔", "驱除", "破咒", "解咒"] },
  { key: "智慧", label: "智慧 · 成功", hue: "#9aa05a", match: ["智慧", "成功", "长寿", "胜利"] }
];
const useMap = {
  保护: [
    "护身符：取少量干燥草叶装入布袋，加入一撮盐或黑线，随身携带用于日常防护。",
    "门窗守护：将草束悬于门口、窗边或玄关，配合简单祈愿，用于阻隔不受欢迎的能量。",
    "旅行防护：出行前把草药放入小纸包或护符袋，写下目的地与归期，作为旅途平安的象征。"
  ],
  爱情: [
    "爱情香包：与玫瑰、薰衣草或甜味香料同置于粉色布袋，用于吸引温和、尊重的关系。",
    "魅力沐浴：将草药装入茶包袋浸泡热水后加入浴水，沐浴时专注于自信、开放与被爱。",
    "关系和合：把草药置于两人共同空间，搭配一张写有愿望的纸条，用于修复沟通与亲密感。"
  ],
  金钱: [
    "招财袋：与硬币、桂皮或月桂叶一起放入绿色小袋，置于钱包、账本或工作桌旁。",
    "事业熏香：在制定计划或整理账务前焚香，象征清理阻滞、吸引稳定机会。",
    "订单/客户魔法：把草药放在名片、报价单或愿望清单下方一夜，强化繁荣意图。"
  ],
  治疗: [
    "疗愈香囊：装入白色或浅色布袋，放在床边或休息处，作为康复、安稳与照护的象征。",
    "舒缓浴：外用草药可做成浸泡包加入浴水，配合深呼吸与休息仪式；有毒草药不要接触皮肤。",
    "照护蜡烛：在安全烛台旁放置少量草药，点烛时为身体复原、情绪稳定或家人健康祈愿。"
  ],
  净化: [
    "空间净化：焚香或以草束轻扫房间角落，从门口开始顺时针移动，象征清除沉滞气息。",
    "法器清理：把草药放在器具旁过夜，或用草药烟雾轻熏，用于重置占卜牌、容器与护符。",
    "净化浴：将适合外用的草药装袋浸泡，沐浴后把水流想象为带走杂念与压力。"
  ],
  通灵: [
    "占卜前准备：占卜、冥想或书写梦境前焚香，帮助心绪安静并进入专注状态。",
    "灵感记录：把草药放在笔记本旁，记录梦、直觉与反复出现的象征，用于追踪讯息。",
    "月夜仪式：在月光下放置草药与水杯，第二天用于擦拭祭坛或象征性开启直觉。"
  ],
  梦境: [
    "梦枕：将干草药缝入小布袋放在枕边，睡前写下问题，用于引导清明梦或记梦。",
    "安眠仪式：睡前把草药放在床头，配合三次缓慢呼吸，象征放下白日杂念。",
    "梦境回收：醒来后先记录关键词，再把草药袋握在手中回想画面，帮助整理梦中线索。"
  ],
  力量: [
    "勇气护符：将草药与红线或小石子装袋，面试、谈判、运动或困难任务前随身携带。",
    "意志仪式：把目标写在纸上压于草药下，连续数日查看并行动，强化坚持与执行。",
    "能量唤醒：在清晨整理草药袋或点香，配合一句简短誓言，为当天注入行动感。"
  ],
  生育: [
    "丰饶祭坛：与谷物、种子或鲜花同放，作为创造力、孕育计划与生命力的象征。",
    "新项目祝福：不只用于生育，也可用于作品、事业或关系的萌芽阶段，祈求顺利成长。",
    "家庭和合：放置于家庭空间，配合温和祝词，用于象征照护、滋养与稳定。"
  ],
  幸福: [
    "居家喜乐：放在客厅、卧室或餐桌附近，象征平和、放松与愉悦的家庭气氛。",
    "情绪安定：压力较大时整理草药、写下三件感谢之事，把纸条与草药放在一起。",
    "友情祝福：装成小香包赠予朋友，用于表达安宁、快乐与善意。"
  ],
  驱邪: [
    "破咒清理：将草药与盐分开放置于门口一夜，次日丢弃，象征切断负面影响。",
    "烟熏驱散：用烟雾绕过房间边缘、门窗与镜子，配合明确的驱离语句。",
    "回避旧能量：把草药放在旧物附近，整理、断舍离或搬家时作为结束旧循环的仪式。"
  ],
  智慧: [
    "学习护符：考试、写作或决策前随身携带，帮助保持清醒、条理与判断。",
    "书桌仪式：把草药放在书本或笔记旁，开始工作前写下一个最重要的问题。",
    "梦中求解：睡前把问题写在纸上压于草药下，醒后记录第一反应，用于整理潜意识答案。"
  ]
};

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function snapshotState() {
  return {
    view: state.view,
    query: state.query,
    filter: state.filter ? { ...state.filter } : null,
    initial: state.initial,
    currentId: state.currentId,
    currentRecipeId: state.currentRecipeId
  };
}

function setView(next, options = {}) {
  if (options.track !== false) viewHistory.push(snapshotState());
  Object.assign(state, next);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  const previous = viewHistory.pop();
  if (!previous) return;
  Object.assign(state, previous);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function countBy(fn) {
  return HERBS.filter(fn).length;
}

function catFor(key) {
  return powerCats.find(cat => cat.key === key);
}

function matchesCat(herb, cat) {
  return cat.match.some(word => herb.effect.includes(word) || herb.powers.some(p => p.includes(word)));
}

function decorate(herb) {
  return {
    ...herb,
    elColor: elements[herb.element] || elements["未知"],
    planetSym: planets[herb.planet] || "·",
    genderSym: genders[herb.gender] || "·"
  };
}

function englishNote(herb) {
  const tax = TAXONOMY[herb.name];
  if (herb.englishName) return herb.englishName;
  if (tax?.canonicalName) return tax.canonicalName;
  if (tax?.scientificName) return tax.scientificName;
  const element = herb.element && herb.element !== "未知" ? `${herb.element} element` : "unclassified element";
  const planet = herb.planet && herb.planet !== "未知" ? `${herb.planet} correspondence` : "open correspondence";
  return `${element} · ${planet}`;
}

function imageForHerb(herb) {
  try {
    return localStorage.getItem(`lingcaozhi:image:${herb.id}`) || "";
  } catch {
    return "";
  }
}

function normalizedName(value) {
  return String(value || "")
    .replace(/[薰熏]/g, "熏")
    .replace(/【.*?】|（.*?）|\(.*?\)/g, "")
    .replace(/精油|粉末|粉|根|花|叶|皮|果|油$/g, "")
    .trim();
}

function recipeMatchesHerb(recipe, herb) {
  const herbName = normalizedName(herb.name);
  const names = [
    ...(recipe.relatedHerbs || []),
    ...(recipe.ingredients || []).map(item => item.name)
  ].map(normalizedName);
  return names.some(name => name && (herbName === name || herbName.includes(name) || name.includes(herbName)));
}

function recipesForHerb(herb) {
  return RECIPES.filter(recipe => recipeMatchesHerb(recipe, herb));
}

function taxonomyRows(herb) {
  const tax = TAXONOMY[herb.name];
  if (!tax?.scientificName && !tax?.canonicalName) {
    return [
      ["学名", "待校对"],
      ["界", "待校对"],
      ["门", "待校对"],
      ["纲", "待校对"],
      ["目", "待校对"],
      ["科", "待校对"],
      ["属", "待校对"]
    ];
  }
  const cnTax = {
    Plantae: "植物界",
    Fungi: "真菌界",
    Animalia: "动物界",
    Tracheophyta: "维管植物门",
    Basidiomycota: "担子菌门",
    Chordata: "脊索动物门",
    Magnoliopsida: "木兰纲",
    Liliopsida: "百合纲",
    Pinopsida: "松柏纲",
    Agaricomycetes: "伞菌纲",
    Mammalia: "哺乳纲",
    Fabales: "豆目",
    Apiales: "伞形目",
    Ericales: "杜鹃花目",
    Austrobaileyales: "木兰藤目",
    Liliales: "百合目",
    Lamiales: "唇形目",
    Rosales: "蔷薇目",
    Malpighiales: "金虎尾目",
    Sapindales: "无患子目",
    Acorales: "菖蒲目",
    Malvales: "锦葵目",
    Asterales: "菊目",
    Asparagales: "天门冬目",
    Solanales: "茄目",
    Myrtales: "桃金娘目",
    Pinales: "松柏目",
    Agaricales: "伞菌目",
    Piperales: "胡椒目",
    Santalales: "檀香目",
    Dipsacales: "川续断目",
    Laurales: "樟目",
    Fagales: "壳斗目",
    Caryophyllales: "石竹目",
    Geraniales: "牻牛儿苗目",
    Brassicales: "十字花目",
    Arecales: "棕榈目",
    Poales: "禾本目",
    Gentianales: "龙胆目",
    Fabaceae: "豆科",
    Apiaceae: "伞形科",
    Asteraceae: "菊科",
    Styracaceae: "安息香科",
    Lamiaceae: "唇形科",
    Salicaceae: "杨柳科",
    Rutaceae: "芸香科",
    Araliaceae: "五加科",
    Acoraceae: "菖蒲科",
    Plantaginaceae: "车前科",
    Thymelaeaceae: "瑞香科",
    Schisandraceae: "五味子科",
    Rosaceae: "蔷薇科",
    Solanaceae: "茄科",
    Myrtaceae: "桃金娘科",
    Cupressaceae: "柏科",
    Amanitaceae: "鹅膏科",
    Iridaceae: "鸢尾科",
    Juglandaceae: "胡桃科",
    Piperaceae: "胡椒科",
    Viscaceae: "槲寄生科",
    Convolvulaceae: "旋花科",
    Amaryllidaceae: "石蒜科",
    Burseraceae: "橄榄科",
    Lauraceae: "樟科",
    Santalaceae: "檀香科",
    Liliaceae: "百合科",
    Theaceae: "山茶科",
    Poaceae: "禾本科",
    Arecaceae: "棕榈科",
    Betulaceae: "桦木科",
    Pedaliaceae: "胡麻科",
    Rubiaceae: "茜草科",
    Violaceae: "堇菜科"
  };
  const withCn = value => {
    if (!value) return "待校对";
    return cnTax[value] ? `${cnTax[value]} ${value}` : value;
  };
  return [
    ["学名", tax.scientificName || tax.canonicalName || "待校对"],
    ["界", withCn(tax.kingdom)],
    ["门", withCn(tax.phylum)],
    ["纲", withCn(tax.class)],
    ["目", withCn(tax.order)],
    ["科", withCn(tax.family)],
    ["属", withCn(tax.genus)]
  ];
}

function filteredHerbs() {
  let list = HERBS;
  if (state.filter) {
    const { type, value } = state.filter;
    if (type === "power") list = list.filter(h => matchesCat(h, catFor(value)));
    if (type === "element") list = list.filter(h => h.element === value);
    if (type === "planet") list = list.filter(h => h.planet === value);
    if (type === "gender") list = list.filter(h => h.gender === value);
    if (type === "toxic") list = list.filter(h => h.toxic);
  }
  const q = state.query.trim().toLowerCase();
  if (q) {
    list = list.filter(h => h.name.toLowerCase().includes(q));
  }
  return list;
}

function searchBox(compact = false) {
  return `
    <label class="search ${compact ? "compact" : ""}">
      <span>⌕</span>
      <input data-action="search" value="${esc(state.query)}" placeholder="${compact ? "继续搜索草药名..." : "搜索草药名..."}">
    </label>
  `;
}

function disc(text, color, size = "") {
  return `<span class="disc" style="background:${color};${size}">${esc(text)}</span>`;
}

function topbar(detail = "") {
  return `
    <div class="wrap">
      <div class="topbar">
        <button class="brand" data-action="home">灵草志</button>
        <button class="toplink" data-action="recipes">复杂配方</button>
        <button class="toplink" data-action="contact">联系版主</button>
        ${detail ? `<small>${detail}</small>` : searchBox(true)}
      </div>
    </div>
  `;
}

function home() {
  const heroCats = powerCats.slice(0, 8).map((cat, index) => `
    <button class="hero-card tone-${index % 4}" data-action="filter" data-type="power" data-value="${cat.key}" data-label="${cat.label}">
      <span class="hero-icon" style="color:${cat.hue}">${["✦", "☽", "♁", "✧"][index % 4]}</span>
      <strong>${cat.label}</strong>
      <small>${countBy(h => matchesCat(h, cat))} 味草药</small>
    </button>
  `).join("");
  const elementChips = ["火", "水", "风", "土"].map(el => `
    <button class="chip" data-action="filter" data-type="element" data-value="${el}" data-label="元素 · ${el}">
      ${disc(el, elements[el])}<small>${countBy(h => h.element === el)} 味</small>
    </button>
  `).join("");
  const genderChips = ["阳性", "阴性"].map(g => `
    <button class="chip" data-action="filter" data-type="gender" data-value="${g}" data-label="极性 · ${g}">
      <span class="sym">${genders[g]}</span>${g}<small>${countBy(h => h.gender === g)}</small>
    </button>
  `).join("");
  const planetChips = ["太阳", "月亮", "水星", "金星", "火星", "木星", "土星"].map(p => `
    <button class="chip" data-action="filter" data-type="planet" data-value="${p}" data-label="行星 · ${p}">
      <span class="sym">${planets[p]}</span>${p}<small>${countBy(h => h.planet === p)}</small>
    </button>
  `).join("");

  return `
    <section class="home-hero">
      <img class="hero-iris" src="assets/iris-hero.png" alt="鸢尾花">
      <div class="wrap hero-shell">
        <nav class="hero-nav">
          <button class="brand" data-action="home">灵草志</button>
          <div class="hero-actions" aria-label="快速入口">
            <button data-action="name" title="按名称">A-Z</button>
            <button data-action="filter" data-type="toxic" data-value="true" data-label="毒草 · 慎用" title="毒草">☠</button>
            <button data-action="filter" data-type="power" data-value="通灵" data-label="通灵 · 预言" title="通灵">✦</button>
          </div>
        </nav>
        <div class="hero-layout">
          <section class="hero-copy">
            <div class="pill">草药 · 魔法 · 对应之书</div>
            <h1>灵草志</h1>
        <div class="latin">Library of Magic Herbs</div>
            <p class="intro">输入草药名或想达成的魔法目的</p>
            ${searchBox()}
            <div class="hero-cta">
              <button class="primary" data-action="name">浏览全部草药 →</button>
              <button class="secondary" data-action="filter" data-type="power" data-value="保护" data-label="保护 · 辟邪">从保护开始</button>
              <button class="secondary" data-action="recipes">复杂配方</button>
            </div>
            <div class="countline">书中已收录 <strong>${HERBS.length}</strong> 味草药，正在继续补充书籍资料</div>
          </section>
          <aside class="hero-panel">
            <div class="panel-title">按功效起步</div>
            <div class="hero-card-grid">${heroCats}</div>
          </aside>
        </div>
      </div>
    </section>
    <div class="home-ribbon">
      <div class="wrap ribbon-inner">
        ${powerCats.slice(8).map(cat => `<button data-action="filter" data-type="power" data-value="${cat.key}" data-label="${cat.label}" style="--hue:${cat.hue}">${cat.label}</button>`).join("")}
      </div>
    </div>
    <div class="band">
      <section class="wrap section compact-section">
        <div class="section-head"><h2>按本源查找</h2><span>依元素、行星与阴阳追溯草药的根性</span></div>
        <div class="source-grid">
          <div>
            <div class="source-title">四大元素</div>
            <div class="chips">${elementChips}</div>
            <div class="source-title">阴阳极性 · 毒性</div>
            <div class="chips">
              ${genderChips}
              <button class="chip danger" data-action="filter" data-type="toxic" data-value="true" data-label="毒草 · 慎用">☠ 毒草慎用 <small>${countBy(h => h.toxic)}</small></button>
            </div>
          </div>
          <div>
            <div class="source-title">七大行星</div>
            <div class="chips">${planetChips}</div>
          </div>
        </div>
      </section>
    </div>
    <div class="band">
      <section class="wrap">
        <button class="name-entry" data-action="name">
          <strong>按名称查找<span>从 A 到 Z，按拼音首字母翻阅全部草药</span></strong>
          <i class="arrow">→</i>
        </button>
      </section>
    </div>
    <section class="contact-band" id="contact">
      <div class="wrap contact-inner">
        <div class="contact-copy">
          <span class="contact-kicker">Free Consultation</span>
          <h2>写信给版主</h2>
          <p>如果你想交流草药魔法、配方整理，或在草药魔法、仪式魔法的实践中遇到困惑，版主提供免费咨询。来信尽力回复。</p>
        </div>
        <div class="contact-card">
          <small>微信</small>
          <strong>${CONTACT_WECHAT}</strong>
          <button class="secondary contact-copy-button" data-action="copy-contact">${state.contactCopied ? "已复制" : "复制微信号"}</button>
        </div>
      </div>
    </section>
    <footer class="iris">
      <div class="wrap">
        <img src="assets/iris-hero.png" alt="鸢尾花">
        <div class="iris-copy">
          <h2>循草木之性，<br>行四时之法。</h2>
          <p>每一株草都有它的脾气与归属：元素、行星、阴阳，皆有迹可循。愿你在此寻得合手的那一味。</p>
        </div>
      </div>
    </footer>
  `;
}

function recipeCard(recipe) {
  return `
    <button class="recipe-card" data-action="open-recipe" data-id="${esc(recipe.id)}">
      <span class="recipe-type">${esc(recipe.type)} · ${esc(recipe.complexity)}</span>
      <strong>${esc(recipe.title)}</strong>
      <small>${esc(recipe.source_book)} p.${esc(recipe.source_page)}</small>
      <span class="tags">${recipe.intent.slice(0, 4).map(x => `<span class="tag">${esc(x)}</span>`).join("")}</span>
    </button>
  `;
}

function recipesView() {
  return `
    ${topbar("/ 复杂配方")}
    <section class="wrap recipes-page">
      <div class="results-head">
        <h1>复杂配方</h1>
        <span class="total">${RECIPES.length} 个复方仪式</span>
        <button class="ghost" data-action="home">← 返回首页</button>
      </div>
      <div class="recipe-grid">${RECIPES.map(recipeCard).join("")}</div>
    </section>
  `;
}

function recipeDetail() {
  const recipe = RECIPES.find(r => r.id === state.currentRecipeId) || RECIPES[0];
  if (!recipe) return recipesView();
  return `
    ${topbar("/ 复杂配方")}
    <section class="wrap recipe-detail">
      <button class="ghost back-left" data-action="recipes">← 返回配方</button>
      <div class="recipe-hero">
        <div>
          <span class="recipe-type">${esc(recipe.type)} · ${esc(recipe.complexity)}</span>
          <h1>${esc(recipe.title)}</h1>
          <p>${esc(recipe.usage)}</p>
          <div class="tags">${recipe.intent.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div>
        </div>
        <aside>
          <small>来源</small>
          <strong>${esc(recipe.source_book)}</strong>
          <span>p.${esc(recipe.source_page)}</span>
        </aside>
      </div>
      <div class="recipe-columns">
        <section>
          <h2>材料</h2>
          <div class="ingredient-list">${recipe.ingredients.map(item => `<div><strong>${esc(item.name)}</strong><span>${esc(item.amount || "")}${item.latin ? ` · ${esc(item.latin)}` : ""}${item.note ? `<br>${esc(item.note)}` : ""}</span></div>`).join("")}</div>
        </section>
        <section>
          <h2>做法</h2>
          <div class="steps">${recipe.method.map((step, i) => `<div><b>${i + 1}</b><span>${esc(step)}</span></div>`).join("")}</div>
        </section>
      </div>
      <section class="detail-section">
        <h2>安全提示</h2>
        <p>${esc(recipe.safety)}</p>
      </section>
      <section class="detail-section">
        <h2>相关草药</h2>
        <div class="chips">${recipe.relatedHerbs.map(name => {
          const herb = HERBS.find(h => h.name === name || h.name.includes(name) || name.includes(h.name));
          return herb ? `<button class="chip" data-action="open" data-id="${herb.id}">${disc(herb.element, elements[herb.element] || elements["未知"])}${esc(herb.name)}</button>` : `<span class="chip">${esc(name)}</span>`;
        }).join("")}</div>
      </section>
    </section>
  `;
}

function card(herb) {
  const h = decorate(herb);
  const tags = h.powers.slice(0, 4).map(p => `<span class="tag">${esc(p)}</span>`).join("");
  const hasRecipe = recipesForHerb(h).length > 0;
  return `
    <button class="herb-card" data-action="open" data-id="${h.id}">
      ${h.toxic ? `<span class="toxic">☠ 有毒</span>` : ""}
      ${hasRecipe ? `<span class="recipe-badge">复方</span>` : ""}
      <span class="card-title">
        ${disc(h.element, h.elColor, "width:40px;height:40px;font-size:18px")}
        <span><strong>${esc(h.name)}</strong><span class="pinyin">${esc(englishNote(h))}</span></span>
      </span>
      <span class="meta"><span><b class="sym">${h.planetSym}</b> ${esc(h.planet)}</span><span><b class="sym">${h.genderSym}</b> ${esc(h.gender)}</span></span>
      <span class="tags">${tags || `<span class="tag">待补充功效</span>`}</span>
    </button>
  `;
}

function browse() {
  const list = filteredHerbs();
  const title = state.filter ? state.filter.label : (state.query ? "搜索结果" : "全部草药");
  return `
    ${topbar()}
    <section class="wrap">
      <div class="results-head">
        <h1>${esc(title)}</h1>
        ${state.query ? `<span class="sub">“${esc(state.query)}”</span>` : ""}
        <span class="total">${list.length} 味</span>
        <button class="ghost" data-action="home">← 返回全部</button>
      </div>
      ${list.length ? `<div class="card-grid">${list.map(card).join("")}</div>` : `<div class="empty"><strong>没有找到匹配的草药</strong><span>试试别的关键词，或返回全部草药</span></div>`}
    </section>
  `;
}

function nameDirectory() {
  const letters = [...new Set(HERBS.map(h => h.initial))].sort();
  const current = state.initial;
  const buttons = ["all", ...letters].map(L => `
    <button class="letter ${current === L ? "active" : ""}" data-action="letter" data-letter="${L}">${L === "all" ? "全部" : L}</button>
  `).join("");
  const shown = current === "all" ? HERBS : HERBS.filter(h => h.initial === current);
  const grouped = shown.reduce((map, herb) => {
    (map[herb.initial] ||= []).push(herb);
    return map;
  }, {});
  const groups = Object.keys(grouped).sort().map(letter => `
    <section class="letter-group">
      <div class="letter-head"><strong>${letter}</strong><span></span></div>
      <div class="name-grid">
        ${grouped[letter].map(h => {
          const herb = decorate(h);
          return `<button class="name-card" data-action="open" data-id="${herb.id}">${disc(herb.element, herb.elColor)}<span><strong>${esc(herb.name)}</strong><span class="pinyin">${esc(englishNote(herb))}</span></span></button>`;
        }).join("")}
      </div>
    </section>
  `).join("");
  return `${topbar("按名称查找")}<section class="wrap"><div class="letters">${buttons}</div>${groups}</section>`;
}

function detail() {
  const herb = decorate(HERBS.find(h => h.id === state.currentId) || HERBS[0]);
  const image = imageForHerb(herb);
  const index = HERBS.findIndex(h => h.id === herb.id);
  const prev = HERBS[(index - 1 + HERBS.length) % HERBS.length];
  const next = HERBS[(index + 1) % HERBS.length];
  const bookUses = (herb.usage_examples || []).map(item => {
    const source = item.source_book ? `（${item.source_book}${item.source_page ? ` p.${item.source_page}` : ""}）` : "";
    const formula = item.formula ? ` 配方：${item.formula}` : "";
    return `${item.title ? item.title + "：" : ""}${item.method || ""}${formula}${source}`;
  });
  const genericUses = [...new Set(powerCats.flatMap(cat => matchesCat(herb, cat) ? useMap[cat.key] || [] : []))];
  const uses = [...bookUses, ...genericUses].slice(0, 7);
  const related = HERBS
    .filter(h => h.id !== herb.id && (h.powers.some(p => herb.powers.slice(0, 4).includes(p)) || h.element === herb.element))
    .slice(0, 6);
  const relatedRecipes = recipesForHerb(herb);
  const taxRows = taxonomyRows(herb);
  return `
    ${topbar("/ 草药详情")}
    <section class="wrap detail-grid">
      <aside>
        <label class="image-box ${image ? "has-image" : ""}" title="点击上传图片">
          <input class="image-input" type="file" accept="image/*" data-action="upload-image" data-id="${herb.id}">
          ${image ? `<img src="${esc(image)}" alt="${esc(herb.name)}">` : ""}
        </label>
        <div class="attr-card">
          <div class="attr-row"><small>元素</small><strong>${disc(herb.element, herb.elColor)}${esc(herb.element)}</strong></div>
          <div class="attr-row"><small>行星</small><strong><span class="sym">${herb.planetSym}</span>${esc(herb.planet)}</strong></div>
          <div class="attr-row"><small>极性</small><strong><span class="sym">${herb.genderSym}</span>${esc(herb.gender)}</strong></div>
        </div>
      </aside>
      <article>
        ${herb.toxic ? `<div class="warning">☠ 此草有毒，切勿内服，仅作护符、熏香等外用法术</div>` : ""}
        <h1 class="detail-title">${esc(herb.name)}</h1>
        <span class="pinyin">${esc(englishNote(herb))}</span>
        <section class="detail-section">
          <h2>功效</h2>
          <div class="tags">${herb.powers.map(p => `<span class="tag">${esc(p)}</span>`).join("") || `<span class="tag">待补充</span>`}</div>
          <p style="margin-top:18px">${esc(herb.effect || "这一味草药的功效文本待补充。")}</p>
        </section>
        ${uses.length ? `<section class="detail-section"><h2>常见魔法用法</h2>${uses.map((u, i) => `<div class="magic-row ${i < bookUses.length ? "book-source" : ""}"><b>※</b><span>${esc(u)}</span></div>`).join("")}</section>` : ""}
        <section class="detail-section"><h2>分类学 · 界门纲目科属</h2><div class="tax">${taxRows.map(r => `<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join("")}</div></section>
        <section class="detail-section">
          <h2>相关复杂配方</h2>
          ${relatedRecipes.length ? `<div class="recipe-grid compact-recipes">${relatedRecipes.map(recipeCard).join("")}</div>` : `<button class="ghost recipe-empty" data-action="recipes">暂无直接匹配，查看全部复杂配方 →</button>`}
        </section>
        <section class="detail-section"><h2>功效相近的草药</h2><div class="chips">${related.map(h => `<button class="chip" data-action="open" data-id="${h.id}">${disc(h.element, elements[h.element] || elements["未知"])}${esc(h.name)}</button>`).join("")}</div></section>
        <div class="pager">
          <button data-action="open" data-id="${prev.id}"><small>← 上一味</small><strong>${esc(prev.name)}</strong></button>
          <button data-action="open" data-id="${next.id}"><small>下一味 →</small><strong>${esc(next.name)}</strong></button>
        </div>
      </article>
    </section>
  `;
}

function render() {
  if (!HERBS.length) {
    app.innerHTML = `<div class="empty"><strong>没有读取到草药数据</strong><span>请确认原始设计包仍在当前文件夹中。</span></div>`;
    return;
  }
  const backButton = viewHistory.length ? `<button class="back-float" data-action="back" aria-label="返回上一级" title="返回上一级">‹</button>` : "";
  app.innerHTML = `${backButton}${state.view === "home" ? home() : state.view === "browse" ? browse() : state.view === "name" ? nameDirectory() : state.view === "recipes" ? recipesView() : state.view === "recipeDetail" ? recipeDetail() : detail()}`;
}

app.addEventListener("input", event => {
  if (event.target.matches("[data-action='search']")) {
    const wasHome = state.view === "home";
    const nextQuery = event.target.value;
    if (wasHome && nextQuery.trim()) viewHistory.push(snapshotState());
    state.query = nextQuery;
    if (wasHome && state.query.trim()) state.view = "browse";
    render();
    const input = app.querySelector("[data-action='search']");
    if (input) {
      input.focus();
      input.setSelectionRange(state.query.length, state.query.length);
    }
  }
  if (event.target.matches("[data-action='upload-image']")) {
    const file = event.target.files?.[0];
    const id = event.target.dataset.id;
    if (!file || !id) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem(`lingcaozhi:image:${id}`, String(reader.result));
      } catch {
        alert("图片太大，浏览器本地存储放不下。可以换一张压缩后的图片。");
      }
      render();
    };
    reader.readAsDataURL(file);
  }
});

app.addEventListener("click", event => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "back") {
    goBack();
    return;
  }
  if (action === "home") setView({ view: "home", query: "", filter: null, currentId: null });
  if (action === "contact") {
    setView({ view: "home", query: "", filter: null, currentId: null });
    requestAnimationFrame(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  if (action === "copy-contact") {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(CONTACT_WECHAT);
    } else {
      const input = document.createElement("textarea");
      input.value = CONTACT_WECHAT;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    state.contactCopied = true;
    render();
    requestAnimationFrame(() => document.querySelector("#contact")?.scrollIntoView({ block: "center" }));
  }
  if (action === "name") setView({ view: "name", query: "", filter: null, initial: "all" });
  if (action === "recipes") setView({ view: "recipes", query: "", filter: null });
  if (action === "open-recipe") setView({ view: "recipeDetail", currentRecipeId: el.dataset.id });
  if (action === "letter") setView({ initial: el.dataset.letter }, { track: false });
  if (action === "open") setView({ view: "detail", currentId: Number(el.dataset.id) });
  if (action === "filter") setView({ view: "browse", query: "", filter: { type: el.dataset.type, value: el.dataset.value, label: el.dataset.label } });
});

window.addEventListener("touchstart", event => {
  const touch = event.changedTouches[0];
  if (!touch || touch.clientX > 32) return;
  touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

window.addEventListener("touchend", event => {
  if (!touchStart || !viewHistory.length) {
    touchStart = null;
    return;
  }
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = Math.abs(touch.clientY - touchStart.y);
  touchStart = null;
  if (dx > 90 && dy < 70) goBack();
}, { passive: true });

render();
