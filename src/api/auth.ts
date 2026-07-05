import { request } from '@/utils/request'

export interface MenuVO {
  id: number
  name: string
  type: string
  code?: string
  parent: number
  sort?: number
  icon?: string
  routeName?: string
  routePath?: string
  component?: string
  children?: MenuVO[]
}

export interface PlatformVO {
  id: number
  code: string
  name: string
  entryUrl?: string
  status?: number
}

/** 登录 */
export function login(loginWay: string, loginInfo: object) {
  return request({
    url: `/admin/auth/login/${loginWay}`,
    method: 'post',
    data: loginInfo
  })
}

/** 当前用户信息（含 buttons 按钮权限） */
export function getUserInfo() {
  return request({ url: '/admin/auth/userInfo', method: 'get' })
}

/** 当前用户菜单权限树 */
export function getPermission() {
  return request({ url: '/admin/auth/permission', method: 'get' })
}

/** 当前用户可访问的平台列表 */
export function getPlatforms() {
  return request<PlatformVO[]>({ url: '/admin/auth/platforms', method: 'get' })
}

/** 切换当前平台 */
export function switchPlatform(platform: string) {
  return request({
    url: '/admin/auth/switchPlatform',
    method: 'post',
    params: { platform }
  })
}

/** 刷新 token */
export function refreshToken() {
  const token = localStorage.getItem('wei_admin_token')
  return request<string>({
    url: '/admin/auth/refresh',
    method: 'post',
    headers: { token }
  })
}

/** 登出 */
export function logout() {
  const token = localStorage.getItem('wei_admin_token')
  return request({ url: '/admin/auth/logout', method: 'post', headers: { token } })
}
