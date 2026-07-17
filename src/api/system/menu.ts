import { request } from '@/utils/request'

export interface MenuDTO {
  id?: number
  name?: string
  type?: string
  code?: string
  parent?: number
  platform?: string
  icon?: string
  iconType?: number
  routeName?: string
  routePath?: string
  component?: string
  sort?: number
  baseMenu?: number
  hide?: number
  remark?: string
  apiList?: number[]
}

export const listMenus = (params?: any) => request({ url: '/admin/sys/menu', method: 'get', params })
export const getMenu = (id: number) => request({ url: `/admin/sys/menu/${id}`, method: 'get' })
export const createMenu = (data: MenuDTO) => request({ url: '/admin/sys/menu', method: 'post', data })
export const updateMenu = (id: number, data: MenuDTO) => request({ url: `/admin/sys/menu/${id}`, method: 'post', data })
export const deleteMenu = (id: number) => request({ url: `/admin/sys/menu/del/${id}`, method: 'post' })
/** 菜单树（按平台过滤） */
export const getMenuTree = (params?: any) => request({ url: '/admin/sys/menu/all', method: 'get', params })
/** 角色已分配菜单 */
export const getRoleMenus = (roleId: number) => request({ url: '/admin/sys/role/menus', method: 'get', params: { id: roleId } })

/** 系统接口（菜单 API 配置用） */
export interface SysApiVO {
  id?: number
  name?: string
  module?: string
  path?: string
  login?: number
  remark?: string
}
export const listSysApi = (params?: any) => request({ url: '/admin/sys/api', method: 'get', params })
