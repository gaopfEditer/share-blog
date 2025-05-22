---
id: docusaurus-config
slug: /docusaurus-config
title: 配置文件
authors: gaopfEditerEditer
---

## docusaurus.config.ts

`docusaurus.config.ts` 是 Docusaurus 的主要配置文件。

该文件用于配置站点的基本信息，包括：
- 站点标识（logo、站点名称、作者名称）
- 页面元素（顶部公告、导航栏、底部导航等）
- 其他自定义配置

```typescript title='docusaurus.config.ts' icon='logos:docusaurus'
const config: Config = {
  title: '长篙的小站',
  url: 'https://gaopf.top',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'gaopf',
  projectName: 'blog',
  themeConfig: {
    image: 'img/logo.png',
    metadata: [
      {
        name: 'keywords',
        content: '长篙, kuizuo, blog, javascript, typescript, node, react, vue, web, 前端, 后端',
      },
    ],
    // ...
}

export default config
```

配置文件支持添加自定义配置项，如搜索（algolia）、评论（giscus）、社交链接（socials）等。这些配置可通过 Docusaurus 内置的 hook（useThemeConfig、useDocusaurusContext）获取。

```typescript title='docusaurus.config.ts' 
  // 配置giscus
  giscus: {
      repo: 'gaopfEditer/share-blog',
      repoId: 'R_kgDOOiLTjA',
      category: 'General',
      ...
  }

  // 使用钩子获取配置参数
  const themeConfig = useThemeConfig() as ThemeConfig & { giscus: GiscusConfig }

  const giscus = { ...defaultConfig, ...themeConfig.giscus }
```

完整的配置说明请参考 [docusaurus.config.ts | Docusaurus](https://docusaurus.io/zh-CN/docs/api/docusaurus-config)。

## sidebars.js

该文件用于配置文档的侧边栏，如本博客中的[技术笔记](/docs/skill/)和[工具推荐](/docs/tools/)。侧边栏的每个项目对应一个 Markdown 文件，这些文件统一存放在 docs 目录下，便于管理。

详细说明请参考[侧边栏 | Docusaurus](https://docusaurus.io/zh-CN/docs/sidebar)。

## 相关信息

### 基本信息

修改站点名称和作者名称时，在配置文件中搜索 **长篙** 或 **kuizuo** 即可找到相关配置项。

### 关于我 页面

页面内容位于 `src/pages/about.mdx`，可根据需要进行修改。

展示技术栈时，推荐使用 [skillicons](https://skillicons.dev/) 生成技术栈图标，示例如下：

[![My Skills](https://skillicons.dev/icons?i=ts,nodejs,vue,nuxt,react,nextjs,tailwind,nestjs,prisma,postgres,redis,supabase,rust,wasm,vscode)](https://skillicons.dev)

GitHub 状态信息可使用 [GitHub Profile Summary Cards](https://github-profile-summary-cards.vercel.app/demo.html) 或 [github-stats](https://github.com/jstrieb/github-stats)。本文选择 github-stats，因其支持动画效果，但需要自行构建图片。

![](https://raw.githubusercontent.com/kuizuo/github-stats/master/generated/overview.svg#gh-light-mode-only)

![](https://raw.githubusercontent.com/kuizuo/github-stats/master/generated/languages.svg#gh-light-mode-only)

### 友链、导航、项目 页面

这三个页面通过 [plugin-content-pages](https://docusaurus.io/zh-CN/docs/api/plugins/@docusaurus/plugin-content-pages) 实现自定义功能。页面实现细节请参考[自定义页面](/docs/docusaurus-style#自定义页面)。

主要关注数据部分，数据文件位于根目录的 `/data` 文件夹下，使用 TypeScript 提供类型提示。根据类型定义组织数据，即可在对应页面中展示。

### 社交链接

在 `data/social.ts` 中修改 social 对象即可配置社交链接。

支持以下主流社交平台：

```typescript title='social.ts' icon='logos:typescript-icon'
export type Social = {
  github?: string
  twitter?: string
  juejin?: string
  qq?: string
  wx?: string
  cloudmusic?: string
  zhihu?: string
  email?: string
  discord?: string
}
```

## 其他配置

其他功能配置，如 giscus 评论、搜索、站点统计等，将在[插件](/docs/docusaurus-plugin)章节详细说明。
