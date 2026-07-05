import { request } from './request'

/**
 * 前端异常上报（评审补强 CRITICAL 2：前端可观测）
 * 当前：上报到后端 operationLog（POST 扩展）
 * 后端需补 POST /admin/operationLog 接收前端异常，或接入 Sentry
 */
export function reportError(type: string, message: string, detail?: string) {
  // 静默上报，不影响业务
  try {
    request({
      url: '/admin/operationLog/report',
      method: 'post',
      data: {
        operation: `[前端-${type}] ${message}`,
        method: detail || '',
        status: 1,
        errorMsg: detail
      }
    }).catch(() => {})
  } catch (e) {
    console.error('[reportError failed]', e)
  }
}
