# TradingView 布林带插针预警 API 配置指南

## 功能说明

脚本已支持在检测到插针形态时触发警报，可通过 TradingView 的警报系统调用外部 API。

## 快速配置（针对本地服务器）

### 1. 在脚本中启用警报

- **启用警报**：在脚本设置中开启"启用警报"
- **实时K线警报**：在当前图表时间框架检测到插针时触发（推荐开启）
- **多时间框架警报**：在其他配置的时间框架检测到插针时触发

### 2. 在 TradingView 中创建警报

1. 在图表上右键点击 → 选择"创建警报"
2. 在警报设置中：
   - **条件**：选择脚本名称（"布林带插针标记 - 多时间框架"）
   - **警报**：选择"上插针预警"或"下插针预警"（可以创建两个警报分别处理）
   - **频率**：建议选择"每次警报"（Once Per Bar Close）
   - **Webhook URL**：填写你的服务器地址

### 3. Webhook URL 配置

**本地服务器配置：**
```
http://localhost:3123/api/tradingview/receive
```

**注意**：TradingView 要求 Webhook URL 必须是 HTTPS，但本地开发可以使用：
- 使用内网穿透工具（如 ngrok、localtunnel）将本地服务暴露为 HTTPS
- 或者使用云服务器部署

**使用 ngrok 暴露本地服务：**
```bash
# 安装 ngrok
# 运行本地服务器后，执行：
ngrok http 3123

# 会得到一个类似 https://xxxx.ngrok.io 的地址
# 在 TradingView 中使用这个地址
```

### 4. API 接收的数据格式

TradingView 会发送 POST 请求，包含以下信息：

**请求头：**
- `Content-Type: application/json`

**请求体格式（TradingView 标准格式）：**
```json
{
  "ticker": "BTCUSDT",
  "time": "2024-01-15T10:30:00Z",
  "close": 45000.5,
  "message": "BTCUSDT 上插针 | 2024-01-15T10:30:00Z | 价格:45000.5 | 15M@45100+1H@45200"
}
```

**或者可能包含更多字段：**
```json
{
  "ticker": "{{ticker}}",
  "time": "{{time}}",
  "close": {{close}},
  "message": "{{message}}"
}
```

### 5. 警报消息格式

- **上插针**：`{{ticker}} 上插针 | {{time}} | 价格:{{close}} | 15M@45100+1H@45200`
- **下插针**：`{{ticker}} 下插针 | {{time}} | 价格:{{close}} | 15M@44000+1H@43800`

消息中包含：
- 交易对名称
- 检测时间
- 当前价格
- 检测到插针的时间框架和价格（多个用+连接）

### 6. 服务器端 API 示例（Node.js - 匹配你的服务器格式）

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/tradingview/receive', (req, res) => {
  const { ticker, time, close, message } = req.body;
  
  console.log('收到插针预警:', {
    ticker,
    time,
    close,
    message
  });
  
  // 解析消息获取详细信息
  // message 格式: "BTCUSDT 上插针 | 2024-01-15T10:30:00Z | 价格:45000.5 | 15M@45100+1H@45200"
  
  // 这里可以：
  // 1. 保存到数据库
  // 2. 发送通知（邮件、短信、Telegram等）
  // 3. 触发交易逻辑
  // 4. 发送到其他系统
  
  // 返回匹配你服务器格式的响应
  res.status(200).json({
    success: true,
    message: "TradingView消息已接收并记录",
    data: {
      id: Date.now(), // 或从数据库获取
      ticker: ticker,
      time: time,
      close: close,
      created_at: new Date().toISOString()
    }
  });
});

app.listen(3123, () => {
  console.log('Webhook服务器运行在端口 3123');
  console.log('访问地址: http://localhost:3123/api/tradingview/receive');
});
```

### 7. 服务器端 API 示例（Python Flask）

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook/tradingview', methods=['POST'])
def webhook():
    data = request.json
    
    ticker = data.get('ticker')
    time = data.get('time')
    close = data.get('close')
    message = data.get('message')
    
    print(f'收到插针预警: {ticker} @ {time} | 价格: {close}')
    print(f'详细信息: {message}')
    
    # 这里可以处理预警逻辑
    # 发送通知、记录日志等
    
    return jsonify({'success': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```

## 注意事项

1. **Webhook URL 必须是 HTTPS**（TradingView 要求）
2. **API 需要快速响应**（建议 200ms 内返回）
3. **建议添加身份验证**（API Key 或签名验证）
4. **处理重复警报**（同一根K线可能触发多次）

## 安全建议

1. 在 API 中添加签名验证
2. 限制请求频率
3. 验证请求来源 IP
4. 使用环境变量存储敏感信息

