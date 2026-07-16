<template>
  <div class="page">
    <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>租户列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新建租户</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="code" label="租户编码" width="180" />
        <el-table-column prop="name" label="租户名称" />
        <el-table-column prop="platform" label="平台" width="140" />
        <el-table-column prop="adminName" label="管理员" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" effect="light">
              {{ row.status === 0 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 0" link type="success" @click="toggle(row, true)">启用</el-button>
            <el-button v-else link type="warning" @click="toggle(row, false)">禁用</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无租户" /></template>
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
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑租户' : '新建租户'" width="520px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="租户编码">
          <el-input v-model="editForm.code" disabled :placeholder="editForm.id ? '' : '保存后自动生成'" />
        </el-form-item>
        <el-form-item label="租户名称" required><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="平台" required>
          <el-select v-model="editForm.platform" placeholder="选择平台" :disabled="!!editForm.id">
            <el-option v-for="p in platforms" :key="p.code" :label="p.name" :value="p.code" />
          </el-select>
        </el-form-item>
        <template v-if="!editForm.id">
          <el-form-item label="管理员账号" required>
            <el-input v-model="editForm.adminName" placeholder="登录账号" />
          </el-form-item>
          <el-form-item label="管理员密码" required>
            <el-input v-model="adminPwdInput" type="password" show-password placeholder="登录密码" />
          </el-form-item>
        </template>
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
import { onMounted, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchBar from '@/components/SearchBar.vue'
import { useCrud } from '@/composables/useCrud'
import { listTenants, createTenant, updateTenant, deleteTenant, enableTenant, disableTenant, type TenantDTO } from '@/api/system/tenant'
import { listPlatforms } from '@/api/system/platform'
import type { PlatformVO } from '@/api/auth'

const fields = [
  { prop: 'name', label: '租户名称' },
  { prop: 'code', label: '租户编码' },
]
/** 平台选项与「平台管理」同源（/admin/sys/platform 全量），含新增平台，避免与 /admin/auth/platforms 可访问子集不一致 */
const platforms = ref<PlatformVO[]>([])
/** 新建管理员密码明文（仅前端暂存，提交时 btoa 编码，避免密文回显污染表单） */
const adminPwdInput = ref('')
const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit: _handleSubmit,
} = useCrud<TenantDTO>(
  { list: listTenants, create: createTenant, update: updateTenant, delete: deleteTenant },
  { code: '', name: '', platform: '', remark: '', adminName: '', adminPwd: '' } as TenantDTO
)
fetchData()

onMounted(async () => {
  try {
    const res: any = await listPlatforms({ page: 1, size: 1000 })
    platforms.value = res.list || []
  } catch { /* 拉取失败不阻塞 */ }
})

// 新建：校验 + Base64 编码管理员密码后提交（后端 decodeAndEncode）；编辑：清掉 adminPwd 走通用更新
async function handleSubmit() {
  if (editForm.id) {
    editForm.adminPwd = undefined
    await _handleSubmit()
    return
  }
  if (!editForm.name) { ElMessage.warning('请填写租户名称'); return }
  if (!editForm.platform) { ElMessage.warning('请选择平台'); return }
  if (!editForm.adminName) { ElMessage.warning('请填写管理员账号'); return }
  if (!adminPwdInput.value) { ElMessage.warning('请填写管理员密码'); return }
  submitting.value = true
  try {
    await createTenant({ ...editForm, adminPwd: btoa(adminPwdInput.value) } as TenantDTO)
    ElMessage.success('创建成功')
    adminPwdInput.value = ''
    dialogVisible.value = false
    fetchData()
  } catch { /* request 拦截器已 toast */ } finally {
    submitting.value = false
  }
}

async function toggle(row: TenantDTO, enable: boolean) {
  try {
    await ElMessageBox.confirm(`确认${enable ? '启用' : '禁用'}租户「${row.name || row.code}」？`, '提示', { type: 'warning' })
  } catch {
    return // 用户取消
  }
  try {
    await (enable ? enableTenant(row.id!) : disableTenant(row.id!))
    ElMessage.success(enable ? '已启用' : '已禁用')
    fetchData()
  } catch { /* request 拦截器已 toast */ }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
</style>
