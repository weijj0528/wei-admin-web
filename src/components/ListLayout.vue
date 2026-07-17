<template>
  <div class="page">
    <slot name="search" />
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ title }}</span>
          <slot name="actions" />
        </div>
      </template>
      <slot />
      <el-pagination
        v-if="!hidePagination"
        :current-page="page.page"
        :page-size="page.size"
        :total="page.total"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </el-card>
    <slot name="dialog" />
  </div>
</template>

<script setup lang="ts">
/**
 * 列表页轻量布局壳：封装 .page + el-card(header+body) + el-pagination 骨架。
 * 通过 slot 传入 SearchBar / 表格列 / 操作按钮 / 表单弹窗，保留各页定制灵活性。
 * 全局 .page / .el-card 样式（style.css）负责固定表格高度、表体滚动、分页固定底部。
 */
interface PageState {
  page: number
  size: number
  total: number
}
withDefaults(defineProps<{
  title: string
  page: PageState
  pageSizes?: number[]
  hidePagination?: boolean
}>(), {
  pageSizes: () => [10, 20, 50],
  hidePagination: false,
})
const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}>()
function onPageChange(p: number) { emit('page-change', p) }
function onSizeChange(s: number) { emit('size-change', s) }
</script>
