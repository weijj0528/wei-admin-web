<template>
  <div class="home">
    <h2>欢迎使用 wei-saas 管理台</h2>
    <p>当前用户：{{ userStore.username }}</p>
    <p>按钮权限数：{{ userStore.buttons.length }}</p>
    <p>菜单数：{{ userStore.menus.length }}</p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>
