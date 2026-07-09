<template>
  <div class="sidebar">
    <div class="logo">
      <div class="logo-mark">
        <span class="logo-dot" />
        <span class="logo-bracket">{</span>
        <span class="logo-w">w</span>
        <span class="logo-bracket">}</span>
      </div>
      <span v-if="!appStore.sidebarCollapsed" class="logo-text">wei·console</span>
    </div>
    <el-scrollbar class="menu-scroll">
      <el-menu
        ref="menuRef"
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="var(--deep-text-dim)"
        active-text-color="#ffffff"
        router
      >
        <SidebarItem v-for="menu in userStore.sidebarMenus" :key="menu.id" :menu="menu" />
      </el-menu>
      <!-- 琥珀色滑动光标条 —— 签名元素 -->
      <span class="rail-cursor" :style="cursorStyle" aria-hidden="true" />
    </el-scrollbar>
    <div v-if="!appStore.sidebarCollapsed" class="sidebar-foot">
      <span class="foot-badge">v2.0</span>
      <span class="foot-text">control console</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()
const activeMenu = computed(() => route.path)

const menuRef = ref<{ $el: HTMLElement } | null>(null)
const cursorTop = ref(0)
const cursorH = ref(0)
const cursorVisible = ref(false)

const cursorStyle = computed(() => ({
  transform: `translateY(${cursorTop.value}px) scaleY(${cursorH.value / 44})`,
  opacity: cursorVisible.value ? 1 : 0,
}))

function updateCursor() {
  nextTick(() => {
    const el = menuRef.value?.$el as HTMLElement | null
    if (!el) return
    const active = el.querySelector<HTMLElement>('.el-menu-item.is-active')
    const wrap = el.parentElement // el-scrollbar view
    if (!active || !wrap) { cursorVisible.value = false; return }
    const wrapRect = wrap.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    cursorTop.value = activeRect.top - wrapRect.top + wrap.scrollTop
    cursorH.value = activeRect.height
    cursorVisible.value = true
  })
}

onMounted(updateCursor)
watch(() => route.path, updateCursor, { flush: 'post' })
watch(() => appStore.sidebarCollapsed, () => {
  // 折叠动画后再计算位置
  setTimeout(updateCursor, 280)
})
watch(() => userStore.sidebarMenus, updateCursor, { deep: true, flush: 'post' })
watch(() => userStore.currentModuleId, updateCursor, { flush: 'post' })
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--deep-950) 0%, var(--deep-900) 100%);
  color: var(--deep-text);
  position: relative;
}
/* 暗侧栏的细微高光边，切得不硬 */
.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 20%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.06) 80%,
    transparent 100%
  );
}

.logo {
  height: var(--header-h);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--deep-divider);
  padding: 0 var(--space-4);
  overflow: hidden;
}
.logo-mark {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1px;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 15px;
  color: var(--deep-text);
  letter-spacing: 0;
}
.logo-dot {
  position: absolute;
  left: -10px;
  top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent), 0 0 16px rgba(245, 176, 66, 0.5);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.8); }
}
.logo-bracket { color: var(--deep-text-mute); }
.logo-w {
  color: #fff;
  font-style: italic;
  font-weight: 800;
}
.logo-text {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #fff;
  white-space: nowrap;
}

.menu-scroll {
  flex: 1;
  overflow: hidden;
  position: relative;
}
.sidebar :deep(.el-menu) {
  border-right: none;
  padding: var(--space-3) var(--space-2);
  position: relative;
  background: transparent !important;
}
.sidebar :deep(.el-menu-item),
.sidebar :deep(.el-sub-menu__title) {
  height: 42px;
  line-height: 42px;
  border-radius: var(--radius-sm);
  margin-bottom: 2px;
  color: var(--deep-text-dim);
  font-size: var(--text-sm);
  transition: background 0.18s ease, color 0.18s ease;
  position: relative;
}
.sidebar :deep(.el-menu-item .el-icon),
.sidebar :deep(.el-sub-menu__title .el-icon) {
  color: var(--deep-text-mute);
  font-size: 16px;
  transition: color 0.18s ease;
}
.sidebar :deep(.el-menu-item:hover),
.sidebar :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
}
.sidebar :deep(.el-menu-item:hover .el-icon),
.sidebar :deep(.el-sub-menu__title:hover .el-icon) {
  color: #fff;
}
.sidebar :deep(.el-menu-item.is-active) {
  background: rgba(59, 91, 255, 0.14);
  color: #fff;
  font-weight: 500;
}
.sidebar :deep(.el-menu-item.is-active .el-icon) {
  color: var(--accent);
}
.sidebar :deep(.el-sub-menu .el-menu-item) {
  background: transparent;
  min-width: auto;
}
.sidebar :deep(.el-sub-menu .el-menu-item.is-active) {
  background: rgba(59, 91, 255, 0.18);
}
/* 子菜单标题箭头与展开区 */
.sidebar :deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  color: var(--deep-text-mute);
}
.sidebar :deep(.el-menu--collapse .el-sub-menu .el-menu) {
  background: var(--deep-800) !important;
}

/* 侧栏组标题（如果将来加分组） */
.sidebar :deep(.el-menu-item-group__title) {
  color: var(--deep-text-mute);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding-left: 12px;
  padding-top: var(--space-3);
}

/* === 签名元素：琥珀色轨道光标 === */
.rail-cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 44px; /* 基准高，scaleY 缩放 */
  background: linear-gradient(180deg, var(--accent-hover) 0%, var(--accent) 100%);
  border-radius: 0 3px 3px 0;
  transform-origin: top center;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(245, 176, 66, 0.5), 0 0 16px rgba(245, 176, 66, 0.2);
  /* 折叠时隐藏 */
}
.sidebar:has(.el-menu--collapse) .rail-cursor {
  opacity: 0 !important;
}

.sidebar-foot {
  height: 36px;
  border-top: 1px solid var(--deep-divider);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 var(--space-4);
  flex-shrink: 0;
  font-size: 11px;
  color: var(--deep-text-mute);
  letter-spacing: 0.06em;
}
.foot-badge {
  font-family: var(--font-mono);
  background: rgba(245, 176, 66, 0.12);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}
.foot-text { text-transform: lowercase; }

/* 折叠态居中 */
.sidebar :deep(.el-menu--collapse) {
  padding: var(--space-3) var(--space-2);
}
</style>
