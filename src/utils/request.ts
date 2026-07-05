import axios, { type AxiosInstance, type AxiosRequestConfig, type CancelTokenSource } from 'axios'
import { getToken, setToken, removeToken } from './auth'
import { ElMessage } from 'element-plus'
import { reportError } from './errorReport'

const service: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 15000
})

// 请求取消（评审补强 WARNING 1：平台切换并发处理）
const pendingSources = new Set<CancelTokenSource>()
export function cancelAllPendingRequests() {
  pendingSources.forEach((source) => source.cancel('cancelled by platform switch'))
  pendingSources.clear()
}

// 请求拦截：带 token + 追踪取消
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }
    // 追踪请求以便切换平台时取消
    const source = axios.CancelToken.source()
    config.cancelToken = source.token
    pendingSources.add(source)
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截：拆 Result<T> + 错误上报
let refreshing = false
service.interceptors.response.use(
  (response) => {
    // 清理已完成的 cancel source
    const source = (response.config as any).__cancelSource
    if (source) pendingSources.delete(source)
    const res = response.data
    if (res.code !== undefined && res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      reportError('api', `${response.config.url} → ${res.msg}`, JSON.stringify(res))
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res.data !== undefined ? res.data : res
  },
  async (error) => {
    // 被取消的请求静默处理
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }
    const status = error.response?.status
    if (status === 401 && !refreshing) {
      refreshing = true
      try {
        const { refreshToken } = await import('@/api/auth')
        const newToken = await refreshToken()
        setToken(newToken)
        error.config.headers['token'] = newToken
        return service(error.config)
      } catch (e) {
        removeToken()
        window.location.href = '/login'
      } finally {
        refreshing = false
      }
    }
    const msg = error.response?.data?.msg || error.message || '网络异常'
    ElMessage.error(msg)
    // 上报网络错误（评审补强 CRITICAL 2：前端可观测）
    reportError('api-error', `${error.config?.url} → ${status || 'network'} ${msg}`, error.stack)
    return Promise.reject(error)
  }
)

export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service(config) as Promise<T>
}

export default service
