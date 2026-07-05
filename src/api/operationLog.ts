import { request } from '@/utils/request'
export interface OperationLogDTO { id?: number; username?: string; operation?: string; method?: string; status?: number }
export const listOperationLogs = (params?: any) => request({ url: '/admin/operationLog', method: 'get', params })
