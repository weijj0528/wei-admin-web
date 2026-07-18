<template>
  <ListLayout title="字典项列表" :page="pagination" @page-change="handlePageChange" @size-change="handleSizeChange">
    <template #search>
      <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    </template>
    <template #actions>
      <el-button v-permission="['dict:item:save']" type="primary" :icon="Plus" @click="handleAdd">新建项</el-button>
    </template>
    <el-table :data="tableData" v-loading="loading" stripe height="100%">
      <el-table-column prop="typeCode" label="类型编码" width="150" />
      <el-table-column prop="code" label="项编码" width="120" />
      <el-table-column prop="name" label="项名称" />
      <el-table-column prop="value" label="项值" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="['dict:item:update']" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button v-permission="['dict:item:delete']" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无字典项" /></template>
    </el-table>
    <template #dialog>
      <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑项' : '新建项'" width="480px">
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="类型编码" required><el-input v-model="editForm.typeCode" /></el-form-item>
          <el-form-item label="项编码"><el-input v-model="editForm.code" /></el-form-item>
          <el-form-item label="项名称" required><el-input v-model="editForm.name" /></el-form-item>
          <el-form-item label="项值"><el-input v-model="editForm.value" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="editForm.sort" :min="0" /></el-form-item>
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
import { listDictItems, createDictItem, updateDictItem, deleteDictItem, type DictDTO } from '@/api/dict'

const fields = [
  { prop: 'typeCode', label: '类型编码' },
  { prop: 'name', label: '项名称' },
]
const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<DictDTO>(
  { list: listDictItems, create: createDictItem, update: updateDictItem, delete: deleteDictItem },
  { typeCode: '', code: '', name: '', value: '', sort: 0 } as DictDTO
)
fetchData()
</script>
