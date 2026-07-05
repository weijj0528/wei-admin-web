import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login as loginApi, getUserInfo, getPermission, type MenuVO } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken())
  const userId = ref<number>()
  const username = ref('')
  const buttons = ref<string[]>([])
  const menus = ref<MenuVO[]>([])

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
    return menus.value
  }

  function logout() {
    token.value = null
    buttons.value = []
    menus.value = []
    removeToken()
    localStorage.removeItem('wei_admin_buttons')
  }

  return { token, userId, username, buttons, menus, login, fetchUserInfo, fetchPermission, logout }
})
