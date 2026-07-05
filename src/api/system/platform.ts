import { request } from '@/utils/request'

export interface PlatformDTO {
  id?: number
  code?: string
  name?: string
  remark?: string
  parent?: number
  entryUrl?: string
}

/** 分页查询平台 */
export function listPlatforms(params: PlatformDTO & { page?: number; size?: number }) {
  return request({ url: '/admin/sys/platform', method: 'get', params })
}

/** 平台详情 */
export function getPlatform(id: number) {
  return request({ url: `/admin/sys/platform/${id}`, method: 'get' })
}

/** 新建平台 */
export function createPlatform(data: PlatformDTO) {
  return request({ url: '/admin/sys/platform', method: 'post', data })
}

/** 更新平台 */
export function updatePlatform(id: number, data: PlatformDTO) {
  return request({ url: `/admin/sys/platform/${id}`, method: 'post', data })
}

/** 删除平台 */
export function deletePlatform(id: number) {
  return request({ url: `/admin/sys/platform/del/${id}`, method: 'post' })
}
