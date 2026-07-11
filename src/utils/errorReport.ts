import axios from 'axios'
import { getToken } from './auth'

/**
 * 前端异常上报（评审补强 CRITICAL 2：前端可观测）
 *
 * 使用独立的 axios 实例，不走业务请求拦截器：
 * - 避免上报失败又触发响应拦截器里的 reportError -> 无限重试
 * - 避免上报请求触发 401 刷新 / 登录跳转 / 平台切换取消等业务副作用
 * 后端 POST /admin/operationLog/report（已在 open-apis 白名单，无需鉴权）。
 */
const reporter = axios.create({
  baseURL: '/',
  timeout: 8000
})

// 仅附带 token（若已登录），便于后端记录操作人；endpoint 本身不鉴权
reporter.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
    config.headers['token'] = token
  }
  return config
})

export function reportError(type: string, message: string, detail?: string) {
  // 静默上报，不影响业务；失败即丢弃，绝不重试
  reporter({
    url: '/admin/operationLog/report',
    method: 'post',
    data: {
      operation: `[前端-${type}] ${message}`,
      method: detail || '',
      status: 1,
      errorMsg: detail
    }
  }).catch(() => {})
}
