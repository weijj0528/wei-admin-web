import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TabItem {
  path: string
  title: string
  affix?: boolean
}

const HOME_TAB: TabItem = { path: '/home', title: '首页', affix: true }

/**
 * 多标签页：记录已打开的菜单页面，支持切换/关闭。
 * 首页为常驻标签（affix，不可关闭）。
 */
export const useTagsStore = defineStore('tags', () => {
  const tabs = ref<TabItem[]>([{ ...HOME_TAB }])

  function addTab(tab: TabItem) {
    if (!tabs.value.find((t) => t.path === tab.path)) {
      tabs.value.push(tab)
    }
  }

  /** 关闭标签：返回需要跳转的下一个 path（若关闭的是当前激活标签），否则 null */
  function removeTab(path: string): string | null {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx === -1) return null
    if (tabs.value[idx].affix) return null
    tabs.value.splice(idx, 1)
    if (idx < tabs.value.length) return tabs.value[idx].path
    if (tabs.value.length) return tabs.value[tabs.value.length - 1].path
    return HOME_TAB.path
  }

  function reset() {
    tabs.value = [{ ...HOME_TAB }]
  }

  return { tabs, addTab, removeTab, reset }
})
