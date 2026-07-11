<template>
  <!-- 递归菜单项：有 children → 子菜单；无 children → 可点击叶子（routePath 跳转） -->
  <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="String(menu.id)">
    <template #title>
      <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
      <span>{{ menu.name }}</span>
    </template>
    <SidebarItem v-for="child in menu.children" :key="child.id" :menu="child" />
  </el-sub-menu>
  <el-menu-item v-else :index="menu.routePath || `/menu/${menu.id}`">
    <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
    <span>{{ menu.name }}</span>
  </el-menu-item>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { MenuVO } from '@/api/auth'

defineOptions({ name: 'SidebarItem' })

defineProps({
  menu: { type: Object as PropType<MenuVO>, required: true }
})
</script>
