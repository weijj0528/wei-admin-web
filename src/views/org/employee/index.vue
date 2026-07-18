<template>
  <div class="page">
    <el-card class="dept-card" shadow="never">
      <template #header><span class="card-title">部门</span></template>
      <el-input v-model="deptFilter" placeholder="搜索部门" clearable size="small" style="margin-bottom: 8px" />
      <el-tree
        ref="treeRef"
        :data="deptTree"
        :props="{ label: 'name', children: 'children' }"
        :filter-node-method="filterDept"
        node-key="id"
        highlight-current
        default-expand-all
        :expand-on-click-node="false"
        @node-click="handleDeptClick"
      />
    </el-card>
    <div class="main">
      <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
      <el-card shadow="never" class="table-card">
        <template #header>
          <div class="card-header">
            <span>{{ currentDeptName ? `${currentDeptName} - 员工列表` : '员工列表' }}</span>
            <el-button v-permission="['org:employee:save']" type="primary" :icon="Plus" @click="handleAdd">新建员工</el-button>
          </div>
        </template>
        <el-table :data="tableData" v-loading="loading" stripe height="100%">
          <el-table-column prop="code" label="员工编码" width="120" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="userName" label="账号" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button v-permission="['org:employee:update']" link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button v-permission="['org:employee:delete']" link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty><el-empty description="暂无员工" /></template>
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
    </div>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑员工' : '新建员工'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名" required><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="账号" required><el-input v-model="editForm.userName" /></el-form-item>
        <el-form-item v-if="!editForm.id" label="密码"><el-input v-model="editForm.pwd" type="password" show-password /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.roles" multiple filterable placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-tree-select
            v-model="editForm.departments"
            :data="deptTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            multiple
            check-strictly
            filterable
            clearable
            placeholder="请选择部门"
            style="width: 100%"
          />
        </el-form-item>
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
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import SearchBar from '@/components/SearchBar.vue'
import { useCrud } from '@/composables/useCrud'
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployee, type EmployeeDTO } from '@/api/org/employee'
import { listRoles } from '@/api/system/role'
import { getDepartmentTree } from '@/api/org/department'

const fields = [
  { prop: 'name', label: '姓名' },
  { prop: 'userName', label: '账号' },
]
const roleOptions = ref<any[]>([])
const deptTree = ref<any[]>([])
const deptFilter = ref('')
const currentDeptName = ref('')
const treeRef = ref()

const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd: _handleAdd, handleDelete, handleSubmit,
} = useCrud<EmployeeDTO>(
  { list: listEmployees, create: createEmployee, update: updateEmployee, delete: deleteEmployee },
  { name: '', userName: '', pwd: '', remark: '', roles: [], departments: [] } as EmployeeDTO
)

async function loadRoleOptions() {
  try {
    const res = await listRoles({ currentTenant: true })
    roleOptions.value = Array.isArray(res) ? res : (res.list || res.records || [])
  } catch { roleOptions.value = [] }
}

async function loadDeptTree() {
  try {
    const res = await getDepartmentTree()
    deptTree.value = Array.isArray(res) ? res : (res.list || res.records || [])
  } catch { deptTree.value = [] }
}

// 部门树本地过滤
watch(deptFilter, (val) => {
  treeRef.value?.filter(val)
})
function filterDept(value: string, data: any) {
  if (!value) return true
  return data.name?.includes(value)
}

// 点击部门节点 → 按 departmentId 筛选员工；根部门不筛选（展示所有员工）
function handleDeptClick(data: any) {
  currentDeptName.value = data.name || ''
  if (data.parent === 0 || !data.parent) {
    // 根部门：清除筛选，展示机构全部员工
    delete (search as any).departmentId
  } else {
    ;(search as any).departmentId = data.id
  }
  pagination.page = 1
  fetchData()
}

function handleAdd() {
  _handleAdd()
  loadRoleOptions()
}

async function handleEdit(row: any) {
  const detail = await getEmployee(row.id)
  Object.assign(editForm, { name: '', userName: '', pwd: '', remark: '', roles: [], departments: [] }, detail)
  dialogVisible.value = true
  loadRoleOptions()
}

// 初始化：加载部门树 + 员工列表
loadDeptTree()
fetchData()
</script>

<style scoped>
.page {
  flex: 1;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 12px;
  min-height: 0;
}
.dept-card { display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.dept-card :deep(.el-card__body) { flex: 1; overflow: auto; }
.main { display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
.table-card { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.table-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
.card-title { font-weight: 600; }
</style>
