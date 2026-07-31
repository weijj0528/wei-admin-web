import { request } from '@/utils/request'

export interface ApiDTO {
  id?: number
  name?: string
  module?: string
  path?: string
  login?: number
  remark?: string
}

/** 注册结果详情条目 */
export interface RegisterDetail {
  path: string | null
  method: string | null
  action: 'INSERT' | 'UPDATE' | 'SKIP'
}

/** 注册结果 */
export interface RegisterResult {
  inserted: number
  updated: number
  skipped: number
  details: RegisterDetail[]
}

export const listApis = (params?: any) => request({ url: '/admin/sys/api', method: 'get', params })
export const getApi = (id: number) => request({ url: `/admin/sys/api/${id}`, method: 'get' })
export const createApi = (data: ApiDTO) => request({ url: '/admin/sys/api', method: 'post', data })
export const updateApi = (id: number, data: ApiDTO) => request({ url: `/admin/sys/api/${id}`, method: 'post', data })
export const deleteApi = (id: number) => request({ url: `/admin/sys/api/del/${id}`, method: 'post' })

/** 扫描并注册所有 /admin/** 写接口（仅超管）。 */
export const scanApis = (force = false) =>
  request<RegisterResult>({ url: '/admin/sys/api/scan', method: 'post', params: { force } })

/** 手动注册 API 列表（仅超管）。DTO 中 path 使用 "METHOD:/route" 格式。 */
export const registerApis = (apis: ApiDTO[], force = false) =>
  request<RegisterResult>({ url: '/admin/sys/api/register', method: 'post', params: { force }, data: apis })
