<template>
  <ListLayout title="类型列表" :page="pagination" @page-change="handlePageChange" @size-change="handleSizeChange">
    <template #search>
      <SearchBar :model="search" :fields="fields" @search="handleSearch" @reset="handleReset" />
    </template>
    <template #actions>
      <el-button v-permission="['dict:type:save']" type="primary" :icon="Plus" @click="handleAdd">新建类型</el-button>
    </template>
    <el-table :data="tableData" v-loading="loading" stripe height="100%">
      <el-table-column prop="code" label="类型编码" width="160" />
      <el-table-column prop="name" label="类型名称" width="160" />
      <el-table-column prop="dataType" label="数据类型" width="120">
        <template #default="{ row }">
          <el-tag :type="dataTypeTagType(row.dataType)" size="small">{{ dataTypeLabel(row.dataType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="validationRule" label="校验规则" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="['dict:type:update']" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button v-permission="['dict:type:delete']" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无字典类型" /></template>
    </el-table>
    <template #dialog>
      <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑类型' : '新建类型'" width="880px">
        <el-form :model="editForm" label-width="100px">
          <el-form-item label="编码" required><el-input v-model="editForm.code" /></el-form-item>
          <el-form-item label="名称" required><el-input v-model="editForm.name" /></el-form-item>
          <el-form-item label="数据类型">
            <el-select v-model="editForm.dataType" placeholder="选择数据类型" style="width: 100%" @change="onDataTypeChange">
              <el-option v-for="opt in dataTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="校验规则">
            <template v-if="editForm.dataType === 'OBJECT'">
              <JsonSchemaBuilder v-model="editForm.validationRule" />
            </template>
            <template v-else>
              <el-input v-model="editForm.validationRule" placeholder="正则表达式，例如 ^\d+$" />
              <div class="regex-presets">
                <span class="preset-label">常用：</span>
                <el-tag v-for="p in regexPresets" :key="p.value" size="small" class="preset-tag"
                  effect="plain" @click="editForm.validationRule = p.value">{{ p.label }}</el-tag>
              </div>
            </template>
          </el-form-item>
          <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
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
import { Plus } from '@element-plus/icons-vue'
import SearchBar from '@/components/SearchBar.vue'
import ListLayout from '@/components/ListLayout.vue'
import JsonSchemaBuilder from '@/components/JsonSchemaBuilder.vue'
import { useCrud } from '@/composables/useCrud'
import { listDictTypes, createDictType, updateDictType, deleteDictType, type DictTypeDTO } from '@/api/dict'

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

const dataTypeTagType = (t: string) => {
  const map: Record<string, string> = { STRING: '', NUMBER: 'success', BOOLEAN: 'warning', DATE: 'info', TIME: 'info', DATETIME: 'info', OBJECT: 'danger' }
  return (map[t] ?? '') as any
}

const regexPresets = [
  { label: '纯数字', value: '^\\d+$' },
  { label: '字母数字', value: '^[a-zA-Z0-9]+$' },
  { label: '邮箱', value: '^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$' },
  { label: '手机号', value: '^1[3-9]\\d{9}$' },
  { label: 'URL', value: '^https?://.+' },
  { label: '布尔值', value: '^(true|false|0|1)$' },
  { label: '日期', value: '^\\d{4}-\\d{2}-\\d{2}$' },
  { label: '时间', value: '^\\d{2}:\\d{2}(:\\d{2})?$' },
  { label: '日期时间', value: '^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}' },
  { label: '整数(含负)', value: '^-?\\d+$' },
  { label: '小数', value: '^-?\\d+(\\.\\d+)?$' },
]

const fields = [
  { prop: 'name', label: '名称' },
  { prop: 'code', label: '编码' },
]

const {
  loading, submitting, tableData, dialogVisible, editForm, search, pagination,
  fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
  handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<DictTypeDTO>(
  { list: listDictTypes, create: createDictType, update: updateDictType, delete: deleteDictType },
  { id: undefined, code: '', name: '', remark: '', dataType: 'STRING', validationRule: '' } as DictTypeDTO
)

// 切换数据类型时清空校验规则，避免正则与 JSON Schema 串用
// 用 @change 而非 watch，避免编辑回填时误清 validationRule
function onDataTypeChange() {
  editForm.validationRule = ''
}

fetchData()
</script>

<style scoped>
.regex-presets {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.preset-label { font-size: 12px; color: #909399; }
.preset-tag { cursor: pointer; }
.preset-tag:hover { color: var(--el-color-primary); border-color: var(--el-color-primary); }
</style>
