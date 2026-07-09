<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>菜单树</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新建菜单</el-button>
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
            <el-option v-for="p in appStore.platforms" :key="p.code" :label="p.name" :value="p.code" />
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
import { Plus } from '@element-plus/icons-vue'
import { watch } from 'vue'
import { useCrud } from '@/composables/useCrud'
import { useAppStore } from '@/store/app'
import { createMenu, updateMenu, deleteMenu, getMenuTree, type MenuDTO } from '@/api/system/menu'

const appStore = useAppStore()
const {
  loading, submitting, tableData, dialogVisible, editForm,
  fetchData, handleAdd: _handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<MenuDTO>(
  { list: getMenuTree, create: createMenu, update: updateMenu, delete: deleteMenu },
  { type: 'PAGE', name: '', parent: 0, platform: '', routePath: '', component: '', sort: 0, baseMenu: 0 } as MenuDTO,
  { clientSidePagination: false }
)
// 顶层新建默认带入当前平台，避免空 platform 触发后端"平台选择不正确"
function handleAdd() {
  _handleAdd()
  if (!editForm.id) editForm.platform = appStore.currentPlatform
}
function handleAddChild(row: any) {
  handleAdd()
  editForm.parent = row.id
  editForm.platform = row.platform
}
fetchData()
// 全局切换平台后自动刷新菜单列表
watch(() => appStore.currentPlatform, () => fetchData())

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
.tip { margin-left: 8px; font-size: 12px; color: var(--text-tertiary); }
</style>
