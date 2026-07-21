<template>
  <ListLayout title="接口列表" :page="pagination" @page-change="handlePageChange" @size-change="handleSizeChange">
    <template #search>
      <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    </template>
    <template #actions>
      <el-button v-permission="['system:api:save']" type="primary" :icon="Plus" @click="handleAdd">新建接口</el-button>
      <el-button v-permission="['system:api:scan']" type="warning" :icon="Refresh" :loading="scanning" @click="openScanDialog">扫描注册</el-button>
    </template>
    <el-table :data="tableData" v-loading="loading" stripe height="100%">
      <el-table-column prop="name" label="接口名称" min-width="140" />
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="path" label="地址" min-width="260" show-overflow-tooltip />
      <el-table-column prop="login" label="登录" width="70">
        <template #default="{ row }">
          <el-tag v-if="row.login === 1" type="success" size="small">需登录</el-tag>
          <el-tag v-else type="info" size="small">放行</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="['system:api:associate']" link type="primary" @click="openAssociateDrawer(row)">关联菜单</el-button>
          <el-button v-permission="['system:api:update']" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button v-permission="['system:api:delete']" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无接口" /></template>
    </el-table>
    <template #dialog>
      <!-- 新建/编辑 -->
      <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑接口' : '新建接口'" width="520px">
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="名称" required><el-input v-model="editForm.name" /></el-form-item>
          <el-form-item label="模块"><el-input v-model="editForm.module" /></el-form-item>
          <el-form-item label="地址"><el-input v-model="editForm.path" placeholder="METHOD:/route，如 POST:/admin/sys/platform" /></el-form-item>
          <el-form-item label="登录"><el-switch v-model="loginRequired" /></el-form-item>
          <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmitWithLogin">确定</el-button>
        </template>
      </el-dialog>

      <!-- 扫描注册 -->
      <el-dialog v-model="scanDialogVisible" title="扫描并注册后台 API" width="640px">
        <el-alert type="warning" :closable="false" show-icon>
          <template #default>
            将扫描所有 <code>/admin/**</code> 下的 POST/PUT/DELETE 接口并写入数据库。
            默认使用<b>智能合并</b>策略（保护人工修改）；开启「强制覆盖」后会覆盖 name/module/remark/login。
          </template>
        </el-alert>
        <div style="margin: 16px 0;">
          <el-checkbox v-model="scanForce">强制覆盖已有字段</el-checkbox>
        </div>
        <div v-if="scanResult" class="scan-result">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="新增"><el-tag type="success">{{ scanResult.inserted }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="更新"><el-tag type="warning">{{ scanResult.updated }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="跳过"><el-tag type="info">{{ scanResult.skipped }}</el-tag></el-descriptions-item>
          </el-descriptions>
          <el-table :data="scanResult.details" size="small" height="280" style="margin-top: 12px;">
            <el-table-column prop="action" label="动作" width="90">
              <template #default="{ row }">
                <el-tag :type="actionTagType(row.action)" size="small">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="method" label="方法" width="80" />
            <el-table-column prop="path" label="路径" show-overflow-tooltip />
          </el-table>
        </div>
        <template #footer>
          <el-button @click="scanDialogVisible = false">关闭</el-button>
          <el-button type="primary" :loading="scanning" @click="handleScan">开始扫描</el-button>
        </template>
      </el-dialog>

      <!-- 关联菜单 -->
      <el-drawer v-model="associateDrawerVisible" :title="`关联菜单 — ${associateApi?.name || ''}`" size="520px">
        <div v-if="associateApi" class="associate-header">
          <el-tag>{{ associateApi.path }}</el-tag>
          <el-tag type="info" style="margin-left: 8px;">模块：{{ associateApi.module || '-' }}</el-tag>
        </div>
        <el-divider />
        <div class="associate-actions">
          <el-alert type="info" :closable="false" show-icon>
            系统根据 API 所属模块推荐同平台的 <b>FUNC</b> 菜单。勾选后点「关联所选」即可批量挂载；已挂载的重复请求会自动跳过。
          </el-alert>
        </div>
        <el-table
          :data="recommendList"
          v-loading="recommendLoading"
          style="margin-top: 12px;"
          height="calc(100vh - 320px)"
          @selection-change="onRecommendSelectionChange"
        >
          <el-table-column type="selection" width="42" />
          <el-table-column prop="menuName" label="菜单名称" show-overflow-tooltip />
          <el-table-column prop="parentMenuName" label="父级" width="120" show-overflow-tooltip />
          <el-table-column prop="menuType" label="类型" width="80" />
          <template #empty><el-empty description="暂无推荐菜单" /></template>
        </el-table>
        <template #footer>
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <el-button @click="associateDrawerVisible = false">关闭</el-button>
            <el-button type="danger" :disabled="!selectedRecommendIds.length" :loading="associating" @click="handleDisassociate">解除所选</el-button>
            <el-button type="primary" :disabled="!selectedRecommendIds.length" :loading="associating" @click="handleAssociate">关联所选</el-button>
          </div>
        </template>
      </el-drawer>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import SearchBar from '@/components/SearchBar.vue'
import ListLayout from '@/components/ListLayout.vue'
import { useCrud } from '@/composables/useCrud'
import {
  listApis, createApi, updateApi, deleteApi,
  scanApis, associateApis, disassociateApis, recommendMenus,
  type ApiDTO, type RegisterResult, type MenuRecommend,
} from '@/api/system/api'

const fields = [
  { prop: 'name', label: '名称' },
  { prop: 'module', label: '模块' },
]

const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<ApiDTO>(
  { list: listApis, create: createApi, update: updateApi, delete: deleteApi },
  { name: '', module: '', path: '', login: 1, remark: '' } as ApiDTO
)

/** login 字段：后端存 0/1，UI 用布尔开关 */
const loginRequired = computed<boolean>({
  get: () => editForm.login === 1,
  set: (v) => { editForm.login = v ? 1 : 0 },
})

/** 提交时确保 login 与开关同步 */
function handleSubmitWithLogin() {
  editForm.login = loginRequired.value ? 1 : 0
  handleSubmit()
}

// -------- 扫描注册 --------
const scanDialogVisible = ref(false)
const scanning = ref(false)
const scanForce = ref(false)
const scanResult = ref<RegisterResult | null>(null)

function openScanDialog() {
  scanResult.value = null
  scanForce.value = false
  scanDialogVisible.value = true
}

async function handleScan() {
  try {
    await ElMessageBox.confirm(
      scanForce.value ? '将强制覆盖已有 name/module/remark/login。确定继续？' : '将执行智能合并注册。确定继续？',
      '扫描注册',
      { type: 'warning' }
    )
  } catch { return }
  scanning.value = true
  try {
    const res: any = await scanApis(scanForce.value)
    scanResult.value = res as RegisterResult
    ElMessage.success(`扫描完成：新增 ${res.inserted}，更新 ${res.updated}，跳过 ${res.skipped}`)
    fetchData()
  } finally {
    scanning.value = false
  }
}

function actionTagType(action: string): 'success' | 'warning' | 'info' {
  if (action === 'INSERT') return 'success'
  if (action === 'UPDATE') return 'warning'
  return 'info'
}

// -------- 关联菜单 --------
const associateDrawerVisible = ref(false)
const associateApi = ref<ApiDTO | null>(null)
const recommendList = ref<MenuRecommend[]>([])
const recommendLoading = ref(false)
const selectedRecommendIds = ref<number[]>([])
const associating = ref(false)

function openAssociateDrawer(row: ApiDTO) {
  associateApi.value = row
  associateDrawerVisible.value = true
}

watch(associateDrawerVisible, async (visible) => {
  if (!visible) {
    recommendList.value = []
    selectedRecommendIds.value = []
    return
  }
  if (!associateApi.value?.id) return
  recommendLoading.value = true
  try {
    const res: any = await recommendMenus(associateApi.value.id)
    recommendList.value = (res as MenuRecommend[]) || []
  } finally {
    recommendLoading.value = false
  }
})

function onRecommendSelectionChange(rows: MenuRecommend[]) {
  selectedRecommendIds.value = rows.map(r => r.menuId).filter(Boolean) as number[]
}

async function handleAssociate() {
  if (!associateApi.value?.id || selectedRecommendIds.value.length === 0) return
  const apiId = associateApi.value.id
  associating.value = true
  try {
    await Promise.all(
      selectedRecommendIds.value.map(menuId => associateApis(menuId, [apiId]))
    )
    ElMessage.success(`已关联 ${selectedRecommendIds.value.length} 个菜单`)
  } finally {
    associating.value = false
  }
}

async function handleDisassociate() {
  if (!associateApi.value?.id || selectedRecommendIds.value.length === 0) return
  try {
    await ElMessageBox.confirm(`将从 ${selectedRecommendIds.value.length} 个菜单上解除本 API 关联，确定继续？`, '解除关联', { type: 'warning' })
  } catch { return }
  const apiId = associateApi.value.id
  associating.value = true
  try {
    await Promise.all(
      selectedRecommendIds.value.map(menuId => disassociateApis(menuId, [apiId]))
    )
    ElMessage.success('已解除关联')
  } finally {
    associating.value = false
  }
}

fetchData()
</script>

<style scoped>
.scan-result {
  margin-top: 16px;
}
.associate-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.associate-actions {
  margin-bottom: 4px;
}
</style>
