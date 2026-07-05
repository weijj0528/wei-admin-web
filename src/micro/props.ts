import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'

/**
 * 构建子应用 props（底座 → wujie 子应用）
 * 子应用通过 window.$wujie.props 取
 */
export function buildMicroProps() {
  const userStore = useUserStore()
  const appStore = useAppStore()
  return {
    token: userStore.token,
    userInfo: {
      userId: userStore.userId,
      username: userStore.username
    },
    buttons: userStore.buttons,
    currentPlatform: appStore.currentPlatform,
    // bus 由 wujie 自动注入，子应用通过 window.$wujie.bus 访问
  }
}
