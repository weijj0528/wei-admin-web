<template>
  <div class="page">
    <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新建用户</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe height="100%">
        <el-table-column prop="name" label="用户名" width="140" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机" width="140" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.freeze === 0 ? 'success' : 'danger'" effect="light">
              {{ row.freeze === 0 ? '正常' : '冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link :type="row.freeze === 0 ? 'warning' : 'success'" @click="handleFreeze(row)">
              {{ row.freeze === 0 ? '冻结' : '解冻' }}
            </el-button>
            <el-button link type="warning" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无用户" /></template>
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
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑用户' : '新建用户'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名" required><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="editForm.nickname" /></el-form-item>
        <el-form-item label="手机"><el-input v-model="editForm.phone" /></el-form-item>
        <el-form-item v-if="!editForm.id" label="密码"><el-input v-model="editForm.pwd" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="pwdVisible" title="重置密码" width="400px">
      <el-form label-width="80px">
        <el-form-item label="新密码"><el-input v-model="newPwd" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SearchBar from '@/components/SearchBar.vue'
import { useCrud } from '@/composables/useCrud'
import { listUsers, createUser, updateUser, deleteUser, freezeUser, resetUserPwd, type UserDTO } from '@/api/user'

const fields = [
  { prop: 'name', label: '用户名' },
  { prop: 'phone', label: '手机' },
]
const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<UserDTO>(
  { list: listUsers, create: createUser, update: updateUser, delete: deleteUser },
  { name: '', nickname: '', phone: '', pwd: '' } as UserDTO
)
fetchData()

const pwdVisible = ref(false)
const newPwd = ref('')
const resetUserId = ref(0)

function handleFreeze(row: any) {
  freezeUser(row.id, row.freeze === 0 ? 1 : 0).then(() => {
    ElMessage.success('操作成功')
    fetchData()
  })
}
function handleResetPwd(row: any) {
  resetUserId.value = row.id
  newPwd.value = ''
  pwdVisible.value = true
}
async function handleResetSubmit() {
  await resetUserPwd(resetUserId.value, btoa(newPwd.value))
  ElMessage.success('密码已重置')
  pwdVisible.value = false
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
</style>
