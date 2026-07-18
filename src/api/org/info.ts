import { request } from '@/utils/request'
export interface OrgInfoDTO {
  id?: number; code?: string; name?: string; remark?: string
  contact?: string; phone?: string; email?: string; address?: string
}
export const listOrgs = (params?: any) => request({ url: '/admin/org/info', method: 'get', params })
export const getOrg = (id: number) => request({ url: `/admin/org/info/${id}`, method: 'get' })
export const createOrg = (data: OrgInfoDTO) => request({ url: '/admin/org/info', method: 'post', data })
export const updateOrg = (id: number, data: OrgInfoDTO) => request({ url: `/admin/org/info/${id}`, method: 'post', data })
export const deleteOrg = (id: number) => request({ url: `/admin/org/info/del/${id}`, method: 'post' })
