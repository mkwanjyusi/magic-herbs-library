# 配方录入说明

配方的可读源文件在 `data-src/recipes.json`。网站实际读取的是 `data/recipes.js`，请在新增或修改配方后运行：

```bash
node tools/build-recipes.mjs
```

## 新增一条配方

1. 打开 `data-src/recipe-template.json`。
2. 复制整段对象。
3. 粘贴到 `data-src/recipes.json` 数组的末尾，注意上一条配方后面要有英文逗号。
4. 修改字段内容。
5. 运行 `node tools/build-recipes.mjs`。

## 字段含义

- `id`：唯一英文编号，用小写字母、数字和连字符，例如 `powder-road-opening`。
- `title`：页面显示的中文配方名。
- `type`：配方形式，例如 `魔法粉`、`薰香`、`香包 / 护身符`。
- `complexity`：简短分类，例如 `复方粉`、`复方薰香`。
- `source_book`：来源书名。
- `source_page`：来源页码。
- `intent`：用途标签，会用于配方分类。
- `ingredients`：材料列表，`name` 必填，`amount`、`latin`、`note` 可按需要填写。
- `method`：步骤列表。
- `usage`：一句话用途说明。
- `safety`：安全提示。
- `relatedHerbs`：和草药条目关联的名称，名称越接近草药库里的中文名，越容易自动连到草药详情。
