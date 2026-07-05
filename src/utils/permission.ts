import type { Directive } from 'vue'

/**
 * v-permission 按钮权限指令
 * 用法：<el-button v-permission="['system:user:add']">新增</el-button>
 * 从 wujie props 或 store 取 buttons 列表，无权限则移除元素
 */
export function getButtons(): string[] {
  // 子应用在 wujie 内：从 props 取
  const wujieProps = (window as any).$wujie?.props
  if (wujieProps?.buttons) {
    return wujieProps.buttons as string[]
  }
  // 底座：从 localStorage 取（登录时存）
  const stored = localStorage.getItem('wei_admin_buttons')
  return stored ? JSON.parse(stored) : []
}

export const vPermission: Directive = {
  mounted(el: HTMLElement, binding) {
    const required = binding.value as string[]
    if (!required || required.length === 0) return
    const buttons = getButtons()
    // 无权限数据时不限制（开发模式 / 超级管理员未配置 routeName）
    if (buttons.length === 0) return
    const hasPerm = required.some((p) => buttons.includes(p))
    if (!hasPerm) {
      el.parentNode?.removeChild(el)
    }
  }
}
