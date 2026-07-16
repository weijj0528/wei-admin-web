<template>
  <div class="page">
    <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>平台列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新建平台</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe height="100%">
        <el-table-column prop="code" label="平台编码" width="160" />
        <el-table-column prop="name" label="平台名称" />
        <el-table-column prop="entryUrl" label="入口URL" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无平台" /></template>
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
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import SearchBar from '@/components/SearchBar.vue'
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

<style scoped>
.page { display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
</style>
