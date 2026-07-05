<template>
  <div class="header">
    <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
      <Fold v-if="!appStore.sidebarCollapsed" />
      <Expand v-else />
    </el-icon>

    <el-select v-model="appStore.currentPlatform" placeholder="选择平台" style="width: 200px; margin-left: 20px;" @change="handleSwitchPlatform">
      <el-option v-for="p in appStore.platforms" :key="p.code" :label="p.name" :value="p.code" />
    </el-select>

    <div class="header-right">
      <el-dropdown>
        <span class="user-info">
          <el-icon><UserFilled /></el-icon>
          {{ userStore.username }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Fold, Expand, UserFilled, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { switchPlatform, logout as logoutApi } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

onMounted(async () => {
  try {
    await appStore.fetchPlatforms()
  } catch (e) {
    // 平台列表获取失败不阻塞
  }
})

async function handleSwitchPlatform(platform: string) {
  try {
    await switchPlatform(platform)
    await userStore.fetchPermission()
    ElMessage.success('平台已切换')
  } catch (e) {
    // request 拦截器已 toast
  }
}

async function handleLogout() {
  try {
    await logoutApi()
  } catch (e) {
    // 忽略登出接口错误
  }
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  width: 100%;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}
.header-right {
  margin-left: auto;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
</style>
