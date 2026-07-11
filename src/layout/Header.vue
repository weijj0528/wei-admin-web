<template>
  <div class="header">
    <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
      <Fold v-if="!appStore.sidebarCollapsed" />
      <Expand v-else />
    </el-icon>

    <!-- 分隔细竖线 -->
    <span class="v-divider" />

    <!-- 顶部 MODULE 切换 -->
    <nav class="module-tabs" role="tablist">
      <button
        v-for="m in userStore.menus"
        :key="m.id"
        role="tab"
        class="module-tab"
        :class="{ active: m.id === userStore.currentModuleId }"
        @click="handleModuleClick(m)"
      >
        <el-icon v-if="m.icon" class="m-icon"><component :is="m.icon" /></el-icon>
        <span>{{ m.name }}</span>
      </button>
    </nav>

    <div class="header-right">
      <el-select
        v-model="appStore.currentPlatform"
        placeholder="平台"
        class="platform-select"
        @change="handleSwitchPlatform"
      >
        <template #prefix>
          <el-icon><Grid /></el-icon>
        </template>
        <el-option v-for="p in appStore.platforms" :key="p.code" :label="p.name" :value="p.code" />
      </el-select>

      <el-dropdown>
        <div class="user-info">
          <div class="avatar">{{ (userStore.username || '?').slice(0, 1).toUpperCase() }}</div>
          <div class="user-meta">
            <span class="username">{{ userStore.username }}</span>
            <span class="user-sub">管理员</span>
          </div>
          <el-icon class="chev"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Fold, Expand, ArrowDown, Grid, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { useTagsStore } from '@/store/tags'
import { switchPlatform, logout as logoutApi } from '@/api/auth'
import { cancelAllPendingRequests } from '@/utils/request'
import type { MenuVO } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const tags = useTagsStore()
const switching = ref(false)

onMounted(async () => {
  try {
    await appStore.fetchPlatforms()
  } catch (e) {
    // 平台列表获取失败不阻塞
  }
})

function handleModuleClick(m: MenuVO) {
  userStore.setCurrentModule(m.id)
  if (m.routePath) {
    router.push(m.routePath)
    return
  }
  const first = findFirstPage(m)
  if (first?.routePath) router.push(first.routePath)
}

function findFirstPage(m: MenuVO): MenuVO | undefined {
  for (const g of m.children ?? []) {
    if (g.routePath) return g
    const p = g.children?.[0]
    if (p?.routePath) return p
  }
  return undefined
}

async function handleSwitchPlatform(platform: string) {
  if (switching.value) return
  switching.value = true
  try {
    cancelAllPendingRequests()
    await switchPlatform(platform)
    await userStore.fetchPermission()
    ElMessage.success('平台已切换')
  } catch (e) {
    // request 拦截器已 toast
  } finally {
    switching.value = false
  }
}

async function handleLogout() {
  try {
    await logoutApi()
  } catch (e) {
    // 忽略登出接口错误
  }
  userStore.logout()
  tags.reset()
  router.push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: var(--space-3);
}
.collapse-btn {
  font-size: 18px;
  cursor: pointer;
  color: var(--gray-500);
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
}
.collapse-btn:hover {
  color: var(--brand);
  background: var(--brand-light);
}

.v-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 var(--space-2);
}

.module-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
}
.module-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 var(--space-4);
  height: 38px;
  cursor: pointer;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: var(--text-base);
  background: transparent;
  border: none;
  font-family: inherit;
  transition: all 0.18s ease;
  position: relative;
}
.module-tab:hover {
  color: var(--brand);
  background: var(--gray-100);
}
.module-tab.active {
  color: var(--brand);
  background: var(--brand-light);
  font-weight: 600;
}
.module-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--brand);
}
.m-icon { font-size: 16px; }

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.platform-select {
  width: 168px;
}
.platform-select :deep(.el-input__wrapper) {
  border-radius: var(--radius);
  background: var(--gray-50);
  box-shadow: 0 0 0 1px var(--border-light) inset;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 10px 4px 4px;
  height: 38px;
  border-radius: var(--radius);
  transition: background 0.15s;
}
.user-info:hover {
  background: var(--gray-100);
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-active) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: 600;
  flex-shrink: 0;
}
.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.username {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text);
}
.user-sub {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 0.02em;
}
.chev {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-left: 2px;
}
</style>
