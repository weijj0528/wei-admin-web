import { request } from '@/utils/request'

export interface TenantDTO {
  id?: number
  code?: string
  name?: string
  platform?: string
  remark?: string
  adminUser?: number
  adminName?: string
  adminPwd?: string
  status?: number
}

export interface TenantAdminDTO {
  id: number
  adminUser?: number
  adminName?: string
  adminPwd?: string
  name?: string
}

export const listTenants = (params?: any) => request({ url: '/admin/sys/tenant', method: 'get', params })
export const getTenant = (id: number) => request({ url: `/admin/sys/tenant/${id}`, method: 'get' })
export const createTenant = (data: TenantDTO) => request({ url: '/admin/sys/tenant', method: 'post', data })
export const updateTenant = (id: number, data: TenantDTO) => request({ url: `/admin/sys/tenant/${id}`, method: 'post', data })
export const deleteTenant = (id: number) => request({ url: `/admin/sys/tenant/del/${id}`, method: 'post' })
export const enableTenant = (id: number) => request({ url: `/admin/sys/tenant/enable/${id}`, method: 'post' })
export const disableTenant = (id: number) => request({ url: `/admin/sys/tenant/disable/${id}`, method: 'post' })
/** 设置租户管理员（Flow B） */
export const setTenantAdmin = (data: TenantAdminDTO) => request({ url: '/admin/org/employee/tenant/admin', method: 'post', data })
