import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPlatforms, type PlatformVO } from '@/api/auth'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const currentPlatform = ref<string>('')
  const platforms = ref<PlatformVO[]>([])

  async function fetchPlatforms() {
    platforms.value = await getPlatforms()
    if (platforms.value.length > 0 && !currentPlatform.value) {
      currentPlatform.value = platforms.value[0].code
    }
    return platforms.value
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, currentPlatform, platforms, fetchPlatforms, toggleSidebar }
})
