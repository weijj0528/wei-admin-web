import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login as loginApi, getUserInfo, getPermission, type MenuVO } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken())
  const userId = ref<number>()
  const username = ref('')
  const buttons = ref<string[]>([])
  const menus = ref<MenuVO[]>([])
  /** 当前选中的顶部 MODULE id */
  const currentModuleId = ref<number | null>(null)

  /** 侧边栏菜单：当前 MODULE 的 children（GROUP -> PAGE 两级） */
  const sidebarMenus = computed<MenuVO[]>(() => {
    const m = menus.value.find(x => x.id === currentModuleId.value)
    return m?.children ?? []
  })

  function setCurrentModule(id: number) {
    currentModuleId.value = id
  }

  /** 根据当前路由同步顶部 MODULE 选中（找包含该路由 PAGE 的 MODULE） */
  function syncModuleFromRoute(path: string) {
    if (!path || menus.value.length === 0) return
    for (const m of menus.value) {
      if (m.routePath === path) { currentModuleId.value = m.id; return }
      const hit = m.children?.some(
        g => g.routePath === path || g.children?.some(p => p.routePath === path)
      )
      if (hit) { currentModuleId.value = m.id; return }
    }
  }

  async function login(loginWay: string, loginInfo: object) {
    const data: any = await loginApi(loginWay, loginInfo)
    token.value = data.token
    setToken(data.token)
    return data
  }

  async function fetchUserInfo() {
    const info: any = await getUserInfo()
    userId.value = info.userId
    username.value = info.username || info.employeeName || ''
    buttons.value = info.buttons || []
    localStorage.setItem('wei_admin_buttons', JSON.stringify(buttons.value))
    return info
  }

  async function fetchPermission() {
    const data: any = await getPermission()
    menus.value = data.list || data || []
    if (currentModuleId.value === null && menus.value.length > 0) {
      currentModuleId.value = menus.value[0].id
    }
    return menus.value
  }

  function logout() {
    token.value = null
    buttons.value = []
    menus.value = []
    currentModuleId.value = null
    removeToken()
    localStorage.removeItem('wei_admin_buttons')
  }

  return { token, userId, username, buttons, menus, currentModuleId, sidebarMenus, login, fetchUserInfo, fetchPermission, logout, setCurrentModule, syncModuleFromRoute }
})
