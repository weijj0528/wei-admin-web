<template>
  <el-card>
    <template #header><div class="card-header"><span>部门管理</span><el-button type="primary" :icon="Plus" @click="handleAdd">新建部门</el-button></div></template>
    <el-table :data="tableData" v-loading="loading" row-key="id" :tree-props="{ children: 'children' }" border>
      <el-table-column prop="name" label="部门名称" width="200" />
      <el-table-column prop="code" label="编码" width="120" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="success" @click="handleAddChild(row)">新增子级</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑部门' : '新建部门'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="父级ID"><el-input-number v-model="editForm.parent" :min="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createDepartment, updateDepartment, deleteDepartment, getDepartmentTree, type DepartmentDTO } from '@/api/org/department'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const editForm = reactive<DepartmentDTO>({ name: '', parent: 0, remark: '' })

async function fetchData() {
  loading.value = true
  try { const res: any = await getDepartmentTree(); tableData.value = res.list || res || [] }
  finally { loading.value = false }
}
function handleAdd() { Object.assign(editForm, { id: undefined, name: '', parent: 0, remark: '' }); dialogVisible.value = true }
function handleAddChild(row: any) { Object.assign(editForm, { id: undefined, name: '', parent: row.id, remark: '' }); dialogVisible.value = true }
function handleEdit(row: any) { Object.assign(editForm, row); dialogVisible.value = true }
async function handleDelete(row: any) { await deleteDepartment(row.id); ElMessage.success('删除成功'); fetchData() }
async function handleSubmit() {
  submitting.value = true
  try {
    if (editForm.id) { await updateDepartment(editForm.id, editForm); ElMessage.success('更新成功') }
    else { await createDepartment(editForm); ElMessage.success('创建成功') }
    dialogVisible.value = false; fetchData()
  } finally { submitting.value = false }
}
fetchData()
</script>
