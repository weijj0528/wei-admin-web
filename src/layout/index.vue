<template>
  <div class="layout">
    <aside
      class="layout-aside"
      :style="{ width: isHome ? '0px' : (appStore.sidebarCollapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)') }"
    >
      <Sidebar />
    </aside>
    <div class="layout-right">
      <header class="layout-header">
        <Header />
      </header>
      <TagsBar />
      <main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TagsBar from './TagsBar.vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { useTagsStore } from '@/store/tags'
const appStore = useAppStore()
const route = useRoute()
const userStore = useUserStore()
const tags = useTagsStore()
// 首页隐藏侧边栏，内容铺满屏幕
const isHome = computed(() => route.path === '/home' || route.path === '/')
// 路由变化：同步顶部 MODULE 选中 + 记录标签页
watch(
  () => route.path,
  (p) => {
    userStore.syncModuleFromRoute(p)
    const title = route.meta?.title as string | undefined
    if (title) tags.addTab({ path: p, title })
  },
  { immediate: true }
)
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  overflow: hidden;
}
.layout-aside {
  background: var(--deep-950);
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  z-index: 20;
  flex-shrink: 0;
}
.layout-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
}
.layout-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  padding: 0 var(--space-5);
  height: var(--header-h);
  z-index: 10;
  flex-shrink: 0;
}
.layout-main {
  background: var(--bg);
  padding: var(--space-5);
  overflow: auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 页面切换淡入（轻量） */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
