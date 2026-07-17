<template>
  <el-select
    :model-value="modelValue"
    filterable
    clearable
    placeholder="选择图标"
    class="icon-select"
    @change="(v: any) => emit('update:modelValue', v || '')"
  >
    <el-option v-for="name in iconNames" :key="name" :label="name" :value="name">
      <el-icon><component :is="name" /></el-icon>
      <span class="opt-name">{{ name }}</span>
    </el-option>
    <template #prefix>
      <el-icon v-if="modelValue"><component :is="modelValue" /></el-icon>
    </template>
  </el-select>
</template>

<script setup lang="ts">
/**
 * 图标选择器：element-plus 内置图标库，可搜索，选中存图标组件名（如 User/Setting）。
 * main.ts 已全局注册图标组件，故 :is="name" 可直接渲染。
 */
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
// 仅取首字母大写的组件名（过滤掉 size 等导出常量）
const iconNames = Object.keys(ElementPlusIconsVue).filter((k) => /^[A-Z]/.test(k))
</script>

<style scoped>
.icon-select { width: 100%; }
.opt-name { margin-left: 8px; }
</style>
