<template>
  <ListLayout title="机构列表" :page="pagination" @page-change="handlePageChange" @size-change="handleSizeChange">
    <template #search>
      <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    </template>
    <template #actions>
      <el-button v-permission="['org:info:save']" type="primary" :icon="Plus" @click="handleAdd">新建机构</el-button>
    </template>
    <el-table :data="tableData" v-loading="loading" stripe height="100%">
      <el-table-column prop="code" label="机构编码" width="160" />
      <el-table-column prop="name" label="机构名称" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="['org:info:update']" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button v-permission="['org:info:delete']" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无机构" /></template>
    </el-table>
    <template #dialog>
      <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑机构' : '新建机构'" width="480px">
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="编码" required><el-input v-model="editForm.code" /></el-form-item>
          <el-form-item label="名称" required><el-input v-model="editForm.name" /></el-form-item>
          <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import SearchBar from '@/components/SearchBar.vue'
import ListLayout from '@/components/ListLayout.vue'
import { useCrud } from '@/composables/useCrud'
import { listOrgs, createOrg, updateOrg, deleteOrg, type OrgInfoDTO } from '@/api/org/info'

const fields = [
  { prop: 'name', label: '名称' },
  { prop: 'code', label: '编码' },
]
const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<OrgInfoDTO>(
  { list: listOrgs, create: createOrg, update: updateOrg, delete: deleteOrg },
  { code: '', name: '', remark: '' } as OrgInfoDTO
)
fetchData()
</script>
