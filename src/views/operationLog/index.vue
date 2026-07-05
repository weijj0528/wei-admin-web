<template>
  <el-card>
    <template #header><span>操作日志</span></template>
    <div style="margin-bottom: 12px"><el-input v-model="query.username" placeholder="操作人" style="width: 150px" clearable /><el-button type="primary" @click="fetchData(query)" style="margin-left: 8px">查询</el-button></div>
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="username" label="操作人" width="120" />
      <el-table-column prop="operation" label="操作" />
      <el-table-column prop="method" label="方法" show-overflow-tooltip />
      <el-table-column prop="cost" label="耗时(ms)" width="100" />
      <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '成功' : '失败' }}</el-tag></template></el-table-column>
      <el-table-column prop="ctime" label="时间" width="180" />
    </el-table>
  </el-card>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useCrud } from '@/composables/useCrud'
import { listOperationLogs, type OperationLogDTO } from '@/api/operationLog'
const query = reactive({ username: '' })
const { loading, tableData, fetchData } = useCrud<OperationLogDTO>({ list: listOperationLogs, create: async () => {}, update: async () => {}, delete: async () => {} }, {} as OperationLogDTO)
fetchData()
</script>
