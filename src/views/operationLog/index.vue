<template>
  <div class="page">
    <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    <el-card shadow="never">
      <template #header>
        <div class="card-header"><span>日志列表</span></div>
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
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '@/components/SearchBar.vue'
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

<style scoped>
.page { display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
</style>
