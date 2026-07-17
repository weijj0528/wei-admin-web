<template>
  <ListLayout title="日志列表" :page="pagination" @page-change="handlePageChange" @size-change="handleSizeChange">
    <template #search>
      <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    </template>
    <el-table :data="tableData" v-loading="loading" stripe height="100%">
      <el-table-column prop="username" label="操作人" width="120" />
      <el-table-column prop="operation" label="操作" />
      <el-table-column prop="method" label="方法" show-overflow-tooltip />
      <el-table-column prop="cost" label="耗时(ms)" width="100" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'" effect="light">
            {{ row.status === 0 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ctime" label="时间" width="180" />
      <template #empty><el-empty description="暂无日志" /></template>
    </el-table>
  </ListLayout>
</template>

<script setup lang="ts">
import SearchBar from '@/components/SearchBar.vue'
import ListLayout from '@/components/ListLayout.vue'
import { useCrud } from '@/composables/useCrud'
import { listOperationLogs, type OperationLogDTO } from '@/api/operationLog'

const fields = [{ prop: 'username', label: '操作人' }]
const {
  loading, tableData, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
} = useCrud<OperationLogDTO>(
  { list: listOperationLogs, create: async () => {}, update: async () => {}, delete: async () => {} },
  {} as OperationLogDTO
)
fetchData()
</script>
