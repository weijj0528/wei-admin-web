<template>
  <div class="home-container">
    <!-- 多首页 PAGE 切换 tab（仅 1 个时不显示） -->
    <nav v-if="homePages.length > 1" class="home-tabs" role="tablist">
      <button
        v-for="p in homePages"
        :key="p.id"
        role="tab"
        class="home-tab"
        :class="{ active: p.id === currentPage?.id }"
        @click="currentPage = p"
      >
        <el-icon v-if="p.icon" class="t-icon"><component :is="p.icon" /></el-icon>
        <span>{{ p.name }}</span>
      </button>
    </nav>

    <!-- 无首页权限/未配置 -->
    <el-empty v-if="!currentPage" description="未配置首页或无首页访问权限，请联系管理员" />

    <!-- 子应用首页（wujie 加载） -->
    <template v-else-if="isSubApp">
      <el-result v-if="loadError" icon="error" title="首页子应用加载失败" :sub-title="errorMsg">
        <template #extra>
          <el-button type="primary" @click="retry">重试</el-button>
        </template>
      </el-result>
      <!-- WujieVue 必须始终挂载：beforeLoad 会置 loading=true，
           若用 v-if/v-else 切换会在加载瞬间卸载组件，导致子应用启动中断、iframe 0 资源加载 -->
      <div v-else class="subapp-wrap">
        <div v-if="loading" class="loading-mask">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>首页加载中...</p>
        </div>
        <WujieVue
          :key="remountKey"
          :name="`home-${currentPage.id}`"
          :url="currentPage.component!"
          :props="microProps"
          :sync="true"
          :beforeLoad="handleBeforeLoad"
          :afterMount="handleMounted"
        />
      </div>
    </template>

    <!-- 本地组件首页 -->
    <component v-else-if="resolvedComponent" :is="resolvedComponent" />

    <!-- 本地组件路径找不到 -->
    <el-empty v-else :description="`首页组件加载失败：${currentPage.component} 不存在`" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect, onBeforeUnmount, shallowRef } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import WujieVue from 'wujie-vue3'
import { useUserStore } from '@/store/user'
import { buildMicroProps } from '@/micro/props'
import { loadComponent, isSubAppUrl } from '@/utils/dynamicComponent'
import type { MenuVO } from '@/api/auth'

const userStore = useUserStore()

/** 首页 MODULE：routePath='/home' 的顶层模块 */
const homeModule = computed(() => userStore.menus.find((m) => m.routePath === '/home'))

/** 首页 PAGE 列表：首页 MODULE -> GROUP -> PAGE（menus 已按权限过滤） */
const homePages = computed<MenuVO[]>(() => {
  const groups = homeModule.value?.children ?? []
  return groups.flatMap((g) => g.children ?? []).filter((p) => p.component)
})

/** 当前首页 PAGE，默认第一个；平台切换后列表变化时自动重选 */
const currentPage = ref<MenuVO | null>(null)
watchEffect(() => {
  const list = homePages.value
  if (list.length === 0) {
    currentPage.value = null
    return
  }
  if (!currentPage.value || !list.some((p) => p.id === currentPage.value!.id)) {
    currentPage.value = list[0]
  }
})

const isSubApp = computed(() => isSubAppUrl(currentPage.value?.component))
// 本地组件用 shallowRef 避免深层响应式开销
const resolvedComponent = shallowRef(loadComponent(currentPage.value?.component))
watchEffect(() => {
  resolvedComponent.value = isSubApp.value ? null : loadComponent(currentPage.value?.component)
})

const microProps = computed(() => buildMicroProps())

/* ===== wujie 子应用加载状态（参考 PlatformContainer） ===== */
const loading = ref(false)
const loadError = ref(false)
const errorMsg = ref('')
let timeoutHandle: ReturnType<typeof setTimeout> | null = null
const remountKey = ref(0)

function handleBeforeLoad() {
  loading.value = true
  loadError.value = false
  timeoutHandle = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      loadError.value = true
      errorMsg.value = `首页子应用加载超时（10s）：${currentPage.value?.component}`
    }
  }, 10000)
}
function handleMounted() {
  loading.value = false
  if (timeoutHandle) clearTimeout(timeoutHandle)
}
function retry() {
  loadError.value = false
  loading.value = false
  remountKey.value++
}
onBeforeUnmount(() => {
  if (timeoutHandle) clearTimeout(timeoutHandle)
})
</script>

<style scoped>
.home-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.home-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.home-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  cursor: pointer;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: var(--text-base);
  background: var(--surface);
  border: 1px solid var(--border);
  font-family: inherit;
  transition: all 0.15s ease;
}
.home-tab:hover {
  color: var(--brand);
  border-color: var(--brand);
}
.home-tab.active {
  color: var(--brand);
  background: var(--brand-light);
  border-color: var(--brand);
  font-weight: 600;
}
.t-icon { font-size: 16px; }

.subapp-wrap {
  position: relative;
  flex: 1;
  min-height: 400px;
}
.loading-mask {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--surface, #fff);
  color: var(--text-tertiary);
}
</style>
