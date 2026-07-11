<template>
  <div class="search-bar">
    <el-form :model="model" :inline="true" class="search-form">
      <el-form-item v-for="f in fields" :key="f.prop" :label="f.label">
        <el-input
          v-if="!f.type || f.type === 'input'"
          v-model="model[f.prop]"
          :placeholder="f.placeholder || `请输入${f.label}`"
          clearable
          class="search-field"
          @keyup.enter="$emit('search')"
        />
        <el-select
          v-else-if="f.type === 'select'"
          v-model="model[f.prop]"
          :placeholder="f.placeholder || `请选择${f.label}`"
          clearable
          class="search-field"
        >
          <el-option v-for="o in f.options || []" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="search-actions">
        <el-button type="primary" :icon="Search" @click="$emit('search')">查询</el-button>
        <el-button :icon="Refresh" @click="$emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Search, Refresh } from '@element-plus/icons-vue'

export interface SearchField {
  prop: string
  label: string
  type?: 'input' | 'select'
  placeholder?: string
  options?: { label: string; value: string | number }[]
}

defineProps<{
  model: Record<string, any>
  fields: SearchField[]
}>()

defineEmits<{
  search: []
  reset: []
}>()
</script>

<style scoped>
.search-bar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  padding: var(--space-4) var(--space-4) 0;
  box-shadow: var(--shadow-xs);
}
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-4);
}
.search-form :deep(.el-form-item) {
  margin-bottom: var(--space-4);
  margin-right: 0;
}
.search-form :deep(.el-form-item__label) {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
  padding-right: 8px;
}
.search-field {
  width: 200px;
}
.search-actions {
  margin-left: auto;
}
.search-actions :deep(.el-button) {
  margin-left: 8px;
}
.search-actions :deep(.el-button:first-child) {
  margin-left: 0;
}
</style>
