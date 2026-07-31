<template>
  <ListLayout title="字典列表" :page="pagination" @page-change="handlePageChange" @size-change="handleSizeChange">
    <template #search>
      <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    </template>
    <template #actions>
      <el-button v-permission="['dict:item:save']" type="primary" :icon="Plus" @click="handleAdd">新建项</el-button>
    </template>
    <el-table :data="tableData" v-loading="loading" stripe height="100%">
      <el-table-column prop="typeCode" label="类型编码" width="150" />
      <el-table-column prop="code" label="项编码" width="120" />
      <el-table-column prop="name" label="项名称" />
      <el-table-column prop="value" label="项值" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="['dict:item:update']" link type="primary" @click="onEdit(row)">编辑</el-button>
          <el-button v-permission="['dict:item:delete']" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无字典项" /></template>
    </el-table>
    <template #dialog>
      <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑项' : '新建项'" width="560px">
        <el-form :model="editForm" label-width="90px">
          <el-form-item label="字典类型" required>
            <el-select v-model="editForm.typeCode" placeholder="选择字典类型" filterable style="width: 100%"
              @change="onTypeChange">
              <el-option v-for="t in allTypes" :key="t.code" :label="`${t.name}（${t.code}）`" :value="t.code" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="currentType" label="值类型">
            <el-tag :type="dataTypeTagType(currentType.dataType)" size="small">{{ dataTypeLabel(currentType.dataType) }}</el-tag>
            <span v-if="currentType.validationRule" style="margin-left: 8px; color: #909399; font-size: 12px">
              {{ currentType.dataType === 'OBJECT' ? 'JSON Schema 校验' : `正则：${currentType.validationRule}` }}
            </span>
          </el-form-item>
          <el-form-item label="项编码"><el-input v-model="editForm.code" /></el-form-item>
          <el-form-item label="项名称" required><el-input v-model="editForm.name" /></el-form-item>
          <el-form-item label="项值">
            <!-- NUMBER -->
            <template v-if="currentType?.dataType === 'NUMBER'">
              <el-input-number v-model="numberValue" :controls="false" style="width: 100%"
                placeholder="请输入数字" @change="onNumberChange" />
            </template>
            <!-- BOOLEAN -->
            <template v-else-if="currentType?.dataType === 'BOOLEAN'">
              <el-radio-group v-model="editForm.value">
                <el-radio label="true">true</el-radio>
                <el-radio label="false">false</el-radio>
              </el-radio-group>
            </template>
            <!-- DATE -->
            <template v-else-if="currentType?.dataType === 'DATE'">
              <el-date-picker v-model="dateValue" type="date" placeholder="选择日期"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
            </template>
            <!-- TIME -->
            <template v-else-if="currentType?.dataType === 'TIME'">
              <el-time-picker v-model="timeValue" placeholder="选择时间"
                format="HH:mm:ss" value-format="HH:mm:ss" style="width: 100%" />
            </template>
            <!-- DATETIME -->
            <template v-else-if="currentType?.dataType === 'DATETIME'">
              <el-date-picker v-model="dateValue" type="datetime" placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </template>
            <!-- OBJECT -->
            <template v-else-if="currentType?.dataType === 'OBJECT'">
              <div style="width: 100%">
                <el-input v-model="editForm.value" type="textarea" :rows="5" placeholder="请输入合法的 JSON" />
                <div style="margin-top: 4px; display: flex; justify-content: space-between; align-items: center">
                  <span v-if="jsonError" style="color: #f56c6c; font-size: 12px">{{ jsonError }}</span>
                  <span v-else-if="editForm.value" style="color: #67c23a; font-size: 12px">JSON 格式正确</span>
                  <el-button size="small" link type="primary" @click="formatJson">格式化</el-button>
                </div>
              </div>
            </template>
            <!-- STRING / default -->
            <template v-else>
              <el-input v-model="editForm.value" placeholder="请输入值" />
            </template>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import SearchBar from '@/components/SearchBar.vue'
import ListLayout from '@/components/ListLayout.vue'
import { useCrud } from '@/composables/useCrud'
import {
  listDictItems, createDictItem, updateDictItem, deleteDictItem,
  listDictTypes,
  type DictDTO, type DictTypeDTO,
} from '@/api/dict'

const dataTypeOptions = [
  { value: 'STRING', label: '字符串' },
  { value: 'NUMBER', label: '数字' },
  { value: 'BOOLEAN', label: '布尔' },
  { value: 'DATE', label: '日期' },
  { value: 'TIME', label: '时间' },
  { value: 'DATETIME', label: '日期时间' },
  { value: 'OBJECT', label: '对象(JSON)' },
]
const dataTypeLabel = (t?: string) => dataTypeOptions.find(o => o.value === t)?.label ?? t ?? '字符串'
const dataTypeTagType = (t?: string) => {
  const map: Record<string, string> = { STRING: '', NUMBER: 'success', BOOLEAN: 'warning', DATE: 'info', TIME: 'info', DATETIME: 'info', OBJECT: 'danger' }
  return (map[t || 'STRING'] ?? '') as any
}

const fields = [
  { prop: 'typeCode', label: '类型编码' },
  { prop: 'name', label: '项名称' },
]

const allTypes = ref<DictTypeDTO[]>([])
const currentType = computed(() => allTypes.value.find(t => t.code === editForm.typeCode) ?? null)

// 中间值（用于日期/时间/数字组件绑定）
const numberValue = ref<number | undefined>(undefined)
const dateValue = ref<string>('')
const timeValue = ref<string>('')
const jsonError = ref('')

const onTypeChange = () => {
  editForm.value = ''
  numberValue.value = undefined
  dateValue.value = ''
  timeValue.value = ''
  jsonError.value = ''
}

const onNumberChange = (val: number | undefined) => {
  editForm.value = val !== undefined && val !== null ? String(val) : ''
}

const formatJson = () => {
  if (!editForm.value) return
  try {
    editForm.value = JSON.stringify(JSON.parse(editForm.value), null, 2)
    jsonError.value = ''
  } catch (e: any) {
    jsonError.value = 'JSON 格式错误: ' + e.message
  }
}

const loadTypes = async () => {
  try {
    const res = await listDictTypes({ page: 1, size: 1000 })
    allTypes.value = res.list || res || []
  } catch { allTypes.value = [] }
}
onMounted(loadTypes)

const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<DictDTO>(
  { list: listDictItems, create: createDictItem, update: updateDictItem, delete: deleteDictItem },
  { id: undefined, typeCode: '', code: '', name: '', value: '', sort: 0 } as DictDTO
)

// 编辑回填中间值
const onEdit = (row: any) => {
  handleEdit(row)
  if (row.typeCode) {
    const t = allTypes.value.find(x => x.code === row.typeCode)
    if (t?.dataType === 'NUMBER' && row.value) numberValue.value = Number(row.value)
    if (t?.dataType === 'DATE' && row.value) dateValue.value = row.value
    if (t?.dataType === 'DATETIME' && row.value) dateValue.value = row.value
    if (t?.dataType === 'TIME' && row.value) timeValue.value = row.value
  }
}

// 对话框关闭时清空
watch(dialogVisible, (v) => {
  if (!v) {
    numberValue.value = undefined
    dateValue.value = ''
    timeValue.value = ''
    jsonError.value = ''
  }
})
// 日期/时间选择 → 同步 editForm.value
watch(dateValue, (v) => { editForm.value = v || '' })
watch(timeValue, (v) => { editForm.value = v || '' })
// JSON 格式实时提示
watch(() => editForm.value, (val) => {
  jsonError.value = ''
  if (currentType.value?.dataType === 'OBJECT' && val) {
    try { JSON.parse(val) } catch (e: any) { jsonError.value = 'JSON 格式错误' }
  }
})

fetchData()
</script>
