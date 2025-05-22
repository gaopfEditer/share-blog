---
id: docusaurus-deploy
slug: /docusaurus-deploy
title: 部署
authors: gaopfEditerEditer
---

本文档介绍 Docusaurus 博客的部署方案。之前采用 [Vercel](https://vercel.com) 进行部署，无需额外配置，便于专注于内容创作。相关部署经验可参考文章 [Vercel 部署个人博客](/blog/vercel-deploy-blog)。

由于 `vercel.app` 域名受到 DNS 污染，导致国内访问受限。虽然可以通过自定义域名解析到 Vercel 实现访问，但受限于 DNS 解析速度，国内访问体验会受到影响。

为提升访问体验，本文采用国内外差异化解析方案：

1. 在 DNS 配置中，针对境内和境外分别设置不同的记录值
2. 境内访问使用国内 CDN 服务
3. 境外访问使用 Vercel CDN

通过 [Ping.cn:网站测速-ping 检测](https://www.ping.cn/) 可以测试站点访问速度。测试结果可通过 [gaopf.top 在全国各地区网络速度测试情况-Ping.cn](https://www.ping.cn/http/gaopf.top) 在线查看。

![image-20221204161146327](https://img.gaopf.top/LightPicture/2025/05/e2b2498d8bb123cd.jpg)

## 持续集成

Vercel 支持自动拉取仓库代码并完成构建部署，通常无需额外配置。

对于代码仓库（GitHub）的提交，需要借助 CI 服务完成构建任务。本文使用 [Github Action](https://github.com/marketplace) 进行构建，构建记录可在 [Actions · gaopfEditer/share-blog](https://github.com/gaopfEditer/share-blog/actions) 查看。配置文件如下：

```yaml title='.github/workflows/ci.yml' icon='logos:github-actions'
name: CI

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest] # macos-latest, windows-latest
        node: [18]

    steps:
      - uses: actions/checkout@v4

      - name: Set node version to ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: corepack enable

      - name: Setup
        run: npm i -g @antfu/ni

      - name: Install
        run: nci

      - name: Build
        run: nr build

      - name: SSH Deploy
        uses: easingthemes/ssh-deploy@v4.1.10
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: '-avzr --delete'
          SOURCE: 'build'
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: 'root'
          TARGET: '/opt/1panel/apps/openresty/openresty/www/sites/gaopf.top/index'
```

CI 服务将构建产物通过 rsync 同步到服务器，完成部署流程。

配置完成后，只需将代码推送到远程仓库，Github Action 与 Vercel 将自动执行各自任务。等待片刻后，访问站点即可看到更新内容。

## 无域名和服务器部署方案

对于没有域名或服务器的用户，推荐使用 [Netlify](https://www.netlify.com/) 服务，可通过 netlify 提供的二级域名（如 kuizuo-blog.netlify.app）访问。

建议申请个人域名，通过 Vercel 的自定义域名功能进行访问。由于域名解析指向非大陆服务器（Vercel 服务器位于境外），因此无需进行备案。
