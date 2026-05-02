# TradingView Webhook 本地服务器配置指南

## 快速开始

### 1. 使用 ngrok 暴露本地服务（推荐）

由于 TradingView 要求 Webhook URL 必须是 HTTPS，本地开发需要使用内网穿透工具。

#### 安装 ngrok

```bash
# macOS
brew install ngrok

# 或从官网下载: https://ngrok.com/download
```

#### 启动本地服务器

确保你的服务器运行在 `http://localhost:3123`

#### 暴露本地服务

```bash
ngrok http 3123
```

你会得到一个类似这样的 HTTPS 地址：
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3123
```

#### 在 TradingView 中配置

1. 右键图表 → "创建警报"
2. **条件**：选择"布林带插针标记 - 多时间框架"
3. **警报**：选择"上插针预警"或"下插针预警"
4. **Webhook URL**：填写 `https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/tradingview/receive`
5. **频率**：选择"每次警报"（Once Per Bar Close）

### 2. 服务器端代码示例（已匹配你的格式）

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// 处理 TradingView Webhook
app.post('/api/tradingview/receive', (req, res) => {
  try {
    // TradingView 发送的数据格式
    const { ticker, time, close, message } = req.body;
    
    console.log('收到 TradingView 预警:', {
      ticker,
      time,
      close,
      message
    });
    
    // 解析消息获取详细信息
    // message 可能包含: "BTCUSDT 上插针 | 2024-01-15T10:30:00Z | 价格:45000.5 | 15M@45100+1H@45200"
    
    // 提取时间框架信息
    const tfMatch = message.match(/\| (.+)$/);
    const timeframes = tfMatch ? tfMatch[1] : '';
    
    // 保存到数据库或处理逻辑
    // ...
    
    // 返回响应（匹配你的服务器格式）
    res.status(200).json({
      success: true,
      message: "TradingView消息已接收并记录",
      data: {
        id: Date.now(), // 或从数据库获取自增ID
        ticker: ticker || 'UNKNOWN',
        time: time || new Date().toISOString(),
        close: close || 0,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('处理 TradingView Webhook 错误:', error);
    res.status(500).json({
      success: false,
      message: "处理消息时出错",
      error: error.message
    });
  }
});

app.listen(3123, () => {
  console.log('✅ Webhook服务器运行在端口 3123');
  console.log('📍 访问地址: http://localhost:3123/api/tradingview/receive');
  console.log('🔗 使用 ngrok 暴露后，在 TradingView 中配置 Webhook URL');
});
```

### 3. 测试 Webhook

使用 curl 测试：

```bash
curl -X POST http://localhost:3123/api/tradingview/receive \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "BTCUSDT",
    "time": "2024-01-15T10:30:00Z",
    "close": 45000.5,
    "message": "BTCUSDT 上插针 | 2024-01-15T10:30:00Z | 价格:45000.5 | 15M@45100"
  }'
```

### 4. 完整配置流程

1. ✅ 启动本地服务器（端口 3123）
2. ✅ 运行 ngrok 暴露服务
3. ✅ 在 TradingView 中创建警报，配置 Webhook URL
4. ✅ 在脚本中启用警报功能
5. ✅ 等待插针信号触发警报

### 5. 注意事项

- **HTTPS 要求**：TradingView 要求 Webhook 必须是 HTTPS，本地开发必须使用 ngrok 等工具
- **响应时间**：服务器应在 200ms 内响应，否则 TradingView 会重试
- **错误处理**：确保服务器有完善的错误处理，避免返回 500 错误
- **日志记录**：建议记录所有接收到的警报，便于调试和分析

### 6. 生产环境部署

生产环境建议：
- 使用云服务器（如 AWS、阿里云等）
- 配置 SSL 证书（Let's Encrypt 免费）
- 使用域名访问
- 添加身份验证（API Key）
- 设置请求频率限制

