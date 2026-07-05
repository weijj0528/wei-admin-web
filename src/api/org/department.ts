import { request } from '@/utils/request'
export interface DepartmentDTO {
  id?: number; orgId?: number; code?: string; name?: string
  parent?: number; remark?: string
}
export const listDepartments = (params?: any) => request({ url: '/admin/org/department', method: 'get', params })
export const getDepartment = (id: number) => request({ url: `/admin/org/department/${id}`, method: 'get' })
export const createDepartment = (data: DepartmentDTO) => request({ url: '/admin/org/department', method: 'post', data })
export const updateDepartment = (id: number, data: DepartmentDTO) => request({ url: `/admin/org/department/${id}`, method: 'post', data })
export const deleteDepartment = (id: number) => request({ url: `/admin/org/department/del/${id}`, method: 'post' })
export const getDepartmentTree = (params?: any) => request({ url: '/admin/org/department/tree', method: 'get', params })
