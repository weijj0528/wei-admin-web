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
      <el-table
        :data="tableData"
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children' }"
        stripe
        default-expand-all
      >
        <el-table-column prop="name" label="菜单名称" width="200" />
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
            <el-button link type="success" @click="handleAddChild(row)">新增子级</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无菜单" /></template>
      </el-table>
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
        <el-form-item label="父级ID"><el-input-number v-model="editForm.parent" :min="0" /></el-form-item>
        <el-form-item label="平台">
          <el-select v-model="editForm.platform" placeholder="选择平台">
            <el-option v-for="p in platforms" :key="p.code" :label="p.name" :value="p.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="路由"><el-input v-model="editForm.routePath" /></el-form-item>
        <el-form-item label="组件"><el-input v-model="editForm.component" /></el-form-item>
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
import { Plus, Grid } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { useCrud } from '@/composables/useCrud'
import { useAppStore } from '@/store/app'
import { createMenu, updateMenu, deleteMenu, getMenuTree, type MenuDTO } from '@/api/system/menu'
import { listPlatforms } from '@/api/system/platform'
import type { PlatformVO } from '@/api/auth'

const appStore = useAppStore()
/** 平台选项与「平台管理」同源（/admin/sys/platform 全量），避免与 /admin/auth/platforms 的可访问子集不一致 */
const platforms = ref<PlatformVO[]>([])
/** 本页独立选择的管理平台，与 Header 全局平台解耦：直接管理指定平台的菜单 */
const selectedPlatform = ref(appStore.currentPlatform || '')
const {
  loading, submitting, tableData, dialogVisible, editForm,
  fetchData, handleAdd: _handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<MenuDTO>(
  { list: getMenuTree, create: createMenu, update: updateMenu, delete: deleteMenu },
  { type: 'PAGE', name: '', parent: 0, platform: '', routePath: '', component: '', sort: 0, baseMenu: 0 } as MenuDTO,
  { clientSidePagination: false }
)
// 顶层新建默认带入当前管理平台，避免空 platform 触发后端"平台选择不正确"
function handleAdd() {
  _handleAdd()
  if (!editForm.id) editForm.platform = selectedPlatform.value
}
function handleAddChild(row: any) {
  handleAdd()
  editForm.parent = row.id
  editForm.platform = row.platform
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
.tip { margin-left: 8px; font-size: 12px; color: var(--text-tertiary); }
</style>
