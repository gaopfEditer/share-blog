<h2 align="center">
长篙的个人博客
</h2>
<p align="center">
<a href="https://vercel.com/new/clone?repository-url=https://github.com/gaopfEditer/share-blog/tree/main&project-name=blog&repo-name=blog" rel="nofollow"><img src="https://vercel.com/button"></a>
<a href="https://app.netlify.com/start/deploy?repository=https://github.com/gaopfEditer/share-blog" rel="nofollow"><img src="https://www.netlify.com/img/deploy/button.svg"></a>
<a href="https://stackblitz.com/github/gaopfEditer/share-blog" rel="nofollow"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg"></a>
</p>

## 👋 介绍

在这里我会分享各类技术栈所遇到问题与解决方案，带你了解最新的技术栈以及实际开发中如何应用，并希望我的开发经历对你有所启发。

如果你想要搭建一个类似的站点，可直接 [Fork](https://github.com/gaopfEditer/share-blog.git) 本仓库使用，或者通过 [StackBlitz](https://stackblitz.com/github/gaopfEditer/share-blog) 在线运行本项目，通过 [Vercel](https://vercel.com/new/clone?repository-url=https://github.com/gaopfEditer/share-blog/tree/main&project-name=blog&repo-name=blog) 一键部署。

## ✨ 特性

- 🦖 **Docusaurus** - 基于 Docusaurus，提供强大的文档生成和博客功能
- ✍️ **Markdown** - 写作方便，Markdown
- 🎨 **Beautiful** - 整洁，美观，阅读体验优先
- 🖥️ **PWA** - 支持 PWA，可安装，离线可用
- 🌐 **i18n** - 支持国际化
- 💯 **SEO** - 搜索引擎优化，易于收录
- 📊 **谷歌分析** - 支持 Google Analytics
- 🔎 **全文搜索** - 支持 [Algolia DocSearch](https://github.com/algolia/docsearch)
- 🚀 **持续集成** - 支持 CI/CD，自动部署更新内容
- 🏞️ **首页视图** - 显示最新博客文章、项目展示，个人特点，技术栈等
- 🗃️ **博文视图** - 不同的博文视图，列表、宫格
- 🌈 **资源导航** - 收集并分享有用、有意思的资源
- 📦 **项目展示** - 展示你的项目，可用作于作品集

## :wrench: 技术栈

- Docusaurus
- TailwindCSS
- Framer motion & magicui 

## 📊 目录结构

```bash
├── blog                           # 博客
│   ├── first-blog.md
├── docs                           # 文档/笔记
│   └── doc.md
├── data
│   ├── feature.tsx                # 特点
│   ├── friends.tsx                # 友链
│   ├── projects.tsx               # 项目
│   ├── skills.tsx                 # 技术栈
│   ├── resources.tsx              # 资源
│   └── social.ts                  # 社交链接
├── i18n                           # 国际化
├── src
│   ├── components                 # 组件
│   ├── css                        # 自定义CSS
│   ├── pages                      # 自定义页面
│   ├── plugin                     # 自定义插件
│   └── theme                      # 自定义主题组件
├── static                         # 静态资源文件
│   └── img                        # 静态图片
├── docusaurus.config.ts           # 站点的配置信息
├── sidebars.ts                    # 文档的侧边栏
├── package.json
├── tsconfig.json
└── pnpm-lock.yaml
```

## 📥 运行

```bash
git clone https://github.com/gaopfEditer/share-blog.git
cd blog
pnpm install
pnpm start
```

构建

```bash
pnpm build
```

## 📷 截图



## 📝 许可证

[MIT](./LICENSE)


后续内容计划

|模块|特点|个性化建议|
|---|---|---|
|**计划 (plan)**|目标导向、可执行|显示「进度条」「截止日期」「关联任务」；支持 checklist|
|**信息 (info)**|资讯聚合、时效强|显示「信息来源」「事件时间」「热度标签」；可嵌入 RSS 或时间线|
|**投资 (invest)**|数据驱动、风险敏感|支持嵌入图表（如价格走势）；显示「币种/标的」「持仓比例」「风险等级」|
|**运营 (operate)**|流程/指标/复盘|显示「KPI」「用户数」「转化率」；可附「SOP 流程图」|
|**杂谈 (blog)**|个人视角、自由|允许更宽松格式；支持「心情标签」「配图优先」|
|**项目 (project)**|里程碑、协作|显示「状态（进行中/暂停）」「GitHub 链接」「成员」|
|**技术 (docs/skill)**|教程/代码/深度|支持代码块高亮、可折叠段落；提供「环境要求」「依赖版本」|


事件数据模型，之后每一个分配相对的时间 产出，计划，最后落实情况等等字段，读取接口数据，按照类别给到各个日历，之后按照计划填充和修改进行记录，后续统计完成率等
近期重点在于运营搭建，运营易币需要信息（群组发车信息）
