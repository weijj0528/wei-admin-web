import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { getToken, setToken, removeToken } from './auth'
import { ElMessage } from 'element-plus'

const service: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 15000
})

// 请求拦截：带 token
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截：拆 Result<T>
let refreshing = false
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== undefined && res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res.data !== undefined ? res.data : res
  },
  async (error) => {
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
    ElMessage.error(error.response?.data?.msg || error.message || '网络异常')
    return Promise.reject(error)
  }
)

export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service(config) as Promise<T>
}

export default service
