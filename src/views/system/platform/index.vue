<template>
  <ListLayout title="平台列表" :page="pagination" @page-change="handlePageChange" @size-change="handleSizeChange">
    <template #search>
      <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    </template>
    <template #actions>
      <el-button v-permission="['system:platform:save']" type="primary" :icon="Plus" @click="handleAdd">新建平台</el-button>
    </template>
    <el-table :data="tableData" v-loading="loading" stripe height="100%">
      <el-table-column prop="code" label="平台编码" width="160" />
      <el-table-column prop="name" label="平台名称" />
      <el-table-column prop="entryUrl" label="入口URL" show-overflow-tooltip />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="['system:platform:update']" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button v-permission="['system:platform:delete']" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无平台" /></template>
    </el-table>
    <template #dialog>
      <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑平台' : '新建平台'" width="520px">
        <el-form :model="editForm" label-width="90px">
          <el-form-item label="平台编码" required><el-input v-model="editForm.code" /></el-form-item>
          <el-form-item label="平台名称" required><el-input v-model="editForm.name" /></el-form-item>
          <el-form-item label="入口URL"><el-input v-model="editForm.entryUrl" placeholder="子应用入口，如 http://host:port" /></el-form-item>
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
import { listPlatforms, createPlatform, updatePlatform, deletePlatform, type PlatformDTO } from '@/api/system/platform'

const fields = [
  { prop: 'name', label: '平台名称' },
  { prop: 'code', label: '平台编码' },
]
const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<PlatformDTO>(
  { list: listPlatforms, create: createPlatform, update: updatePlatform, delete: deletePlatform },
  { code: '', name: '', entryUrl: '', remark: '' } as PlatformDTO
)
fetchData()
</script>
