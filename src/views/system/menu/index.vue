<template>
  <el-card>
    <template #header><div class="card-header"><span>菜单管理</span><el-button type="primary" :icon="Plus" @click="handleAdd">新建菜单</el-button></div></template>
    <el-table :data="tableData" v-loading="loading" row-key="id" :tree-props="{ children: 'children' }" border>
      <el-table-column prop="name" label="菜单名称" width="200" />
      <el-table-column prop="type" label="类型" width="80" />
      <el-table-column prop="code" label="编码" width="120" />
      <el-table-column prop="routePath" label="路由" show-overflow-tooltip />
      <el-table-column prop="component" label="组件" show-overflow-tooltip />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="success" @click="handleAddChild(row)">新增子级</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑菜单' : '新建菜单'" width="560px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="类型"><el-select v-model="editForm.type"><el-option label="模块" value="MODULE" /><el-option label="分组" value="GROUP" /><el-option label="页面" value="PAGE" /><el-option label="功能" value="FUNC" /></el-select></el-form-item>
        <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="父级ID"><el-input-number v-model="editForm.parent" :min="0" /></el-form-item>
        <el-form-item label="平台"><el-input v-model="editForm.platform" /></el-form-item>
        <el-form-item label="路由"><el-input v-model="editForm.routePath" /></el-form-item>
        <el-form-item label="组件"><el-input v-model="editForm.component" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="editForm.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createMenu, updateMenu, deleteMenu, getMenuTree, type MenuDTO } from '@/api/system/menu'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const editForm = reactive<MenuDTO>({ type: 'PAGE', name: '', parent: 0, platform: '', routePath: '', component: '', sort: 0 })

async function fetchData() {
  loading.value = true
  try {
    const res: any = await getMenuTree()
    tableData.value = res.list || res || []
  } finally { loading.value = false }
}
function handleAdd() { Object.assign(editForm, { id: undefined, type: 'PAGE', name: '', parent: 0, platform: '', routePath: '', component: '', sort: 0 }); dialogVisible.value = true }
function handleAddChild(row: any) { Object.assign(editForm, { id: undefined, type: 'PAGE', name: '', parent: row.id, platform: row.platform, routePath: '', component: '', sort: 0 }); dialogVisible.value = true }
function handleEdit(row: any) { Object.assign(editForm, row); dialogVisible.value = true }
async function handleDelete(row: any) {
  await deleteMenu(row.id); ElMessage.success('删除成功'); fetchData()
}
async function handleSubmit() {
  submitting.value = true
  try {
    if (editForm.id) { await updateMenu(editForm.id, editForm); ElMessage.success('更新成功') }
    else { await createMenu(editForm); ElMessage.success('创建成功') }
    dialogVisible.value = false; fetchData()
  } finally { submitting.value = false }
}
fetchData()
</script>
