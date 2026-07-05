import { request } from '@/utils/request'
export interface UserDTO {
  id?: number; name?: string; phone?: string; nickname?: string
  gender?: number; pwd?: string; freeze?: number
}
export const listUsers = (params?: any) => request({ url: '/admin/user/info', method: 'get', params })
export const getUser = (id: number) => request({ url: `/admin/user/info/${id}`, method: 'get' })
export const createUser = (data: UserDTO) => request({ url: '/admin/user/info', method: 'post', data })
export const updateUser = (id: number, data: UserDTO) => request({ url: `/admin/user/info/${id}`, method: 'post', data })
export const deleteUser = (id: number) => request({ url: `/admin/user/info/del/${id}`, method: 'post' })
export const freezeUser = (id: number, freeze: number) => request({ url: `/admin/user/info/freeze/${id}`, method: 'post', params: { freeze } })
export const resetUserPwd = (id: number, pwd: string) => request({ url: `/admin/user/info/resetPwd/${id}`, method: 'post', data: { pwd } })
