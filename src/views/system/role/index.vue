<template>
  <div class="page">
    <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe height="100%">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="编码" width="160" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" effect="light">{{ typeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="platform" label="平台" width="140" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无角色" /></template>
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
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑角色' : '新建角色'" width="640px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="角色名称" required><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="编码"><el-input v-model="editForm.code" /></el-form-item>
        <el-form-item label="平台">
          <el-select v-model="editForm.platform" placeholder="选择平台">
            <el-option v-for="p in appStore.platforms" :key="p.code" :label="p.name" :value="p.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTreeRef"
            :data="menuTreeData"
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            show-checkbox
            default-expand-all
            class="menu-tree"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import { useCrud } from '@/composables/useCrud'
import { useAppStore } from '@/store/app'
import { listRoles, createRole, updateRole, deleteRole, type RoleDTO } from '@/api/system/role'
import { getMenuTree, getRoleMenus } from '@/api/system/menu'

const appStore = useAppStore()
// 系统角色管理：仅管理系统(SYS)与租户(TENANT)角色（均由平台/租户开通时自动生成，页面不可新建）
const fields = [
  { prop: 'name', label: '角色名称' },
]
const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleEdit: _handleEdit, handleDelete, handleSubmit: _handleSubmit,
} = useCrud<RoleDTO>(
  { list: (params: any) => listRoles({ ...params, types: ['SYS', 'TENANT'] }), create: createRole, update: updateRole, delete: deleteRole },
  { name: '', code: '', type: '', platform: '', remark: '', menus: [] } as RoleDTO
)
fetchData()

// 菜单权限树
const menuTreeRef = ref<any>(null)
const menuTreeData = ref<any[]>([])

async function loadMenuTree(platform?: string) {
  if (!platform) { menuTreeData.value = []; return }
  const res: any = await getMenuTree({ platform })
  menuTreeData.value = res.list || res || []
}

// 仅勾选角色已拥有菜单中的叶子节点，避免父节点联动全选子节点
function leafCheckedIds(tree: any[], idSet: Set<number>): number[] {
  const result: number[] = []
  const walk = (nodes: any[]) => {
    for (const n of nodes) {
      const hasChildren = n.children && n.children.length
      if (!hasChildren && idSet.has(n.id)) result.push(n.id)
      if (hasChildren) walk(n.children)
    }
  }
  walk(tree)
  return result
}

// 编辑：加载角色所属平台菜单树 + 回显已选（仅叶子，父节点自动半选）
async function handleEdit(row: any) {
  _handleEdit(row)
  const platform = row.platform || appStore.currentPlatform
  await loadMenuTree(platform)
  try {
    const res: any = await getRoleMenus(row.id)
    const ids: number[] = (res.list || res || []).map((m: any) => m.id)
    nextTick(() => menuTreeRef.value?.setCheckedKeys(leafCheckedIds(menuTreeData.value, new Set(ids))))
  } catch (e) {
    nextTick(() => menuTreeRef.value?.setCheckedKeys([]))
  }
}

// 提交：勾选(叶子) + 半选(父) 合并为角色菜单
async function handleSubmit() {
  const checked = menuTreeRef.value?.getCheckedKeys() || []
  const half = menuTreeRef.value?.getHalfCheckedKeys() || []
  editForm.menus = [...checked, ...half] as number[]
  await _handleSubmit()
}

function typeLabel(t?: string) {
  return { SYS: '系统', TENANT: '租户', ORG: '机构' }[t || ''] || t || '-'
}
function typeTag(t?: string) {
  return ({ SYS: 'danger', TENANT: 'warning', ORG: 'info' }[t || ''] || 'info') as any
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
.menu-tree { width: 100%; max-height: 320px; overflow: auto; border: 1px solid var(--border-light); border-radius: var(--radius); padding: 4px; }
</style>
