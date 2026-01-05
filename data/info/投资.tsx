import type { InfoData } from './types'

// 解析 投资.md 数据
// 按照 ## 和 ### 标题分组
export const 投资Data: InfoData = {
  categories: [
    {
      title: '科学上网工具',
      items: [
        {
          name: 'vpnnav.github.io',
          link: 'https://vpnnav.github.io',
          description: '请注意，以上工具仅供学习使用若利用这些工具从事违法犯罪行为，我们概不承担任何法律责任',
        },
      ],
    },
    {
      title: '监听聪明钱包',
      items: [
        {
          name: '@Debot',
          link: 'https://debot.ai?ref=240523',
          description: '实时自动检测各个聪明人钱包的买入和卖出情况，跟着大佬们吃肉',
        },
        {
          name: '@gmgn.ai',
          link: 'https://gmgn.ai/r/L2wVVjGF',
          description: '注于 meme 币追踪与交易辅助 的平台，通过"聪明资金"监控、链上数据分析、复制交易和风险提示等功能帮助用户发掘潜力币种',
        },
        {
          name: '@hyperbot.network',
          link: 'https://hyperbot.network?ic=0xf6E03ed6740fBCF3255F07FD1758824D1eA32a15',
          description: '一个由 AI 驱动的链上合约交易平台，聚合多个永续 DEX 的数据与执行，提供"鲸鱼追踪＋一键跟单"功能',
        },
      ],
    },
    {
      title: 'AI交易系统',
      items: [
        {
          name: '@nof1-tracker',
          link: 'https://github.com/terryso/nof1-tracker',
          description: '一个用于跟踪 nof1.ai AI Agent 交易信号并自动执行 Binance 合约交易的命令行工具。支持7个AI量化Agent的实时跟单，自动识别开仓、平仓、换仓和止盈止损信号',
        },
        {
          name: 'nofx',
          link: 'https://github.com/tinkle-community/nofx',
          description: '一个基于 DeepSeek/Qwen AI 的加密货币期货自动交易系统，支持 Binance、Hyperliquid和Aster DEX交易所，多AI模型实盘竞赛，具备完整的市场分析、AI决策、自我学习机制和专业的Web监控界面',
        },
        {
          name: '@AI-Trader',
          link: 'https://github.com/HKUDS/AI-Trader',
          description: '这个开源项目是一个"使用 AI 代理模型在纳斯达克‑100 市场进行真实或模拟交易，并对比不同模型表现"的量化交易平台',
        },
      ],
    },
    {
      title: '交易所',
      items: [
        {
          name: '币安',
          link: 'https://accounts.binance.com/zh-CN/register?ref=FANXIAN',
          description: '邀请码：FANXIAN，币安交易所(持有bnb减免40%手续费)币安最近Alpha刷积分活动，空投每个月基本都可以领上万块',
        },
        {
          name: '欧易OKX',
          link: 'https://www.okx.com/zh-hans/join/50253981',
          description: '欧易交易所(减免30%手续费)邀请码：50253981，OKX Boost(20%减免手续费)邀请码：ZHUANMI',
        },
        {
          name: 'ByBit',
          link: 'https://www.bybit.com/invite?ref=4VLKDMW',
          description: 'ByBit交易所(减免30%手续费)邀请码：4VLKDMW',
        },
        {
          name: 'Bitget',
          link: 'https://www.bitget.org/zh-CN/referral/register?clacCode=QR4A7MPY',
          description: 'Bitget交易所(减免40%手续费)邀请码：QR4A7MPY',
        },
        {
          name: 'Gate.io',
          link: 'https://www.gatesee.com/signup/VLDFUFEOAW?ref_type=103',
          description: 'Gate.io交易所(减免40%手续费)邀请码：VLDFUFEOAW',
        },
        {
          name: '火币',
          link: 'https://www.htx.com.de/zh-cn/v/register/double-invite/?invite_code=xpi6a223&inviter_id=11346560',
          description: '火币交易所(减免30%手续费)邀请码：xpi6a223',
        },
        {
          name: '抹茶',
          link: 'https://promote.mexc.com/r/wIE7fPvG',
          description: '抹茶交易所(减免40%手续费)邀请码：wIE7fPvG',
        },
        {
          name: 'Web3撸空投',
          link: 'https://t.me/tglukongtou',
          description: '致力于为您提供每日更新的加密货币空投项目信息、保姆级撸空投教程、钱包安全指南与行业动态',
        },
        {
          name: '加密货币交流群',
          link: 'https://t.me/jmhbgroup',
          description: '一起交流加密货币相关内容',
        },
      ],
    },
    {
      title: '币安Alpha查询网站',
      items: [
        {
          name: '币安Alpha空投日历',
          link: 'https://alpha123.uk/zh/index.html',
          description: '实时监控币安Alpha项目空投',
        },
        {
          name: 'Alpha稳定度查询',
          link: 'https://alpha123.uk/zh/stability/',
          description: '结合稳定度面板还有K线来刷交易量，减少被夹的风险',
        },
        {
          name: 'AlphaHub',
          link: 'https://bnalphahub.com/',
          description: '免费多钱包币安alpha交易积分查询工具',
        },
        {
          name: '胖大星-空投查询',
          link: 'https://pangdaxing.xyz/',
          description: '实时监控币安Alpha项目空投',
        },
        {
          name: 'Alpha Bot',
          link: 'https://new.alphabot.cm/',
          description: 'Alpha交易量钱包查询',
        },
        {
          name: 'Alpha.DOG',
          link: 'https://alpha.dog/',
          description: 'Alpha交易量钱包查询',
        },
        {
          name: 'BSC USDT 统计分析工具',
          link: 'https://sincitysh.github.io/bscalpha/usdt-analyzer.html',
          description: 'BSC USDT 统计分析工具',
        },
      ],
    },
    {
      title: 'Web3基础知识',
      items: [
        {
          name: '对Web3.0概念的梳理',
          link: 'https://rustmagazine.github.io/rust_magazine_2021/chapter_6/web3-part1.html',
          description: 'Web3.0 概念与发展梳理',
        },
        {
          name: 'Web3.0 Wiki',
          link: 'https://wiki.mbalib.com/zh-tw/Web_3.0',
          description: 'Web3.0 相关概念百科',
        },
        {
          name: 'Web3.0漫游指南',
          link: 'https://mirror.xyz/tannhauser2049.eth/vPrV-lqGjFpT2VWT4kDvtjhZayxm6n8ym7ra4wiegSc',
          description: 'Web3.0 学习与探索指南',
        },
        {
          name: 'Web3.0通识课',
          link: 'https://j08v3n7cqq.feishu.cn/wiki/FWvxwnoJgiyDvck6W8pc19xKnUg',
          description: 'Web3.0 基础通识课程',
        },
        {
          name: 'Crypto军火库',
          link: 'https://aiyanxishe.feishu.cn/wiki/PrGMwbJKPiz9eukV5YLcGTnwnPC',
          description: '区块链与加密技术工具资源',
        },
        {
          name: '慢雾安全团队知识库',
          link: 'https://github.com/slowmist/Knowledge-Base',
          description: '慢雾安全团队的区块链安全知识库',
        },
        {
          name: 'learn-web3',
          link: 'https://web3.career/learn-web3',
          description: '学习web3的英文资料 【推荐】',
        },
        {
          name: 'useweb3',
          link: 'https://www.useweb3.xyz/',
          description: '专为web3开发者搭建学习的平台 英文 【推荐】',
        },
      ],
    },
    // 注意：由于原文件内容非常多，这里只提取了部分主要分类
    // 实际使用时可以根据需要继续添加其他分类和项目
  ],
}
