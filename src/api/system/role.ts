import { request } from '@/utils/request'

export interface RoleDTO {
  id?: number
  name?: string
  code?: string
  type?: string
  platform?: string
  remark?: string
  parent?: number
  menus?: number[]
}

export interface RoleAllotDTO {
  relativeType: string
  relativeId: number
  roleIds: number[]
}

export const listRoles = (params?: any) => request({ url: '/admin/sys/role', method: 'get', params })
export const getRole = (id: number) => request({ url: `/admin/sys/role/${id}`, method: 'get' })
export const createRole = (data: RoleDTO) => request({ url: '/admin/sys/role', method: 'post', data })
export const updateRole = (id: number, data: RoleDTO) => request({ url: `/admin/sys/role/${id}`, method: 'post', data })
export const deleteRole = (id: number) => request({ url: `/admin/sys/role/del/${id}`, method: 'post' })
/** 角色分配（给员工/用户批量分配角色，Flow C） */
export const assignRoleAllot = (data: RoleAllotDTO) => request({ url: '/admin/sys/role/allot', method: 'post', data })
