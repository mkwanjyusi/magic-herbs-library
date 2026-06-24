import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(root, "data-src", "recipes.json");
const outputPath = path.join(root, "data", "recipes.js");

const requiredStringFields = ["id", "title", "type", "complexity", "source_book", "usage", "safety"];
const requiredArrayFields = ["intent", "ingredients", "method", "relatedHerbs"];

function fail(message) {
  console.error(`配方数据有问题：${message}`);
  process.exit(1);
}

function readRecipes() {
  if (!fs.existsSync(sourcePath)) fail(`找不到 ${path.relative(root, sourcePath)}`);
  try {
    return JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  } catch (error) {
    fail(`JSON 格式无法读取。${error.message}`);
  }
}

function validateRecipe(recipe, index, seenIds) {
  const label = recipe?.title || recipe?.id || `第 ${index + 1} 个配方`;
  if (!recipe || typeof recipe !== "object" || Array.isArray(recipe)) {
    fail(`${label} 不是一个完整对象`);
  }

  for (const field of requiredStringFields) {
    if (typeof recipe[field] !== "string" || recipe[field].trim() === "") {
      fail(`${label} 缺少 ${field}`);
    }
  }

  if (!Number.isInteger(recipe.source_page) && typeof recipe.source_page !== "string") {
    fail(`${label} 的 source_page 需要是页码数字或页码文字`);
  }

  for (const field of requiredArrayFields) {
    if (!Array.isArray(recipe[field]) || recipe[field].length === 0) {
      fail(`${label} 的 ${field} 需要至少有一项`);
    }
  }

  if (seenIds.has(recipe.id)) fail(`id 重复：${recipe.id}`);
  seenIds.add(recipe.id);

  recipe.intent.forEach((item, itemIndex) => {
    if (typeof item !== "string" || item.trim() === "") {
      fail(`${label} 的 intent 第 ${itemIndex + 1} 项为空`);
    }
  });

  recipe.ingredients.forEach((item, itemIndex) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      fail(`${label} 的 ingredients 第 ${itemIndex + 1} 项不是对象`);
    }
    if (typeof item.name !== "string" || item.name.trim() === "") {
      fail(`${label} 的 ingredients 第 ${itemIndex + 1} 项缺少 name`);
    }
  });

  recipe.method.forEach((item, itemIndex) => {
    if (typeof item !== "string" || item.trim() === "") {
      fail(`${label} 的 method 第 ${itemIndex + 1} 步为空`);
    }
  });
}

const recipes = readRecipes();
if (!Array.isArray(recipes)) fail("data-src/recipes.json 最外层需要是数组");

const seenIds = new Set();
recipes.forEach((recipe, index) => validateRecipe(recipe, index, seenIds));

fs.writeFileSync(outputPath, `window.__RECIPES = ${JSON.stringify(recipes)};\n`);
console.log(`已生成 ${path.relative(root, outputPath)}，共 ${recipes.length} 个配方。`);
