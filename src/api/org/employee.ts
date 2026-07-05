import { request } from '@/utils/request'
export interface EmployeeDTO {
  id?: number; userId?: number; userName?: string; pwd?: string
  code?: string; name?: string; remark?: string; roles?: number[]
}
export const listEmployees = (params?: any) => request({ url: '/admin/org/employee', method: 'get', params })
export const getEmployee = (id: number) => request({ url: `/admin/org/employee/${id}`, method: 'get' })
export const createEmployee = (data: EmployeeDTO) => request({ url: '/admin/org/employee', method: 'post', data })
export const updateEmployee = (id: number, data: EmployeeDTO) => request({ url: `/admin/org/employee/${id}`, method: 'post', data })
export const deleteEmployee = (id: number) => request({ url: `/admin/org/employee/del/${id}`, method: 'post' })
