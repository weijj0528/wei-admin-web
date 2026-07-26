import { request } from '@/utils/request'
export interface EmployeeDTO {
  id?: number; userId?: number; userName?: string; pwd?: string
  code?: string; name?: string; remark?: string; roles?: number[]; departments?: number[]
}
export const listEmployees = (params?: any) => request({ url: '/admin/org/employee', method: 'get', params })
export const getEmployee = (id: number) => request({ url: `/admin/org/employee/${id}`, method: 'get' })

/**
 * 密码 Base64 编码：后端 PasswordService.decodeAndEncode 期望收到 Base64 密文
 * （先 Base64 解码再 md5+sha1）。登录、租户管理员、用户重置均以 btoa(明文) 提交，
 * 员工新增/编辑须保持一致，否则存库哈希错误导致登录失败。
 * 空密码不编码（编辑不改密码时留空，后端 isBlank 跳过）。
 */
const encodePwd = (pwd?: string): string | undefined =>
  (pwd === undefined || pwd === '') ? pwd : btoa(pwd)

export const createEmployee = (data: EmployeeDTO) =>
  request({ url: '/admin/org/employee', method: 'post', data: { ...data, pwd: encodePwd(data.pwd) } })
export const updateEmployee = (id: number, data: EmployeeDTO) =>
  request({ url: `/admin/org/employee/${id}`, method: 'post', data: { ...data, pwd: encodePwd(data.pwd) } })
export const deleteEmployee = (id: number) => request({ url: `/admin/org/employee/del/${id}`, method: 'post' })
