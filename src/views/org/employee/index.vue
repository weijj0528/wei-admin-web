<template>
  <div class="page">
    <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>员工列表</span>
          <el-button v-permission="['org:employee:save']" type="primary" :icon="Plus" @click="handleAdd">新建员工</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe height="100%">
        <el-table-column prop="code" label="员工编码" width="120" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="userName" label="账号" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="['org:employee:update']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['org:employee:delete']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无员工" /></template>
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
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑员工' : '新建员工'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名" required><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="账号" required><el-input v-model="editForm.userName" /></el-form-item>
        <el-form-item v-if="!editForm.id" label="密码"><el-input v-model="editForm.pwd" type="password" show-password /></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import SearchBar from '@/components/SearchBar.vue'
import { useCrud } from '@/composables/useCrud'
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, type EmployeeDTO } from '@/api/org/employee'

const fields = [
  { prop: 'name', label: '姓名' },
  { prop: 'userName', label: '账号' },
]
const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<EmployeeDTO>(
  { list: listEmployees, create: createEmployee, update: updateEmployee, delete: deleteEmployee },
  { name: '', userName: '', pwd: '', remark: '' } as EmployeeDTO
)
fetchData()
</script>

<style scoped>
.page { display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
</style>
