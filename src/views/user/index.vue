<template>
  <el-card>
    <template #header><div class="card-header"><span>用户管理</span><el-button type="primary" :icon="Plus" @click="handleAdd">新建用户</el-button></div></template>
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="name" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="phone" label="手机" width="130" />
      <el-table-column prop="freeze" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.freeze === 0 ? 'success' : 'danger'">{{ row.freeze === 0 ? '正常' : '冻结' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link :type="row.freeze === 0 ? 'warning' : 'success'" @click="handleFreeze(row)">{{ row.freeze === 0 ? '冻结' : '解冻' }}</el-button>
          <el-button link type="warning" @click="handleResetPwd(row)">重置密码</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑用户' : '新建用户'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="editForm.nickname" /></el-form-item>
        <el-form-item label="手机"><el-input v-model="editForm.phone" /></el-form-item>
        <el-form-item label="密码" v-if="!editForm.id"><el-input v-model="editForm.pwd" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="pwdVisible" title="重置密码" width="400px">
      <el-form label-width="80px"><el-form-item label="新密码"><el-input v-model="newPwd" type="password" show-password /></el-form-item></el-form>
      <template #footer><el-button @click="pwdVisible = false">取消</el-button><el-button type="primary" @click="handleResetSubmit">确定</el-button></template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useCrud } from '@/composables/useCrud'
import { listUsers, createUser, updateUser, deleteUser, freezeUser, resetUserPwd, type UserDTO } from '@/api/user'
const { loading, submitting, tableData, dialogVisible, editForm, fetchData, handleAdd, handleEdit, handleDelete, handleSubmit } = useCrud<UserDTO>({ list: listUsers, create: createUser, update: updateUser, delete: deleteUser }, { name: '', nickname: '', phone: '', pwd: '' } as UserDTO)
const pwdVisible = ref(false)
const newPwd = ref('')
const resetUserId = ref(0)
function handleFreeze(row: any) { freezeUser(row.id, row.freeze === 0 ? 1 : 0).then(() => { ElMessage.success('操作成功'); fetchData() }) }
function handleResetPwd(row: any) { resetUserId.value = row.id; newPwd.value = ''; pwdVisible.value = true }
async function handleResetSubmit() { await resetUserPwd(resetUserId.value, btoa(newPwd.value)); ElMessage.success('密码已重置'); pwdVisible.value = false }
fetchData()
</script>
