import { request } from '@/utils/request'

export interface ApiDTO {
  id?: number
  name?: string
  module?: string
  path?: string
  login?: number
  remark?: string
}

export const listApis = (params?: any) => request({ url: '/admin/sys/api', method: 'get', params })
export const getApi = (id: number) => request({ url: `/admin/sys/api/${id}`, method: 'get' })
export const createApi = (data: ApiDTO) => request({ url: '/admin/sys/api', method: 'post', data })
export const updateApi = (id: number, data: ApiDTO) => request({ url: `/admin/sys/api/${id}`, method: 'post', data })
export const deleteApi = (id: number) => request({ url: `/admin/sys/api/del/${id}`, method: 'post' })
