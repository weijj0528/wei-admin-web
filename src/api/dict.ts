import { request } from '@/utils/request'
export interface DictTypeDTO { id?: number; code?: string; name?: string; status?: number; remark?: string }
export interface DictDTO { id?: number; typeCode?: string; code?: string; name?: string; value?: string; sort?: number; status?: number; remark?: string }
// 字典类型
export const listDictTypes = (params?: any) => request({ url: '/admin/dict/type', method: 'get', params })
export const createDictType = (data: DictTypeDTO) => request({ url: '/admin/dict/type', method: 'post', data })
export const updateDictType = (id: number, data: DictTypeDTO) => request({ url: `/admin/dict/type/${id}`, method: 'post', data })
export const deleteDictType = (id: number) => request({ url: `/admin/dict/type/del/${id}`, method: 'post' })
// 字典项
export const listDictItems = (params?: any) => request({ url: '/admin/dict/item', method: 'get', params })
export const createDictItem = (data: DictDTO) => request({ url: '/admin/dict/item', method: 'post', data })
export const updateDictItem = (id: number, data: DictDTO) => request({ url: `/admin/dict/item/${id}`, method: 'post', data })
export const deleteDictItem = (id: number) => request({ url: `/admin/dict/item/del/${id}`, method: 'post' })
export const listDictItemsByType = (typeCode: string) => request({ url: '/admin/dict/item/list', method: 'get', params: { typeCode } })
