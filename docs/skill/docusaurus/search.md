---
id: docusaurus-search
slug: /docusaurus-search
title: 搜索
authors: gaopfEditerEditer
---

> [搜索 | Docusaurus](https://docusaurus.io/zh-CN/docs/search)

## [algolia](https://www.algolia.com/)

Algolia 提供两种配置方案：

1. 使用 Docsearch（基于 [Algolia Crawler](https://crawler.algolia.com/)）每周自动爬取网站内容。**该方案仅适用于开源项目，否则需付费**。优势在于无需额外配置，但申请流程较为繁琐（本博客采用此方案）。

2. 自行运行 DocSearch 爬虫，可随时进行爬取。需要自行注册账号并搭建爬虫环境，或使用 Github Actions 进行爬取。

### 方案1

Algolia DocSearch 的申请流程在官方文档中有详细说明。主要难点在于申请过程需要等待邮件回复并进行确认。免费托管的 DocSearch 服务条件较为严格，但申请成功后基本可以长期使用，推荐采用此方案。申请成功后可在 [Crawler Admin Console](https://crawler.algolia.com/admin/crawlers) 查看。

将获取的 algolia 配置信息（appId、apiKey、indexName）填入 `docusaurus.config.ts`：

```javascript title='docusaurus.config.ts'
algolia: {
  appId: 'GNK52KBP4N',
  apiKey: '8aa26248bf297d7cd910c9b248c9b77e',
  indexName: 'gaopf',
}
```

爬取完成后会通过邮件通知。

### 方案2

[Run your own | DocSearch (algolia.com)](https://docsearch.algolia.com/docs/run-your-own)

由于方案1申请难度较大，成功率较低，建议采用方案2。

首先注册 [Algolia](https://www.algolia.com/) 账号，在左侧 indices 创建索引，在 API Keys 中获取 Application ID 和 API Key（注意区分两种 API KEY）。

![image-20210821230135749](https://img.gaopf.top/LightPicture/2025/05/4786e20b0c902179.jpg)

![image-20210821230232837](https://img.gaopf.top/LightPicture/2025/05/35f2cf8370cf8daf.jpg)

在 `docusaurus.config.ts` 中填入 **Search-Only API Key**：

```js
themeConfig: {
    algolia: {
      apiKey: "xxxxxxxxxxx",
      appId: "xxxxxxxxxxx",
      indexName: "kuizuo",
    },
}
```

本文使用 Linux 系统，在 Docker 环境下运行爬虫。首先需要 [安装 jq](https://github.com/stedolan/jq/wiki/Installation#zero-install)，本文使用 0install 进行安装（安装过程可能较慢）。安装完成后可通过以下命令验证：

```
[root@kzserver gaopf.top]# jq --version
jq-1.6
```

在任意目录创建 `.env` 文件，填入对应的 APPID 和 API KEY（使用 `Admin API Key`）：

```js
APPLICATION_ID = YOUR_APP_ID
API_KEY = YOUR_API_KEY
```

在项目目录下创建 `docsearch.json` 文件，参考以下内容（替换高亮部分为您的网站信息）：

```json title='docsearch.json' {2-4}
{
  "index_name": "xxxx",
  "start_urls": ["https://example.com"],
  "sitemap_urls": ["https://example.com"],
  "selectors": {
    "lvl0": {
      "selector": "(//ul[contains(@class,'menu__list')]//a[contains(@class, 'menu__link menu__link--sublist menu__link--active')]/text() | //nav[contains(@class, 'navbar')]//a[contains(@class, 'navbar__link--active')]/text())[last()]",
      "type": "xpath",
      "global": true,
      "default_value": "Documentation"
    },
    "lvl1": "header h1, article h1",
    "lvl2": "article h2",
    "lvl3": "article h3",
    "lvl4": "article h4",
    "lvl5": "article h5, article td:first-child",
    "lvl6": "article h6",
    "text": "article p, article li, article td:last-child"
  },
  "custom_settings": {
    "attributesForFaceting": ["type", "lang", "language", "version", "docusaurus_tag"],
    "attributesToRetrieve": ["hierarchy", "content", "anchor", "url", "url_without_anchor", "type"],
    "attributesToHighlight": ["hierarchy", "content"],
    "attributesToSnippet": ["content:10"],
    "camelCaseAttributes": ["hierarchy", "content"],
    "searchableAttributes": [
      "unordered(hierarchy.lvl0)",
      "unordered(hierarchy.lvl1)",
      "unordered(hierarchy.lvl2)",
      "unordered(hierarchy.lvl3)",
      "unordered(hierarchy.lvl4)",
      "unordered(hierarchy.lvl5)",
      "unordered(hierarchy.lvl6)",
      "content"
    ],
    "distinct": true,
    "attributeForDistinct": "url",
    "customRanking": ["desc(weight.pageRank)", "desc(weight.level)", "asc(weight.position)"],
    "ranking": ["words", "filters", "typo", "attribute", "proximity", "exact", "custom"],
    "highlightPreTag": "<span class='algolia-docsearch-suggestion--highlight'>",
    "highlightPostTag": "</span>",
    "minWordSizefor1Typo": 3,
    "minWordSizefor2Typos": 7,
    "allowTyposOnNumericTokens": false,
    "minProximity": 1,
    "ignorePlurals": true,
    "advancedSyntax": true,
    "attributeCriteriaComputedByMinProximity": true,
    "removeWordsIfNoResults": "allOptional",
    "separatorsToIndex": "_",
    "synonyms": [
      ["js", "javascript"],
      ["ts", "typescript"]
    ]
  }
}
```

运行 docker 命令：

```bash
docker run -it --env-file=.env -e "CONFIG=$(cat docsearch.json | jq -r tostring)" algolia/docsearch-scraper
```

等待容器运行完成，爬取网站内容。在 algolia 控制台看到如下页面表示成功：

![image-20210821225934002](https://img.gaopf.top/image-20210821225934002.png)

为确保项目部署成功后才触发爬虫，如果使用 vercel 部署，可参考以下触发条件：

```yaml title='.github/workflows/docsearch.yml'
name: docsearch

on: deployment

jobs:
  algolia:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Get the content of docsearch.json as config
        id: algolia_config
        run: echo "::set-output name=config::$(cat docsearch.json | jq -r tostring)"

      - name: Run algolia/docsearch-scraper image
        env:
          ALGOLIA_APP_ID: ${{ secrets.ALGOLIA_APP_ID }}
          ALGOLIA_API_KEY: ${{ secrets.ALGOLIA_API_KEY }}
          CONFIG: ${{ steps.algolia_config.outputs.config }}
        run: |
          docker run \
            --env APPLICATION_ID=${ALGOLIA_APP_ID} \
            --env API_KEY=${ALGOLIA_API_KEY} \
            --env "CONFIG=${CONFIG}" \
            algolia/docsearch-scraper
```

在 Github 仓库中添加 [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)，提交代码后即可触发爬虫规则。

## [orama](https://docs.oramasearch.com/open-source/plugins/plugin-docusaurus)

由于 Algolia 配置过程较为复杂，可在 docusaurus 中集成 [orama](https://docs.oramasearch.com/open-source/plugins/plugin-docusaurus)。这是一个支持在浏览器、服务器和边缘运行全文、矢量和混合搜索查询的服务。效果如下：

![](https://img.gaopf.top/2024/0118082834-202401180828818.png)

## 本地搜索

如果认为 Algolia 申请流程过于繁琐，docusaurus 也提供本地搜索功能，但搜索效果可能不如全文搜索。

本地搜索插件：[docusaurus-search-local](https://github.com/cmfcmf/docusaurus-search-local)
