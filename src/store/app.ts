import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPlatforms, type PlatformVO } from '@/api/auth'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const currentPlatform = ref<string>('')
  const platforms = ref<PlatformVO[]>([])

  async function fetchPlatforms() {
    platforms.value = await getPlatforms()
    // currentPlatform 为空或不在列表中（如 token 平台已失效）时，兜底取第一个
    if (platforms.value.length > 0) {
      const exists = platforms.value.some(p => p.code === currentPlatform.value)
      if (!exists) {
        currentPlatform.value = platforms.value[0].code
      }
    }
    return platforms.value
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, currentPlatform, platforms, fetchPlatforms, toggleSidebar }
})
