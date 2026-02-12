// 简单的代理服务器，用于解决开发环境的 CORS 问题
const http = require('http')
const https = require('https')
const { URL } = require('url')

const PORT = 3001
const TARGET_URL = 'https://ffz.c.gaopf.top'

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // 构建目标 URL
  const targetUrl = `${TARGET_URL}${req.url}`
  const url = new URL(targetUrl)

  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: url.hostname,
    },
  }

  // 移除可能引起问题的请求头
  delete options.headers['host']
  delete options.headers['connection']
  delete options.headers['content-length']

  const proxyReq = https.request(options, (proxyRes) => {
    // 设置响应头
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })

    proxyRes.pipe(res)
  })

  proxyReq.on('error', (err) => {
    console.error('代理请求错误:', err)
    res.writeHead(500)
    res.end('代理服务器错误')
  })

  req.pipe(proxyReq)
})

server.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`)
  console.log(`代理目标: ${TARGET_URL}`)
  console.log(`请在代码中使用 http://localhost:${PORT}/api 作为 API 基础 URL`)
})

