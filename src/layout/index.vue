<template>
  <el-container class="layout">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '210px'">
      <Sidebar />
    </el-aside>
    <el-container>
      <el-header>
        <Header />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import { useAppStore } from '@/store/app'
const appStore = useAppStore()
</script>

<style scoped>
.layout {
  height: 100vh;
}
.el-aside {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
}
.el-header {
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.el-main {
  background: #f0f2f5;
  padding: 20px;
}
</style>
