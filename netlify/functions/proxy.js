// Netlify Function 处理 API 代理请求
// 路径: /api/proxy/[type]/[path]
// 数据源: shared/proxyTargets.js（唯一真相）

import { PROXY_TARGETS, COMMON_HEADERS } from '../../shared/proxyTargets.js'

// 构建运行时查找表（排除 devOnly 条目）
const proxyTargets = {}
for (const [key, cfg] of Object.entries(PROXY_TARGETS)) {
  if (!cfg.devOnly) {
    proxyTargets[key] = cfg
  }
}

export async function handler(event, context) {
  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Forwarded-Cookie',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    }
  }

  // 从路径中提取代理类型和路径
  let path = event.path
  console.log('[Proxy] 原始路径:', path)
  console.log('[Proxy] 查询参数:', JSON.stringify(event.queryStringParameters))
  
  // 移除 /.netlify/functions/proxy 前缀
  if (path.startsWith('/.netlify/functions/proxy')) {
    path = path.replace(/^\/\.netlify\/functions\/proxy\/?/, '')
  }
  // 移除 /api/proxy 前缀（如果存在）
  if (path.startsWith('/api/proxy')) {
    path = path.replace(/^\/api\/proxy\/?/, '')
  }
  path = path.replace(/^\//, '')
  const pathParts = path.split('/').filter(Boolean)
  
  console.log('[Proxy] 解析后的路径部分:', pathParts)
  
  if (pathParts.length === 0) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Invalid proxy path',
        message: 'Path format: /api/proxy/[type]/[path]',
      }),
    }
  }

  const proxyType = pathParts[0]
  
  // 处理路径和查询参数
  let targetPath = '/' + pathParts.slice(1).join('/')
  let queryString = ''
  
  const pathQueryIndex = targetPath.indexOf('?')
  if (pathQueryIndex !== -1) {
    queryString = targetPath.substring(pathQueryIndex)
    targetPath = targetPath.substring(0, pathQueryIndex)
  }
  
  if (!queryString) {
    if (event.rawQuery) {
      queryString = '?' + event.rawQuery
    } else if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(event.queryStringParameters)) {
        if (value) {
          params.append(key, value)
        }
      }
      queryString = '?' + params.toString()
    }
  }
  
  console.log('[Proxy] 最终路径:', targetPath)
  console.log('[Proxy] 最终查询字符串:', queryString)

  if (!proxyType || !proxyTargets[proxyType]) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Invalid proxy type',
        available: Object.keys(proxyTargets),
        received: proxyType,
      }),
    }
  }

  const config = proxyTargets[proxyType]
  const targetUrl = config.target + targetPath + queryString

  console.log('[Proxy] 代理配置:', {
    proxyType,
    target: config.target,
    targetPath,
    queryString,
    finalUrl: targetUrl,
  })

  try {
    // 构建请求头
    const headers = {
      ...COMMON_HEADERS,
      ...(config.headers || {}),
    }

    // 复制原始请求的某些头
    const forwardHeaders = ['content-type', 'accept', 'accept-language', 'secret']
    for (const header of forwardHeaders) {
      const value = event.headers[header] || event.headers[header.toLowerCase()]
      if (value) {
        headers[header] = value
      }
    }

    // 处理 Cookie
    if (event.headers['x-forwarded-cookie']) {
      headers['cookie'] = event.headers['x-forwarded-cookie']
    }

    // 获取请求体
    let body = null
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' && event.body) {
      body = event.body
    }

    // 发送代理请求
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers,
      body: body || undefined,
    })

    // 读取响应内容
    const responseText = await response.text()
    
    console.log('[Proxy] 响应状态:', response.status)
    console.log('[Proxy] 响应 Content-Type:', response.headers.get('content-type'))
    console.log('[Proxy] 响应内容长度:', responseText.length)

    // 检查是否是 HTML 响应
    const isHtml = responseText.trim().startsWith('<!doctype') || 
        responseText.trim().startsWith('<!DOCTYPE') || 
        responseText.trim().startsWith('<html')

    if (isHtml && !config.allowHtml) {
      // 该目标不应返回 HTML，记录错误
      console.error('[Proxy Error] 收到意外 HTML 响应:', targetUrl, '状态码:', response.status)
      console.error('[Proxy Error] HTML 内容预览:', responseText.substring(0, 500))
      return {
        statusCode: response.status || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Proxy returned HTML error page',
          status: response.status,
          url: targetUrl,
          message: 'The proxy server returned an HTML error page instead of the expected response',
          htmlPreview: responseText.substring(0, 500),
        }),
      }
    }

    // 设置响应头
    const responseHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Forwarded-Cookie',
    }

    const contentType = response.headers.get('content-type')
    if (contentType) {
      responseHeaders['Content-Type'] = contentType
    }

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseText,
    }
  } catch (error) {
    console.error('[Proxy Error] 代理请求异常:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Proxy request failed',
        message: error.message,
        url: targetUrl,
      }),
    }
  }
}
