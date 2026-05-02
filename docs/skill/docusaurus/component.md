---
id: docusaurus-component
slug: /docusaurus-component
title: 自定义组件
authors: gaopfEditerEditer
description: 介绍如何自定义 docusaurus 组件
---

Docusaurus 初始化项目时已包含预设组件，如博客布局、标签页、归档页等。如需调整组件样式或增加功能，可使用 [Swizzle](https://docusaurus.io/zh-CN/docs/swizzling) 功能。

## 主题组件

Docusaurus 的主题组件位于 **@docusaurus/theme-classic/theme** 目录下。如需覆盖组件，可在 src/theme 目录下创建对应的文件结构。

示例目录结构：

```
website
├── node_modules
│   └── @docusaurus/theme-classic
│       └── theme
│           └── Navbar.js
└── src
    └── theme
        └── Navbar.js
```

当导入 `@theme/Navbar` 时，系统会优先加载 `website/src/theme/Navbar.js`。

关于*分层架构*的详细信息，请参考[客户端架构 | Docusaurus](https://docusaurus.io/zh-CN/docs/advanced/client)。

## swizzle 组件

查看 `@docusaurus/theme-classic` 所有组件的概览，可执行：

```bash
npm run swizzle @docusaurus/theme-classic -- --list
```

以归档页为例，官方组件为 `theme/BlogArchivePage`。

自定义组件有两种方式：[弹出组件](https://docusaurus.io/zh-CN/docs/swizzling#ejecting)或[包装组件](https://docusaurus.io/zh-CN/docs/swizzling#wrapping)。

使用弹出组件方式，执行以下[命令](https://docusaurus.io/zh-CN/docs/cli#docusaurus-swizzle)：

```bash
npm run swizzle @docusaurus/theme-classic BlogArchivePage -- --eject --typescript
```

该命令将创建 `src/theme/BlogArchivePage/index.tsx`，即归档页面的代码。您可以根据需求修改代码，实现所需的样式和功能。

注意：此命令仅获取 index.tsx 文件，可能还存在子组件。建议在 `node_modules/@docusaurus/theme-classic/src/theme` 中找到组件所在文件夹，将整个文件夹复制到 `src/theme` 目录下。这样可以获得完整的 TypeScript 源文件，便于进行更深入的个性化定制。

:::warning

使用自定义组件时需注意潜在**风险**。特别是在升级 Docusaurus 版本时可能遇到困难，因为组件接收的属性或内部使用的主题 API 可能发生变化，导致页面渲染失败。

例如，在升级到 Docusaurus 2.0.0 正式版时，由于 [plugin-content-blog](https://docusaurus.io/zh-CN/docs/api/plugins/@docusaurus/plugin-content-blog) 传递给组件的数据结构发生变化，导致数据解析失败，页面无法正常渲染。

:::

虽然不升级依赖可以避免这些问题，但新版本的功能特性可能具有吸引力。因此，在自定义组件后，升级依赖时可能需要维护代码。建议重新 swizzle 最新版本的文件，对比变化，排查并解决问题。
