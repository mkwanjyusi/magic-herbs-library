import fs from "node:fs";
import path from "node:path";

const root = path.resolve(decodeURIComponent(new URL("..", import.meta.url).pathname));
const assetDir = path.join(root, "assets", "herbs");
const sourceDir = path.join(root, "data", "image-sources");
const jsPath = path.join(root, "data", "herb-images.js");
const jsonPath = path.join(sourceDir, "herb-images.json");

fs.mkdirSync(assetDir, { recursive: true });
fs.mkdirSync(sourceDir, { recursive: true });

globalThis.window = {};
eval(fs.readFileSync(path.join(root, "data", "herbs.js"), "utf8"));
eval(fs.readFileSync(path.join(root, "data", "taxonomy.js"), "utf8"));

const herbs = window.__HERBS || [];
const taxonomy = window.__TAXONOMY || {};
const existing = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : {};
const allowedLicenses = new Set(["cc0", "cc-by", "cc-by-sa"]);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function cleanScientificName(tax) {
  return String(tax?.canonicalName || tax?.species || tax?.scientificName || "")
    .replace(/\s+\(.+?\).*$/, "")
    .trim();
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "herb";
}

function extensionFromUrl(url) {
  const clean = new URL(url).pathname.toLowerCase();
  if (clean.endsWith(".png")) return ".png";
  if (clean.endsWith(".webp")) return ".webp";
  return ".jpg";
}

async function readJson(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "LingCaoZhi biological image enrichment (local personal project)" }
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function download(url, filePath) {
  const response = await fetch(url, {
    headers: { "User-Agent": "LingCaoZhi biological image enrichment (local personal project)" }
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  fs.writeFileSync(filePath, Buffer.from(await response.arrayBuffer()));
}

function writeOutput() {
  fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2), "utf8");
  fs.writeFileSync(jsPath, `window.__HERB_IMAGES = ${JSON.stringify(existing, null, 2)};\n`, "utf8");
}

async function inaturalistImage(scientificName) {
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&rank=species,genus&per_page=8`;
  const data = await readJson(url);
  const candidates = data.results || [];
  const exact = candidates.find(item => item.name?.toLowerCase() === scientificName.toLowerCase()) || candidates[0];
  const photo = exact?.default_photo;
  if (!photo?.medium_url || !allowedLicenses.has(String(photo.license_code || "").toLowerCase())) return null;
  return {
    url: photo.medium_url,
    pageUrl: `https://www.inaturalist.org/taxa/${exact.id}`,
    source: "iNaturalist",
    title: exact.name,
    author: photo.attribution || "",
    license: photo.license_code || "",
    taxonId: exact.id
  };
}

async function commonsImage(scientificName) {
  const searchUrl = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "8",
    gsrsearch: `${scientificName} plant photo`,
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "900"
  });
  const data = await readJson(searchUrl);
  const pages = Object.values(data.query?.pages || {});
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !String(info.mime || "").startsWith("image/")) continue;
    const meta = info.extmetadata || {};
    const license = meta.LicenseShortName?.value || "";
    if (license && !/cc|public domain/i.test(license)) continue;
    return {
      url: info.thumburl,
      pageUrl: info.descriptionurl,
      source: "Wikimedia Commons",
      title: meta.ObjectName?.value || page.title?.replace(/^File:/, "") || scientificName,
      author: meta.Artist?.value?.replace(/<[^>]+>/g, "").trim() || "",
      license,
      originalUrl: info.url
    };
  }
  return null;
}

async function findImage(scientificName) {
  return await inaturalistImage(scientificName).catch(() => null)
    || await commonsImage(scientificName).catch(() => null);
}

const limit = Number(process.argv.find(arg => arg.startsWith("--limit="))?.split("=")[1] || herbs.length);
let saved = 0;
let inspected = 0;

for (const herb of herbs) {
  if (saved >= limit) break;
  if (existing[herb.name]?.src && fs.existsSync(path.join(root, existing[herb.name].src))) continue;

  const tax = taxonomy[herb.name];
  if (!tax?.scientificName || !tax.kingdom || tax.status || tax.reviewed !== true) continue;

  const scientificName = cleanScientificName(tax);
  if (!scientificName) continue;
  inspected++;

  const image = await findImage(scientificName);
  await sleep(250);
  if (!image?.url) {
    existing[herb.name] = {
      ...(existing[herb.name] || {}),
      status: "not_found",
      scientificName,
      checkedAt: new Date().toISOString()
    };
    continue;
  }

  const filename = `${String(herb.id).padStart(3, "0")}-${slug(herb.name)}-${slug(scientificName)}${extensionFromUrl(image.url)}`;
  const filePath = path.join(assetDir, filename);
  try {
    await download(image.url, filePath);
  } catch (error) {
    existing[herb.name] = {
      ...(existing[herb.name] || {}),
      status: "download_failed",
      scientificName,
      source: image.source,
      sourceUrl: image.pageUrl,
      error: String(error.message || error),
      checkedAt: new Date().toISOString()
    };
    writeOutput();
    await sleep(1200);
    continue;
  }

  existing[herb.name] = {
    src: `assets/herbs/${filename}`,
    alt: `${herb.name}（${scientificName}）真实生物照片`,
    scientificName,
    source: image.source,
    sourceUrl: image.pageUrl,
    author: image.author,
    license: image.license,
    title: image.title,
    checkedAt: new Date().toISOString()
  };
  writeOutput();
  saved++;
  console.log(`saved ${saved}: ${herb.name} <- ${image.source}`);
  await sleep(600);
}

writeOutput();
console.log(`inspected ${inspected}, saved ${saved}, total records ${Object.keys(existing).length}`);
