<template>
  <el-card>
    <template #header><div class="card-header"><span>角色管理</span><el-button type="primary" :icon="Plus" @click="handleAdd">新建角色</el-button></div></template>
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="code" label="编码" width="120" />
      <el-table-column prop="type" label="类型" width="80" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="success" @click="handleAssignMenus(row)">分配菜单</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑角色' : '新建角色'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="editForm.type"><el-option label="机构角色" value="ORG" /><el-option label="租户角色" value="TENANT" /><el-option label="系统角色" value="SYS" /></el-select></el-form-item>
        <el-form-item label="父角色ID"><el-input-number v-model="editForm.parent" :min="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="menuVisible" title="分配菜单" width="480px">
      <el-tree ref="treeRef" :data="menuTreeData" show-checkbox node-key="id" :props="{ label: 'name', children: 'children' }" check-strictly default-expand-all />
      <template #footer><el-button @click="menuVisible = false">取消</el-button><el-button type="primary" :loading="menuSubmitting" @click="handleMenuSubmit">保存</el-button></template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useCrud } from '@/composables/useCrud'
import { listRoles, createRole, updateRole, deleteRole, type RoleDTO } from '@/api/system/role'
import { getMenuTree, getRoleMenus } from '@/api/system/menu'
import { request } from '@/utils/request'

const { loading, submitting, tableData, dialogVisible, editForm, fetchData, handleAdd, handleEdit, handleDelete, handleSubmit } = useCrud<RoleDTO>({ list: listRoles, create: createRole, update: updateRole, delete: deleteRole }, { name: '', type: 'ORG', parent: 0, remark: '' } as RoleDTO)

const menuVisible = ref(false)
const menuSubmitting = ref(false)
const menuTreeData = ref<any[]>([])
const treeRef = ref()
const currentRoleId = ref(0)

async function handleAssignMenus(row: any) {
  currentRoleId.value = row.id
  menuVisible.value = true
  const [tree, checked]: any = await Promise.all([getMenuTree(), getRoleMenus(row.id)])
  menuTreeData.value = tree.list || tree || []
  const checkedMenus = checked.list || checked || []
  const checkedIds = checkedMenus.map((m: any) => m.id)
  setTimeout(() => treeRef.value?.setCheckedKeys(checkedIds), 100)
}
async function handleMenuSubmit() {
  menuSubmitting.value = true
  try {
    const keys = treeRef.value?.getCheckedKeys() || []
    await request({ url: `/admin/sys/role/${currentRoleId.value}`, method: 'post', data: { id: currentRoleId.value, menus: keys } })
    ElMessage.success('菜单分配成功')
    menuVisible.value = false
  } finally { menuSubmitting.value = false }
}
fetchData()
</script>
