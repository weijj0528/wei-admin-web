<template>
  <el-card>
    <template #header><div class="card-header"><span>租户管理</span><el-button type="primary" :icon="Plus" @click="handleAdd">新建租户</el-button></div></template>
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="code" label="租户编码" width="120" />
      <el-table-column prop="name" label="租户名称" />
      <el-table-column prop="platform" label="所属平台" width="120" />
      <el-table-column prop="adminName" label="管理员" width="120" />
      <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '启用' : '禁用' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="handleAdmin(row)">管理员</el-button>
          <el-button link :type="row.status === 0 ? 'danger' : 'success'" @click="handleToggleStatus(row)">{{ row.status === 0 ? '禁用' : '启用' }}</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑租户' : '新建租户'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="编码"><el-input v-model="editForm.code" :disabled="!!editForm.id" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="平台"><el-input v-model="editForm.platform" placeholder="如 SASS_MANAGE" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="adminVisible" title="设置租户管理员" width="440px">
      <el-form :model="adminForm" label-width="100px">
        <el-form-item label="管理员账号"><el-input v-model="adminForm.adminName" /></el-form-item>
        <el-form-item label="管理员密码"><el-input v-model="adminForm.adminPwd" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer><el-button @click="adminVisible = false">取消</el-button><el-button type="primary" :loading="adminSubmitting" @click="handleAdminSubmit">确定</el-button></template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useCrud } from '@/composables/useCrud'
import { listTenants, createTenant, updateTenant, deleteTenant, enableTenant, disableTenant, setTenantAdmin, type TenantDTO } from '@/api/system/tenant'
const { loading, submitting, tableData, dialogVisible, editForm, fetchData, handleAdd, handleEdit, handleDelete, handleSubmit } = useCrud<TenantDTO>({ list: listTenants, create: createTenant, update: updateTenant, delete: deleteTenant }, { code: '', name: '', platform: '', remark: '' } as TenantDTO)
const adminVisible = ref(false)
const adminSubmitting = ref(false)
const adminForm = reactive({ id: 0, adminName: '', adminPwd: '' })
function handleAdmin(row: any) { adminForm.id = row.id; adminForm.adminName = row.adminName || ''; adminForm.adminPwd = ''; adminVisible.value = true }
async function handleAdminSubmit() {
  adminSubmitting.value = true
  try {
    await setTenantAdmin({ id: adminForm.id, adminName: adminForm.adminName, adminPwd: btoa(adminForm.adminPwd) })
    ElMessage.success('管理员设置成功')
    adminVisible.value = false
    fetchData()
  } finally { adminSubmitting.value = false }
}
async function handleToggleStatus(row: any) {
  if (row.status === 0) { await disableTenant(row.id); ElMessage.success('已禁用') }
  else { await enableTenant(row.id); ElMessage.success('已启用') }
  fetchData()
}
fetchData()
</script>
