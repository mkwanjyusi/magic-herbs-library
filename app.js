const HERBS = Array.isArray(window.__HERBS) ? window.__HERBS : [];
const TAXONOMY = window.__TAXONOMY || {};
const RECIPES = Array.isArray(window.__RECIPES) ? window.__RECIPES : [];
const MASTERBOOK_DETAILS = window.__MASTERBOOK_DETAILS || {};
const MAGICAL_HERBALISM_DETAILS = window.__MAGICAL_HERBALISM_DETAILS || {};
const HERB_STATUS = window.__HERB_STATUS || {};
const HERB_IMAGES = window.__HERB_IMAGES || {};
const app = document.querySelector("#app");

HERBS.forEach(herb => {
  if (!herb.beyerl && MASTERBOOK_DETAILS[herb.name]) herb.beyerl = MASTERBOOK_DETAILS[herb.name];
  const cunningham = MAGICAL_HERBALISM_DETAILS[herb.name];
  if (cunningham) {
    herb.cunningham = cunningham;
    herb.englishName ||= cunningham.englishName;
    herb.gender = cunningham.gender || herb.gender;
    herb.planet = cunningham.planet || herb.planet;
    herb.element = cunningham.element || herb.element;
    if (Array.isArray(cunningham.powers) && cunningham.powers.length) {
      herb.powers = cunningham.powers;
      herb.effect = cunningham.effect || cunningham.powers.join("，");
    }
    if (cunningham.specificUses) {
      herb.usage_examples = [
        ...(herb.usage_examples || []),
        {
          method: cunningham.specificUses,
          source: cunningham.source
        }
      ];
    }
  }
});

function statusForHerb(herb) {
  return HERB_STATUS.entries?.[herb.name] || {};
}

function isVisibleHerb(herb) {
  return statusForHerb(herb).hidden !== true;
}

const VISIBLE_HERBS = HERBS.filter(isVisibleHerb);

const state = {
  view: "home",
  query: "",
  filter: null,
  recipeFilter: null,
  initial: "all",
  currentId: null,
  currentRecipeId: null,
  contactCopied: false,
  contactOpen: false,
  homeSection: null
};

const CONTACT_WECHAT = "Margaret77";
const viewHistory = [];
let touchStart = null;
let searchComposing = false;

const elements = { "火": "#c2604a", "水": "#5f82b0", "风": "#6f9e78", "土": "#a6824f", "未知": "#9a93a6" };
const planets = { "太阳": "☉", "月亮": "☽", "水星": "☿", "金星": "♀", "火星": "♂", "木星": "♃", "土星": "♄", "未知": "·" };
const genders = { "阳性": "☉", "阴性": "☾", "未知": "·" };
const LOW_PRIORITY_RECIPE_BOOK = "草药魔法：魔法粉配方";
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
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function displayText(value) {
  return String(value ?? "")
    .replace(/复杂配方/g, "配方")
    .replace(/相关复杂配方/g, "相关配方")
    .replace(/复方仪式/g, "配方")
    .replace(/复方/g, "配方");
}

function escDisplay(value) {
  return esc(displayText(value));
}

function cleanUseText(value) {
  return displayText(value)
    .replace(/^\s*Cunningham\s*具体用法\s*[：:]\s*/i, "")
    .replace(/^\s*[^。；;：:\n]{1,32}\s*具体用法\s*[：:]\s*/i, "")
    .trim();
}

function useSource(item) {
  return item.source || {
    book: item.source_book,
    section: item.title,
    page: item.source_page
  };
}

function snapshotState() {
  return {
    view: state.view,
    query: state.query,
    filter: state.filter ? { ...state.filter } : null,
    recipeFilter: state.recipeFilter ? { ...state.recipeFilter } : null,
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
  return VISIBLE_HERBS.filter(fn).length;
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
  return "学名待校对";
}

function imageForHerb(herb) {
  const tax = TAXONOMY[herb.name];
  const trustedImage = tax?.reviewed === true ? HERB_IMAGES[herb.name]?.src : "";
  try {
    return localStorage.getItem(`lingcaozhi:image:${herb.id}`) || trustedImage || "";
  } catch {
    return trustedImage || "";
  }
}

function imageCredit(herb) {
  if (TAXONOMY[herb.name]?.reviewed !== true) return "";
  const image = HERB_IMAGES[herb.name];
  if (!image?.sourceUrl) return "";
  const label = [image.source, image.license].filter(Boolean).join(" · ") || "图片来源";
  return `<a class="image-credit" href="${esc(image.sourceUrl)}" target="_blank" rel="noopener">${esc(label)}</a>`;
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
  return sortedRecipes(RECIPES.filter(recipe => recipeMatchesHerb(recipe, herb)));
}

function recipeSortWeight(recipe) {
  return recipe.source_book === LOW_PRIORITY_RECIPE_BOOK ? 100 : 0;
}

function sortedRecipes(recipes) {
  return [...recipes].sort((a, b) =>
    recipeSortWeight(a) - recipeSortWeight(b) ||
    String(a.source_book || "").localeCompare(String(b.source_book || ""), "zh-Hans-CN") ||
    Number(a.source_page || 0) - Number(b.source_page || 0) ||
    String(a.title || "").localeCompare(String(b.title || ""), "zh-Hans-CN")
  );
}

function taxonomyRows(herb) {
  const tax = TAXONOMY[herb.name];
  if (!tax?.scientificName && !tax?.canonicalName) {
    return [];
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
    Moraceae: "桑科",
    Pinaceae: "松科",
    Theaceae: "山茶科",
    Poaceae: "禾本科",
    Arecaceae: "棕榈科",
    Betulaceae: "桦木科",
    Pedaliaceae: "胡麻科",
    Rubiaceae: "茜草科",
    Violaceae: "堇菜科"
  };
  const withCn = value => {
    if (!value) return "";
    return cnTax[value] ? `${cnTax[value]} ${value}` : value;
  };
  return [
    ["学名", tax.scientificName || tax.canonicalName || ""],
    ["界", withCn(tax.kingdom)],
    ["门", withCn(tax.phylum)],
    ["纲", withCn(tax.class)],
    ["目", withCn(tax.order)],
    ["科", withCn(tax.family)],
    ["属", withCn(tax.genus)]
  ].filter(([, value]) => value);
}

function quoteRef(quote) {
  if (!quote?.text) return "";
  const ref = quote.source || {};
  const book = ref.book || quote.book || "The Master Book of Herbalism";
  const page = ref.page || quote.page;
  return `
    <details class="source-ref quote-ref">
      <summary>原文</summary>
      <span><i>${esc(quote.text)}</i>${quote.translation ? `<br>${esc(quote.translation)}` : ""}<br>${esc(book)}${page ? ` · p.${esc(page)}` : ""}</span>
    </details>
  `;
}

function citeRef(source) {
  if (!source) return "";
  const book = source.book || "The Master Book of Herbalism";
  return `
    <details class="source-ref quote-ref">
      <summary>出处</summary>
      <span>${escDisplay(book)}${source.section ? ` · ${escDisplay(source.section)}` : ""}${source.page ? ` · p.${escDisplay(source.page)}` : ""}</span>
    </details>
  `;
}

function bookDetailData(herb) {
  const data = herb.beyerl || herb.masterBook || herb.book_profile;
  return data || {};
}

function filteredHerbs() {
  let list = VISIBLE_HERBS;
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
    list = list.filter(h => h.name.toLowerCase().includes(q) || (h.aliases || []).some(alias => alias.toLowerCase().includes(q)));
  }
  return list;
}

function searchBox(compact = false) {
  return `
    <label class="search ${compact ? "compact" : ""}">
      <span>⌕</span>
      <input data-action="search" value="${esc(state.query)}" placeholder="${compact ? "继续搜索草药、材料..." : "搜索草药、材料..."}">
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
        <button class="contact-mini" data-action="contact">联系我们</button>
        ${detail ? `<small>${detail}</small>` : searchBox(true)}
      </div>
    </div>
  `;
}

function gatewayCard(id, title, text, meta, icon, tone = 0, action = "home-section") {
  const active = state.homeSection === id ? "active" : "";
  return `
    <button class="gateway-card tone-${tone} ${active}" data-action="${action}" data-section="${id}">
      <span>${icon}</span>
      <strong>${title}</strong>
      <small>${text}</small>
      <em>${meta}</em>
    </button>
  `;
}

function gatewaySummary(id, title, text, meta, icon, tone = 0) {
  return `
    <div class="gateway-card tone-${tone} active">
      <span>${icon}</span>
      <strong>${title}</strong>
      <small>${text}</small>
      <em>${meta}</em>
    </div>
  `;
}

function homeDrawer() {
  if (state.homeSection === "purpose") {
    return `
      <div class="gateway-drawer">
        <div class="drawer-head"><strong>按魔法用途目的查找</strong><span>选择想达成的方向，查看对应草药、材料</span></div>
        <div class="drawer-grid">
          ${powerCats.map((cat, index) => `
            <button class="drawer-card tone-${index % 4}" data-action="filter" data-type="power" data-value="${cat.key}" data-label="${cat.label}">
              <span style="color:${cat.hue}">${["✦", "☽", "♁", "✧"][index % 4]}</span>
              <strong>${cat.label}</strong>
              <small>${countBy(h => matchesCat(h, cat))} 项</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }
  if (state.homeSection === "source") {
    const sourceCards = [
      ...["火", "水", "风", "土"].map(el => ({ type: "element", value: el, label: `元素 · ${el}`, title: `${el}元素`, meta: `${countBy(h => h.element === el)} 项`, icon: disc(el, elements[el]) })),
      ...["太阳", "月亮", "水星", "金星", "火星", "木星", "土星"].map(p => ({ type: "planet", value: p, label: `行星 · ${p}`, title: p, meta: `${countBy(h => h.planet === p)} 项`, icon: `<span class="sym">${planets[p]}</span>` })),
      ...["阳性", "阴性"].map(g => ({ type: "gender", value: g, label: `极性 · ${g}`, title: g, meta: `${countBy(h => h.gender === g)} 项`, icon: `<span class="sym">${genders[g]}</span>` })),
      { type: "toxic", value: "true", label: "毒草 · 慎用", title: "毒性提示", meta: `${countBy(h => h.toxic)} 项`, icon: `<span class="sym">☠</span>` }
    ];
    return `
      <div class="gateway-drawer">
        <div class="drawer-head"><strong>按本源查找</strong><span>依元素、行星与阴阳追溯草药、材料的根性</span></div>
        <div class="drawer-grid compact">
          ${sourceCards.map(item => `
            <button class="drawer-card" data-action="filter" data-type="${item.type}" data-value="${item.value}" data-label="${item.label}">
              ${item.icon}
              <strong>${item.title}</strong>
              <small>${item.meta}</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }
  if (state.homeSection === "ritual") {
    const intentCards = ["保护", "金钱", "爱情", "好运", "梦境", "净化", "通灵", "破咒"].map(intent => {
      const count = RECIPES.filter(r => (r.intent || []).includes(intent)).length;
      return { title: `${intent}配方`, meta: `${count} 个`, filter: { type: "intent", value: intent, label: `${intent}配方` } };
    });
    const typeCards = [...new Set(sortedRecipes(RECIPES).map(r => r.type))].map(type => ({
      title: type,
      meta: `${RECIPES.filter(r => r.type === type).length} 个`,
      filter: { type: "type", value: type, label: type }
    }));
    const cards = [
      { title: "全部仪式配方", meta: `${RECIPES.length} 个`, filter: null },
      ...typeCards,
      ...intentCards
    ];
    return `
      <div class="gateway-drawer">
        <div class="drawer-head"><strong>草药魔法仪式配方</strong><span>按形式或目的查看薰香、粉末、香包与护符</span></div>
        <div class="drawer-grid compact">
          ${cards.map(item => `
            <button class="drawer-card" data-action="recipes" ${item.filter ? `data-recipe-type="${item.filter.type}" data-recipe-value="${esc(item.filter.value)}" data-recipe-label="${esc(item.filter.label)}"` : ""}>
              <span class="sym">✧</span>
              <strong>${esc(item.title)}</strong>
              <small>${esc(item.meta)}</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }
  return "";
}

function home() {
  const gateways = [
    { id: "purpose", title: "按用途查找", text: "保护、爱情、疗愈、净化......", meta: "点击展开", icon: "✦", tone: 0 },
    { id: "source", title: "按本源查找", text: "按元素、行星、阴阳分类", meta: "点击展开", icon: "☉", tone: 2 },
    { id: "ritual", title: "仪式与配方", text: "魔法形式和魔法配方", meta: "点击展开", icon: "☽", tone: 1 },
    { id: "name", title: "草药全目录", text: "按名称首字母分类", meta: "点击进入", icon: "A-Z", tone: 3, action: "name" }
  ];
  const activeGateway = gateways.find(item => item.id === state.homeSection);
  const gatewayCards = activeGateway
    ? `
      <div class="gateway-focus" data-action="home-section-close">
        <div class="gateway-expanded" data-stop-collapse="true">
          <button class="gateway-collapse" data-action="home-section-collapse" aria-label="收起当前入口">收起</button>
          ${gatewaySummary(activeGateway.id, activeGateway.title, activeGateway.text, activeGateway.meta, activeGateway.icon, activeGateway.tone)}
          ${homeDrawer()}
        </div>
      </div>
    `
    : gateways.map(item => gatewayCard(item.id, item.title, item.text, item.meta, item.icon, item.tone, item.action || "home-section")).join("");

  return `
    <section class="home-hero">
      <img class="hero-iris" src="assets/iris-hero.png" alt="鸢尾花">
      <div class="wrap hero-shell">
        <nav class="hero-nav">
          <button class="brand" data-action="home">灵草志</button>
          <div class="hero-nav-tools">
            <button class="contact-mini" data-action="contact">联系我们</button>
            <div class="hero-actions" aria-label="快速入口">
              <button data-action="name" title="按名称">A-Z</button>
              <button data-action="filter" data-type="toxic" data-value="true" data-label="毒草 · 慎用" title="毒草">☠</button>
              <button data-action="filter" data-type="power" data-value="通灵" data-label="通灵 · 预言" title="通灵">✦</button>
            </div>
          </div>
        </nav>
        <div class="hero-layout">
          <section class="hero-copy">
            <div class="pill">草药 · 魔法 · 对应之书</div>
            <h1>灵草志</h1>
        <div class="latin">Library of Magic Herbs</div>
            <p class="intro">输入草药、材料名或想达成的魔法目的</p>
            ${searchBox()}
            <div class="hero-cta">
              <button class="primary" data-action="name">浏览全部草药、材料 →</button>
              <button class="secondary" data-action="home-section" data-section="purpose">按用途查找</button>
              <button class="secondary" data-action="home-section" data-section="ritual">仪式配方</button>
            </div>
            <div class="countline">当前资料库显示 <strong>${VISIBLE_HERBS.length}</strong> 项草药、材料，正在继续补充书籍资料</div>
          </section>
          <aside class="hero-panel">
            <div class="gateway-grid">${gatewayCards}</div>
          </aside>
        </div>
      </div>
    </section>
    <section class="contact-band" id="contact">
      <div class="wrap contact-inner">
        <div class="contact-copy">
          <span class="contact-kicker">Free Consultation</span>
          <h2>写信给版主</h2>
          <p>如果你想交流草药魔法、配方整理，或在草药魔法、仪式魔法的实践中遇到困惑，版主提供免费咨询。来信尽力回复。</p>
        </div>
        <div class="contact-bottom-card">
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

function contactModal() {
  if (!state.contactOpen) return "";
  return `
    <div class="contact-overlay" data-action="close-contact">
      <section class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-title">
        <button class="contact-close" data-action="close-contact" aria-label="关闭">×</button>
        <span class="contact-kicker">Free Consultation</span>
        <h2 id="contact-title">联系我们</h2>
        <p>如果你想交流草药魔法、配方整理，或在草药魔法、仪式魔法的实践中遇到困惑，版主提供免费咨询。来信尽力回复。</p>
        <div class="contact-wechat">
          <small>微信</small>
          <strong>${CONTACT_WECHAT}</strong>
        </div>
        <button class="secondary contact-copy-button" data-action="copy-contact">${state.contactCopied ? "已复制" : "复制微信号"}</button>
      </section>
    </div>
  `;
}

function recipeCard(recipe) {
  const highRisk = recipe.risk_level === "high";
  return `
    <button class="recipe-card${highRisk ? " high-risk" : ""}" data-action="open-recipe" data-id="${esc(recipe.id)}">
      <span class="recipe-type">${escDisplay(recipe.type)} · ${escDisplay(recipe.complexity)}</span>
      ${highRisk ? `<span class="risk-badge">高风险</span>` : ""}
      <strong>${escDisplay(recipe.title)}</strong>
      <small>${escDisplay(recipe.source_book)} p.${escDisplay(recipe.source_page)}</small>
      <span class="tags">${recipe.intent.slice(0, 4).map(x => `<span class="tag">${escDisplay(x)}</span>`).join("")}</span>
    </button>
  `;
}

function recipesView() {
  const list = sortedRecipes(state.recipeFilter
    ? RECIPES.filter(recipe => {
      if (state.recipeFilter.type === "type") return recipe.type === state.recipeFilter.value;
      if (state.recipeFilter.type === "intent") return (recipe.intent || []).includes(state.recipeFilter.value);
      return true;
    })
    : RECIPES);
  const title = state.recipeFilter ? state.recipeFilter.label : "配方";
  return `
    ${topbar("/ 配方")}
    <section class="wrap recipes-page">
      <div class="results-head">
        <h1>${esc(title)}</h1>
        <span class="total">${list.length} 个配方</span>
        <button class="ghost" data-action="home">← 返回首页</button>
      </div>
      <div class="recipe-grid">${list.map(recipeCard).join("")}</div>
    </section>
  `;
}

function recipeDetail() {
  const recipe = RECIPES.find(r => r.id === state.currentRecipeId) || RECIPES[0];
  if (!recipe) return recipesView();
  const highRisk = recipe.risk_level === "high";
  return `
    ${topbar("/ 配方")}
    <section class="wrap recipe-detail">
      <button class="ghost back-left" data-action="recipes">← 返回配方</button>
      <div class="recipe-hero">
        <div>
          <span class="recipe-type">${escDisplay(recipe.type)} · ${escDisplay(recipe.complexity)}</span>
          <h1>${escDisplay(recipe.title)}</h1>
          <p>${escDisplay(recipe.usage)}</p>
          <div class="tags">${recipe.intent.map(x => `<span class="tag">${escDisplay(x)}</span>`).join("")}</div>
        </div>
        <aside>
          <small>来源</small>
          <strong>${escDisplay(recipe.source_book)}</strong>
          <span>p.${escDisplay(recipe.source_page)}</span>
        </aside>
      </div>
      ${highRisk ? `<section class="risk-card"><strong>高风险资料整理</strong><p>${escDisplay(recipe.risk_note || "此条目涉及强控制、驱逐、报复、束缚、羞辱或医疗风险内容，仅作民俗资料整理；不建议直接照做，需遵守法律、伦理与现实安全边界。")}</p></section>` : ""}
      ${recipe.ritual_notice ? `<section class="ritual-notice"><strong>原书仪式提示</strong><p>${escDisplay(recipe.ritual_notice)}</p></section>` : ""}
      <div class="recipe-columns">
        <section>
          <h2>材料</h2>
          <div class="ingredient-list">${recipe.ingredients.map(item => `<div><strong>${escDisplay(item.name)}</strong><span>${escDisplay(item.amount || "")}${item.latin ? ` · ${escDisplay(item.latin)}` : ""}${item.note ? `<br>${escDisplay(item.note)}` : ""}</span></div>`).join("")}</div>
        </section>
        <section>
          <h2>做法</h2>
          <div class="steps">${recipe.method.map((step, i) => `<div><b>${i + 1}</b><span>${escDisplay(step)}</span></div>`).join("")}</div>
        </section>
      </div>
      <section class="detail-section">
        <h2>安全提示</h2>
        <p>${escDisplay(recipe.safety)}</p>
      </section>
      <section class="detail-section">
        <h2>相关草药</h2>
        <div class="chips">${recipe.relatedHerbs.map(name => {
          const herb = VISIBLE_HERBS.find(h => h.name === name || h.name.includes(name) || name.includes(h.name));
          return herb ? `<button class="chip" data-action="open" data-id="${herb.id}">${disc(herb.element, elements[herb.element] || elements["未知"])}${escDisplay(herb.name)}</button>` : `<span class="chip">${escDisplay(name)}</span>`;
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
      ${hasRecipe ? `<span class="recipe-badge">配方</span>` : ""}
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
  const title = state.filter ? state.filter.label : (state.query ? "搜索结果" : "全部草药、材料");
  return `
    ${topbar()}
    <section class="wrap">
      <div class="results-head">
        <h1>${esc(title)}</h1>
        ${state.query ? `<span class="sub">“${esc(state.query)}”</span>` : ""}
        <span class="total">${list.length} 味</span>
        <button class="ghost" data-action="home">← 返回全部</button>
      </div>
      ${list.length ? `<div class="card-grid">${list.map(card).join("")}</div>` : `<div class="empty"><strong>没有找到匹配的草药、材料</strong><span>试试别的关键词，或返回全部草药、材料</span></div>`}
    </section>
  `;
}

function nameDirectory() {
  const letters = [...new Set(VISIBLE_HERBS.map(h => h.initial))].sort();
  const current = state.initial;
  const buttons = ["all", ...letters].map(L => `
    <button class="letter ${current === L ? "active" : ""}" data-action="letter" data-letter="${L}">${L === "all" ? "全部" : L}</button>
  `).join("");
  const shown = current === "all" ? VISIBLE_HERBS : VISIBLE_HERBS.filter(h => h.initial === current);
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
  const herb = decorate(VISIBLE_HERBS.find(h => h.id === state.currentId) || VISIBLE_HERBS[0] || HERBS[0]);
  const image = imageForHerb(herb);
  const index = VISIBLE_HERBS.findIndex(h => h.id === herb.id);
  const prev = VISIBLE_HERBS[(index - 1 + VISIBLE_HERBS.length) % VISIBLE_HERBS.length];
  const next = VISIBLE_HERBS[(index + 1) % VISIBLE_HERBS.length];
  const bookUses = (herb.usage_examples || []).map(item => {
    const formula = item.formula ? ` 配方：${item.formula}` : "";
    return {
      text: cleanUseText(`${item.method || ""}${formula}`),
      source: useSource(item)
    };
  }).filter(item => item.text);
  const uses = bookUses.slice(0, 7);
  const related = VISIBLE_HERBS
    .filter(h => h.id !== herb.id && (h.powers.some(p => herb.powers.slice(0, 4).includes(p)) || h.element === herb.element))
    .slice(0, 6);
  const relatedRecipes = recipesForHerb(herb);
  const taxRows = taxonomyRows(herb);
  const bookData = bookDetailData(herb);
  const loreRef = bookData.lore ? quoteRef(bookData.loreQuote) || citeRef(bookData.source) : "";
  return `
    ${topbar("/ 草药详情")}
    <section class="wrap detail-grid">
      <aside>
        <label class="image-box ${image ? "has-image" : ""}" title="点击上传图片">
          <input class="image-input" type="file" accept="image/*" data-action="upload-image" data-id="${herb.id}">
          ${image ? `<img src="${esc(image)}" alt="${esc(herb.name)}">` : ""}
        </label>
        ${image ? imageCredit(herb) : ""}
        <div class="attr-card">
          ${herb.element && herb.element !== "未知" ? `<div class="attr-row"><small>元素</small><strong>${disc(herb.element, herb.elColor)}${esc(herb.element)}</strong></div>` : ""}
          ${herb.planet && herb.planet !== "未知" ? `<div class="attr-row"><small>行星</small><strong><span class="sym">${herb.planetSym}</span>${esc(herb.planet)}</strong></div>` : ""}
          ${herb.gender && herb.gender !== "未知" ? `<div class="attr-row"><small>极性</small><strong><span class="sym">${herb.genderSym}</span>${esc(herb.gender)}</strong></div>` : ""}
        </div>
      </aside>
      <article>
        ${herb.toxic ? `<div class="warning">☠ 此草有毒，切勿内服，仅作护符、熏香等外用法术</div>` : ""}
        <h1 class="detail-title">${esc(herb.name)}</h1>
        <span class="pinyin">${esc(englishNote(herb))}</span>
        ${herb.powers.length ? `
          <section class="detail-section core-entry">
            <h2>魔法力量</h2>
            ${herb.powers.length ? `<div class="tags">${herb.powers.map(p => `<span class="tag">${esc(p)}</span>`).join("")}</div>` : ""}
          </section>
        ` : ""}
        ${bookData.description ? `<section class="detail-section"><h2>植物描述</h2><p>${esc(bookData.description)}</p></section>` : ""}
        ${uses.length ? `<section class="detail-section"><h2>具体用法</h2>${uses.map(u => `<div class="magic-row book-source"><span>${escDisplay(u.text)}${citeRef(u.source)}</span></div>`).join("")}</section>` : ""}
        ${bookData.lore ? `<section class="detail-section book-notes"><h2>民俗 lore</h2><p>${esc(bookData.lore)}${loreRef}</p></section>` : ""}
        ${bookData.remedial ? `<section class="detail-section"><h2>传统药用</h2><p>${esc(bookData.remedial)}</p></section>` : ""}
        ${bookData.safety ? `<section class="detail-section"><h2>安全提示</h2><p>${esc(bookData.safety)}</p></section>` : ""}
        ${taxRows.length ? `<details class="detail-section fold-section"><summary>分类学</summary><div class="tax">${taxRows.map(r => `<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join("")}</div></details>` : ""}
        ${relatedRecipes.length ? `<section class="detail-section"><h2>相关配方</h2><div class="recipe-grid compact-recipes">${relatedRecipes.map(recipeCard).join("")}</div></section>` : ""}
        ${related.length ? `<section class="detail-section"><h2>相近条目</h2><div class="chips">${related.map(h => `<button class="chip" data-action="open" data-id="${h.id}">${h.element && h.element !== "未知" ? disc(h.element, elements[h.element] || elements["未知"]) : ""}${esc(h.name)}</button>`).join("")}</div></section>` : ""}
        <div class="pager">
          <button data-action="open" data-id="${prev.id}"><small>← 上一味</small><strong>${esc(prev.name)}</strong></button>
          <button data-action="open" data-id="${next.id}"><small>下一味 →</small><strong>${esc(next.name)}</strong></button>
        </div>
      </article>
    </section>
  `;
}

function render() {
  if (!VISIBLE_HERBS.length) {
    app.innerHTML = `<div class="empty"><strong>没有读取到草药数据</strong><span>请确认原始设计包仍在当前文件夹中。</span></div>`;
    return;
  }
  const backButton = viewHistory.length ? `<button class="back-float" data-action="back" aria-label="返回上一级" title="返回上一级">‹</button>` : "";
  app.innerHTML = `${backButton}${state.view === "home" ? home() : state.view === "browse" ? browse() : state.view === "name" ? nameDirectory() : state.view === "recipes" ? recipesView() : state.view === "recipeDetail" ? recipeDetail() : detail()}${contactModal()}`;
}

function updateSearch(value) {
  const wasHome = state.view === "home";
  const nextQuery = value;
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

app.addEventListener("compositionstart", event => {
  if (event.target.matches("[data-action='search']")) searchComposing = true;
});

app.addEventListener("compositionend", event => {
  if (event.target.matches("[data-action='search']")) {
    searchComposing = false;
    updateSearch(event.target.value);
  }
});

app.addEventListener("input", event => {
  if (event.target.matches("[data-action='search']")) {
    state.query = event.target.value;
    if (!searchComposing) updateSearch(event.target.value);
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
  if (state.view === "home" && state.homeSection && !event.target.closest(".gateway-expanded") && (!el || el.dataset.action === "home-section-close")) {
    state.homeSection = null;
    render();
    return;
  }
  if (!el) return;
  const action = el.dataset.action;
  if (action === "back") {
    goBack();
    return;
  }
  if (action === "home") setView({ view: "home", query: "", filter: null, recipeFilter: null, currentId: null });
  if (action === "home-section") {
    state.homeSection = el.dataset.section || "purpose";
    render();
  }
  if (action === "home-section-collapse") {
    state.homeSection = null;
    render();
  }
  if (action === "home-section-close") {
    if (event.target.closest("[data-stop-collapse]")) return;
    state.homeSection = null;
    render();
  }
  if (action === "contact") {
    state.contactOpen = true;
    state.contactCopied = false;
    render();
  }
  if (action === "close-contact") {
    if (el.classList.contains("contact-overlay") && event.target !== el) return;
    state.contactOpen = false;
    render();
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
  }
  if (action === "name") setView({ view: "name", query: "", filter: null, recipeFilter: null, initial: "all" });
  if (action === "recipes") {
    const recipeFilter = el.dataset.recipeType ? { type: el.dataset.recipeType, value: el.dataset.recipeValue, label: el.dataset.recipeLabel } : null;
    setView({ view: "recipes", query: "", filter: null, recipeFilter });
  }
  if (action === "open-recipe") setView({ view: "recipeDetail", currentRecipeId: el.dataset.id });
  if (action === "letter") setView({ initial: el.dataset.letter }, { track: false });
  if (action === "open") setView({ view: "detail", currentId: Number(el.dataset.id) });
  if (action === "filter") setView({ view: "browse", query: "", recipeFilter: null, filter: { type: el.dataset.type, value: el.dataset.value, label: el.dataset.label } });
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
