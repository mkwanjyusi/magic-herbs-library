import fs from 'node:fs';
const root = '/Users/margaretk/Desktop/魔法草药/灵草志-优化版';
const raw = fs.readFileSync(`${root}/data/herbs.js`, 'utf8').trim();
globalThis.window = {};
eval(raw);
const herbs = window.__HERBS;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cleanName = name => name.replace(/【.*?】|\[.*?\]|（.*?）|\(.*?\)/g, '').replace(/叶$|花$|树$/,'').trim();
const rankMap = { kingdom: '界', phylum: '门', class: '纲', order: '目', family: '科', genus: '属', species: '种' };
const manualScientific = {
  '薄荷': 'Mentha canadensis',
  '熏衣草': 'Lavandula angustifolia',
  '薰衣草': 'Lavandula angustifolia',
  '百里香': 'Thymus vulgaris',
  '迷迭香': 'Salvia rosmarinus',
  '月桂叶': 'Laurus nobilis',
  '杜松': 'Juniperus communis',
  '大蒜': 'Allium sativum',
  '洋葱': 'Allium cepa',
  '橙': 'Citrus sinensis',
  '橙花': 'Citrus aurantium',
  '柠檬香蜂草': 'Melissa officinalis',
  '柠檬马鞭草': 'Aloysia citriodora',
  '罗马洋甘菊': 'Chamaemelum nobile',
  '百合': 'Lilium',
  '番红花': 'Crocus sativus',
  '鸢尾花': 'Iris germanica',
  '安息香': 'Styrax benzoin',
  '乳香': 'Boswellia sacra',
  '檀香': 'Santalum album',
  '雪松': 'Cedrus',
  '丁香': 'Syzygium aromaticum',
  '肉桂': 'Cinnamomum verum',
  '艾草': 'Artemisia argyi',
  '茶【不单指某一品种】': 'Camellia sinensis',
  '当归': 'Angelica sinensis',
  '白芷': 'Angelica dahurica',
  '益母草': 'Leonurus japonicus',
  '车前草': 'Plantago asiatica',
  '菖蒲': 'Acorus calamus',
  '曼陀罗': 'Datura stramonium',
  '颠茄': 'Atropa belladonna',
  '毒蝇伞': 'Amanita muscaria',
  '孜然【小茴香】': 'Cuminum cyminum',
  '小麦': 'Triticum aestivum',
  '玉米': 'Zea mays',
  '燕麦': 'Avena sativa',
  '芝麻': 'Sesamum indicum',
  '八角': 'Illicium verum',
  '草莓': 'Fragaria × ananassa',
  '樱桃': 'Prunus avium',
  '椰子': 'Cocos nucifera',
  '向日葵': 'Helianthus annuus',
  '郁金香': 'Tulipa gesneriana',
  '紫罗兰': 'Viola odorata',
  '栀子花': 'Gardenia jasminoides',
  '竹子': 'Bambusoideae',
  '榆树': 'Ulmus',
  '榛树': 'Corylus',
  '常春藤': 'Hedera helix',
  '接骨木': 'Sambucus nigra',
  '阿魏': 'Ferula assa-foetida',
  '阿拉伯胶树': 'Acacia senegal',
  '大茴香': 'Pimpinella anisum',
  '番茄': 'Solanum lycopersicum',
  '凤梨': 'Ananas comosus',
  '佛手柑': 'Citrus bergamia',
  '覆盆子': 'Rubus idaeus',
  '甘草': 'Glycyrrhiza glabra',
  '橄榄': 'Olea europaea',
  '甘蓝': 'Brassica oleracea',
  '甘蔗': 'Saccharum officinarum',
  '高良姜': 'Alpinia galanga',
  '葛缕子': 'Carum carvi',
  '广藿香': 'Pogostemon cablin',
  '桂花': 'Osmanthus fragrans',
  '海带': 'Saccharina japonica',
  '含羞草': 'Mimosa pudica',
  '合欢花': 'Albizia julibrissin',
  '黄瓜': 'Cucumis sativus',
  '茴香': 'Foeniculum vulgare',
  '姜': 'Zingiber officinale',
  '金盏菊': 'Calendula officinalis',
  '卡瓦胡椒': 'Piper methysticum',
  '开心果': 'Pistacia vera',
  '康乃馨': 'Dianthus caryophyllus',
  '辣椒': 'Capsicum annuum',
  '酪梨': 'Persea americana',
  '莲花': 'Nelumbo nucifera',
  '铃兰': 'Convallaria majalis',
  '芦荟': 'Aloe vera',
  '罗勒': 'Ocimum basilicum',
  '洛神花': 'Hibiscus sabdariffa',
  '马鞭草': 'Verbena officinalis',
  '马齿苋': 'Portulaca oleracea',
  '马铃薯': 'Solanum tuberosum',
  '马郁兰': 'Origanum majorana',
  '猫薄荷': 'Nepeta cataria',
  '玫瑰': 'Rosa',
  '茉莉': 'Jasminum sambac',
  '木瓜': 'Carica papaya',
  '奶蓟': 'Silybum marianum',
  '南瓜': 'Cucurbita pepo',
  '柠檬': 'Citrus limon',
  '牛蒡': 'Arctium lappa',
  '欧芹': 'Petroselinum crispum',
  '苹果': 'Malus domestica',
  '蒲公英': 'Taraxacum officinale',
  '芹菜': 'Apium graveolens',
  '忍冬': 'Lonicera japonica',
  '肉豆蔻': 'Myristica fragrans',
  '肉豆蔻皮': 'Myristica fragrans',
  '三色堇': 'Viola tricolor',
  '桑树': 'Morus alba',
  '山茶花': 'Camellia japonica',
  '山楂': 'Crataegus monogyna',
  '芍药': 'Paeonia lactiflora',
  '圣约翰草': 'Hypericum perforatum',
  '矢车菊': 'Centaurea cyanus',
  '石榴': 'Punica granatum',
  '莳萝': 'Anethum graveolens',
  '鼠尾草': 'Salvia officinalis',
  '水稻': 'Oryza sativa',
  '水仙': 'Narcissus tazetta',
  '松树': 'Pinus',
  '桃': 'Prunus persica',
  '桃花': 'Prunus persica',
  '甜菜': 'Beta vulgaris',
  '天竺葵': 'Pelargonium',
  '豌豆': 'Pisum sativum',
  '莴苣': 'Lactuca sativa'
};
async function wikidataScientific(name) {
  const q = encodeURIComponent(cleanName(name));
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${q}&language=zh&uselang=zh&type=item&limit=5&format=json&origin=*`;
  const search = await fetch(url, { headers: { 'User-Agent': 'LingCaoZhi taxonomy enrichment (local personal project)' } }).then(r => r.json());
  for (const hit of search.search || []) {
    const entity = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${hit.id}.json`, { headers: { 'User-Agent': 'LingCaoZhi taxonomy enrichment (local personal project)' } }).then(r => r.json()).catch(() => null);
    const claims = entity?.entities?.[hit.id]?.claims || {};
    const p225 = claims.P225?.[0]?.mainsnak?.datavalue?.value;
    if (p225) return { scientificName: p225, wikidata: hit.id, label: hit.label };
    await sleep(60);
  }
  return null;
}
async function gbifMatch(scientificName) {
  const url = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&verbose=true`;
  const data = await fetch(url, { headers: { 'User-Agent': 'LingCaoZhi taxonomy enrichment (local personal project)' } }).then(r => r.json());
  if (!data || data.matchType === 'NONE') return null;
  return data;
}
function taxFromGbif(g, sci, wikidataInfo, sourceMode) {
  return {
    scientificName: g.scientificName || sci,
    canonicalName: g.canonicalName || sci,
    rank: g.rank || '',
    kingdom: g.kingdom || '',
    phylum: g.phylum || '',
    class: g.class || '',
    order: g.order || '',
    family: g.family || '',
    genus: g.genus || '',
    species: g.species || '',
    gbifKey: g.usageKey || g.acceptedUsageKey || null,
    confidence: g.confidence ?? null,
    matchType: g.matchType || '',
    source: sourceMode,
    wikidata: wikidataInfo?.wikidata || null,
    reviewed: sourceMode === 'manual+gbif'
  };
}
const existingPath = `${root}/data/taxonomy.json`;
const existing = fs.existsSync(existingPath) ? JSON.parse(fs.readFileSync(existingPath, 'utf8')) : {};
const out = { ...existing };
let done=0, matched=0;
for (const herb of herbs) {
  let sci = manualScientific[herb.name];
  if (out[herb.name]?.scientificName && (out[herb.name]?.reviewed === true || !sci)) continue;
  let info = null;
  let sourceMode = 'wikidata+gbif';
  if (!sci) {
    info = await wikidataScientific(herb.name).catch(() => null);
    sci = info?.scientificName;
    await sleep(120);
  } else {
    sourceMode = 'manual+gbif';
  }
  if (!sci) { out[herb.name] = { status: 'unmatched', query: cleanName(herb.name) }; continue; }
  const gbif = await gbifMatch(sci).catch(() => null);
  await sleep(120);
  if (gbif) { out[herb.name] = taxFromGbif(gbif, sci, info, sourceMode); matched++; }
  else out[herb.name] = { scientificName: sci, status: 'gbif_unmatched', source: sourceMode, wikidata: info?.wikidata || null };
  done++;
  if (done % 20 === 0) console.log('processed', done, 'matched', matched);
}
fs.writeFileSync(existingPath, JSON.stringify(out, null, 2), 'utf8');
fs.writeFileSync(`${root}/data/taxonomy.js`, 'window.__TAXONOMY = '+JSON.stringify(out)+';\n', 'utf8');
console.log('taxonomy records', Object.keys(out).length, 'matched', Object.values(out).filter(x=>x.scientificName && x.kingdom).length);
