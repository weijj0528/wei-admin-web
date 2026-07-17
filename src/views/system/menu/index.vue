<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>菜单树</span>
          <div class="header-tools">
            <el-select
              v-model="selectedPlatform"
              placeholder="选择管理平台"
              class="platform-select"
              @change="onPlatformChange"
            >
              <template #prefix><el-icon><Grid /></el-icon></template>
              <el-option v-for="p in platforms" :key="p.code" :label="p.name" :value="p.code" />
            </el-select>
            <el-button type="primary" :icon="Plus" @click="handleAdd">新建菜单</el-button>
          </div>
        </div>
      </template>
      <div class="menu-layout">
        <el-tabs v-model="activeModuleId" tab-position="left" class="module-tabs">
          <el-tab-pane v-for="m in tableData" :key="m.id" :label="m.name" :name="String(m.id)" />
        </el-tabs>
        <div class="menu-table-wrap">
          <el-table
            :data="filteredTree"
            v-loading="loading"
            row-key="id"
            :tree-props="{ children: 'children' }"
            stripe
            default-expand-all
            height="100%"
          >
            <el-table-column prop="name" label="菜单名称" width="220">
              <template #header>
                <el-input v-model="filterText" placeholder="菜单名称" clearable :prefix-icon="Search" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="90">
              <template #default="{ row }">
                <el-tag :type="typeTag(row.type)" effect="light" size="small">{{ typeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="编码" width="120" />
            <el-table-column prop="routePath" label="路由" show-overflow-tooltip />
            <el-table-column prop="component" label="组件" show-overflow-tooltip />
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column label="基础" width="70">
              <template #default="{ row }">
                <el-tag v-if="row.baseMenu === 1" type="success" effect="light" size="small">是</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.type !== 'FUNC'" link type="success" @click="handleAddChild(row)">新增子级</el-button>
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
            <template #empty><el-empty description="暂无菜单" /></template>
          </el-table>
        </div>
      </div>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑菜单' : '新建菜单'" width="560px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="editForm.type">
            <el-option label="模块" value="MODULE" />
            <el-option label="分组" value="GROUP" />
            <el-option label="页面" value="PAGE" />
            <el-option label="功能" value="FUNC" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" required><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="图标">
          <IconPicker v-model="editForm.icon" />
        </el-form-item>
        <el-form-item label="父级">
          <el-tree-select
            v-model="editForm.parent"
            :data="parentTreeData"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            :render-after-expand="false"
            placeholder="选择父级（顶层为无父级）"
            class="parent-select"
            @change="onParentChange"
          />
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="editForm.platform" disabled>
            <el-option v-for="p in platforms" :key="p.code" :label="p.name" :value="p.code" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="editForm.type === 'FUNC'" label="功能标识">
          <el-input v-model="editForm.routeName" placeholder="如 Save" />
          <span class="tip">完整标识：{{ funcPerm || '请填功能标识并选父页面' }}</span>
        </el-form-item>
        <el-form-item v-else label="路由"><el-input v-model="editForm.routePath" placeholder="如 /system/platform" /></el-form-item>
        <el-form-item label="组件"><el-input v-model="editForm.component" /></el-form-item>
        <el-form-item label="API接口">
          <el-select v-model="editForm.apiList" multiple filterable clearable placeholder="选择需要的接口" class="api-select">
            <el-option v-for="a in sysApis" :key="a.id" :label="`${a.name}(${a.path})`" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="editForm.sort" :min="0" /></el-form-item>
        <el-form-item label="基础菜单">
          <el-switch v-model="editForm.baseMenu" :active-value="1" :inactive-value="0" />
          <span class="tip">仅 SAAS管理平台 的基础菜单将作为新平台模板</span>
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
import { Plus, Grid, Search } from '@element-plus/icons-vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useCrud } from '@/composables/useCrud'
import { useAppStore } from '@/store/app'
import { createMenu, updateMenu, deleteMenu, getMenuTree, getMenu, listSysApi, type MenuDTO, type SysApiVO } from '@/api/system/menu'
import { listPlatforms } from '@/api/system/platform'
import type { PlatformVO } from '@/api/auth'
import IconPicker from '@/components/IconPicker.vue'

const appStore = useAppStore()
/** 平台选项与「平台管理」同源（/admin/sys/platform 全量），避免与 /admin/auth/platforms 的可访问子集不一致 */
const platforms = ref<PlatformVO[]>([])
/** 系统接口选项（菜单 API 配置多选用） */
const sysApis = ref<SysApiVO[]>([])
/** 本页独立选择的管理平台，与 Header 全局平台解耦：直接管理指定平台的菜单 */
const selectedPlatform = ref(appStore.currentPlatform || '')
const {
  loading, submitting, tableData, dialogVisible, editForm,
  fetchData, handleAdd: _handleAdd, handleEdit: _handleEdit, handleDelete, handleSubmit: _handleSubmit,
} = useCrud<MenuDTO>(
  { list: getMenuTree, create: createMenu, update: updateMenu, delete: deleteMenu },
  { type: 'MODULE', name: '', parent: 0, platform: '', icon: '', iconType: 0, routeName: '', routePath: '', component: '', sort: 0, baseMenu: 0, apiList: [] } as MenuDTO,
  { clientSidePagination: false }
)
/** 子级类型推断：模块->分组->页面->按钮 */
const CHILD_TYPE: Record<string, string> = { MODULE: 'GROUP', GROUP: 'PAGE', PAGE: 'FUNC' }
/** 当前选中的模块 tab（顶层 MODULE id 字符串） */
const activeModuleId = ref<string>('')
/** el-table 仅渲染当前选中模块的子树，菜单多时聚焦操作 */
const currentModuleTree = computed(() => {
  if (!activeModuleId.value) return tableData.value
  const m = tableData.value.find(x => String(x.id) === activeModuleId.value)
  return m ? [m] : tableData.value
})
/** 菜单名称前端过滤关键字 */
const filterText = ref('')
/** 递归过滤树：name 命中关键字则保留整棵子树；否则仅保留命中子树（保留祖先链） */
function filterTree(nodes: any[], keyword: string): any[] {
  if (!keyword) return nodes
  const kw = keyword.toLowerCase()
  const result: any[] = []
  for (const n of nodes) {
    const matched = (n.name || '').toLowerCase().includes(kw)
    const children = n.children ? filterTree(n.children, keyword) : []
    if (matched || children.length) {
      result.push({ ...n, children: matched ? n.children : children })
    }
  }
  return result
}
/** 当前模块子树按名称过滤后的结果 */
const filteredTree = computed(() => filterTree(currentModuleTree.value, filterText.value.trim()))
/** 父级树选择数据：虚拟顶层节点 + 当前平台完整菜单树 */
const parentTreeData = computed(() => [
  { id: 0, name: '顶层（无父级）', children: tableData.value },
])
// tableData 变化时默认选中第一个模块（当前选中丢失则回退首个）
watch(tableData, (data) => {
  if (data.length && !data.some(x => String(x.id) === activeModuleId.value)) {
    activeModuleId.value = String(data[0].id)
  }
})
// 递归查找节点类型
function findNodeType(nodes: any[], id: number): string | null {
  for (const n of nodes) {
    if (n.id === id) return n.type
    if (n.children) {
      const t = findNodeType(n.children, id)
      if (t) return t
    }
  }
  return null
}
// 递归查找节点（用于获取父页面 routePath 生成功能标识前缀）
function findNode(nodes: any[], id: number): any {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const f = findNode(n.children, id)
      if (f) return f
    }
  }
  return null
}
/** FUNC 功能权限标识：父页面 routePath 前缀 + routeName 小写
 *  例：父 /system/platform + routeName Save -> system:platform:save */
const funcPerm = computed(() => {
  if (editForm.type !== 'FUNC' || !editForm.parent) return ''
  const parent = findNode(tableData.value, editForm.parent)
  const parentRoute = parent?.routePath || ''
  const prefix = parentRoute.replace(/^\//, '').replace(/\//g, ':')
  const name = (editForm.routeName || '').trim().toLowerCase()
  if (!name) return prefix ? `${prefix}:` : ''
  return prefix ? `${prefix}:${name}` : name
})
// 选父级后自动推断子级类型：顶层->MODULE，否则按父级 type 映射
function onParentChange(val: any) {
  const parentId = Number(val)
  if (!parentId || parentId === 0) {
    editForm.type = 'MODULE'
    return
  }
  const parentType = findNodeType(tableData.value, parentId)
  if (parentType) editForm.type = CHILD_TYPE[parentType] || editForm.type || 'MODULE'
}
// 编辑：树 row 不含 apiList，查详情回显
async function handleEdit(row: any) {
  _handleEdit(row)
  try {
    const detail: any = await getMenu(row.id)
    editForm.apiList = detail?.apiList || []
  } catch { /* 拉取失败不阻塞 */ }
}
// 提交：FUNC 类型自动用 funcPerm 覆盖 routePath（完整权限标识）
async function handleSubmit() {
  if (editForm.type === 'FUNC') {
    editForm.routePath = funcPerm.value
  }
  await _handleSubmit()
}
// 顶层新建默认带入当前管理平台，避免空 platform 触发后端"平台选择不正确"
function handleAdd() {
  _handleAdd()
  if (!editForm.id) editForm.platform = selectedPlatform.value
}
function handleAddChild(row: any) {
  handleAdd()
  editForm.parent = row.id
  editForm.platform = row.platform
  // 子级类型按父级推断：模块->分组->页面->按钮
  editForm.type = CHILD_TYPE[row.type] || row.type
}
// 显式按所选平台加载菜单树：后端 /all 仅在 platform 为空时回退 token 平台，
// 本页自行管理平台选择，不依赖 Header 全局切换的 token 时序。
async function onPlatformChange() {
  await fetchData({ platform: selectedPlatform.value })
}
onMounted(async () => {
  // 拉取全量平台作为下拉选项，与「平台管理」页同源（/admin/sys/platform）
  try {
    const res: any = await listPlatforms({ page: 1, size: 1000 })
    platforms.value = res.list || []
  } catch { /* 拉取失败不阻塞 */ }
  try {
    const res: any = await listSysApi({ page: 1, size: 1000 })
    sysApis.value = res.list || []
  } catch { /* 拉取失败不阻塞 */ }
  if (!selectedPlatform.value) {
    selectedPlatform.value = platforms.value[0]?.code || ''
  }
  await fetchData({ platform: selectedPlatform.value })
})

function typeLabel(t?: string) {
  return { MODULE: '模块', GROUP: '分组', PAGE: '页面', FUNC: '功能' }[t || ''] || t || '-'
}
function typeTag(t?: string) {
  return ({ MODULE: 'primary', GROUP: 'success', PAGE: 'info', FUNC: 'warning' }[t || ''] || 'info') as any
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
.header-tools { display: flex; align-items: center; gap: var(--space-3); }
.platform-select { width: 200px; }
.menu-layout { display: flex; align-items: flex-start; gap: 8px; flex: 1; min-height: 0; overflow: hidden; }
.module-tabs { flex-shrink: 0; }
.module-tabs :deep(.el-tabs__content) { display: none; }
.module-tabs :deep(.el-tabs__header) { margin: 0; }
.module-tabs :deep(.el-tabs__header.is-left) { margin-right: 0; }
.module-tabs :deep(.el-tabs__item.is-left) { padding: 0 12px; }
.menu-table-wrap { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; align-self: stretch; }
.parent-select { width: 100%; }
.api-select { width: 100%; }
.tip { margin-left: 8px; font-size: 12px; color: var(--text-tertiary); }
</style>
