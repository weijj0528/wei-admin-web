<template>
  <div class="schema-builder">
    <!-- 警告 / 错误条 -->
    <el-alert
      v-for="(w, i) in warnings"
      :key="`w-${i}`"
      :title="w"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 6px"
    />
    <el-alert
      v-for="(e, i) in errors"
      :key="`e-${i}`"
      :title="e"
      type="error"
      :closable="false"
      show-icon
      style="margin-bottom: 6px"
    />

    <!-- 字段列表 -->
    <div v-for="(f, i) in fields" :key="i" class="field-row">
      <div class="field-main">
        <el-input v-model="f.key" placeholder="字段名(key)" class="col-key" />
        <el-input v-model="f.title" placeholder="标题(可选)" class="col-title" />
        <el-select v-model="f.fieldType" placeholder="类型" class="col-type" @change="onTypeChange(f)">
          <el-option-group v-for="g in groupedTypes" :key="g.group" :label="g.group">
            <el-option v-for="o in g.options" :key="o.value" :label="o.label" :value="o.value" />
          </el-option-group>
        </el-select>
        <el-tooltip content="是否必填" placement="top">
          <div class="col-required">
            <span class="req-label">必填</span>
            <el-switch v-model="f.required" />
          </div>
        </el-tooltip>
        <el-button link type="primary" @click="toggleExpand(i)">
          {{ expanded[i] ? '收起' : '更多' }}
        </el-button>
        <el-button link type="danger" :icon="Delete" @click="removeField(i)" />
      </div>

      <!-- 展开区 -->
      <div v-if="expanded[i]" class="field-extra">
        <el-input v-model="f.description" placeholder="说明(可选)" style="margin-bottom: 8px">
          <template #prepend>说明</template>
        </el-input>

        <!-- 默认值 -->
        <div class="extra-row">
          <span class="extra-label">默认值</span>
          <div class="extra-control">
            <!-- 文本族 -->
            <el-input
              v-if="['string'].includes(f.fieldType)"
              v-model="f.default"
              placeholder="默认值"
            />
            <el-input-number
              v-else-if="f.fieldType === 'number'"
              v-model="f.default"
              :controls="false"
              placeholder="默认值"
              style="width: 100%"
            />
            <el-input-number
              v-else-if="f.fieldType === 'integer'"
              v-model="f.default"
              :controls="false"
              :step="1"
              :precision="0"
              placeholder="默认值"
              style="width: 100%"
            />
            <el-switch v-else-if="f.fieldType === 'boolean'" v-model="f.default" />
            <el-date-picker
              v-else-if="f.fieldType === 'date'"
              v-model="f.default"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="默认日期"
              style="width: 100%"
            />
            <el-time-picker
              v-else-if="f.fieldType === 'time'"
              v-model="f.default"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="默认时间"
              style="width: 100%"
            />
            <el-date-picker
              v-else-if="f.fieldType === 'datetime'"
              v-model="f.default"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="默认日期时间"
              style="width: 100%"
            />
            <el-select
              v-else-if="f.fieldType === 'enum'"
              v-model="f.default"
              placeholder="默认值"
              clearable
              style="width: 100%"
            >
              <el-option v-for="(o, oi) in f.enumOptions" :key="oi" :label="o.label || o.value" :value="o.value" />
            </el-select>
            <el-select
              v-else-if="f.fieldType === 'enumMulti'"
              v-model="f.default"
              multiple
              placeholder="默认值(可多选)"
              style="width: 100%"
            >
              <el-option v-for="(o, oi) in f.enumOptions" :key="oi" :label="o.label || o.value" :value="o.value" />
            </el-select>
            <span v-else class="hint">数组类型不支持默认值</span>
          </div>
        </div>

        <!-- 约束：字符串族 -->
        <template v-if="['string', 'date', 'time', 'datetime', 'enum'].includes(f.fieldType)">
          <div class="extra-row">
            <span class="extra-label">长度约束</span>
            <div class="extra-control inline">
              <el-input-number v-model="f.constraints.minLength" :controls="false" placeholder="最小长度" style="width: 120px" />
              <span class="sep">~</span>
              <el-input-number v-model="f.constraints.maxLength" :controls="false" placeholder="最大长度" style="width: 120px" />
            </div>
          </div>
          <div class="extra-row">
            <span class="extra-label">正则</span>
            <div class="extra-control">
              <el-input v-model="f.constraints.pattern" placeholder="如 ^[A-Z]+$" />
            </div>
          </div>
        </template>

        <!-- 约束：数值族 -->
        <template v-if="['number', 'integer'].includes(f.fieldType)">
          <div class="extra-row">
            <span class="extra-label">范围约束</span>
            <div class="extra-control inline">
              <el-input-number v-model="f.constraints.minimum" :controls="false" :step="f.fieldType === 'integer' ? 1 : 0.1" placeholder="最小值" style="width: 140px" />
              <span class="sep">~</span>
              <el-input-number v-model="f.constraints.maximum" :controls="false" :step="f.fieldType === 'integer' ? 1 : 0.1" placeholder="最大值" style="width: 140px" />
            </div>
          </div>
        </template>

        <!-- enum 选项编辑 -->
        <template v-if="['enum', 'enumMulti'].includes(f.fieldType)">
          <div class="extra-row" style="align-items: flex-start">
            <span class="extra-label">选项</span>
            <div class="extra-control" style="flex: 1">
              <div v-for="(o, oi) in f.enumOptions" :key="oi" class="enum-row">
                <el-input v-model="o.label" placeholder="标签(可空)" style="width: 180px" />
                <el-input v-model="o.value" placeholder="值(必填)" style="flex: 1" />
                <el-button link type="danger" :icon="Delete" @click="f.enumOptions.splice(oi, 1)" />
              </div>
              <el-button size="small" :icon="Plus" @click="f.enumOptions.push({ label: '', value: '' })">新增选项</el-button>
            </div>
          </div>
        </template>

        <!-- 数组元素类型 -->
        <template v-if="['array', 'enumMulti'].includes(f.fieldType)">
          <div class="extra-row">
            <span class="extra-label">元素类型</span>
            <div class="extra-control">
              <el-radio-group v-model="f.itemsType">
                <el-radio value="string">文本</el-radio>
                <el-radio value="number">数字</el-radio>
                <el-radio value="integer">整数</el-radio>
              </el-radio-group>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="fields.length === 0" class="empty">
      <el-empty description="暂无字段，点击下方按钮添加" :image-size="60" />
    </div>

    <div class="builder-footer">
      <el-button :icon="Plus" type="primary" plain @click="addField">新增字段</el-button>
      <el-button link type="primary" @click="showPreview = !showPreview">
        {{ showPreview ? '隐藏' : '预览' }} Schema
      </el-button>
    </div>

    <el-collapse-transition>
      <pre v-if="showPreview" class="schema-preview">{{ previewText }}</pre>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import {
  createEmptyField, fieldsToSchema, schemaToFields, parseSchemaSafe, validateFields,
  FIELD_TYPE_OPTIONS, type SchemaField, type FieldType,
} from '@/utils/jsonSchema'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const fields = ref<SchemaField[]>([])
const warnings = ref<string[]>([])
const expanded = ref<Record<number, boolean>>({})
const showPreview = ref(false)

const groupedTypes = computed(() => {
  const map: Record<string, { label: string; value: FieldType }[]> = {}
  FIELD_TYPE_OPTIONS.forEach((o) => {
    ;(map[o.group] = map[o.group] || []).push({ label: o.label, value: o.value })
  })
  return Object.keys(map).map((group) => ({ group, options: map[group] }))
})

const errors = computed(() => validateFields(fields.value))

const previewText = computed(() => {
  if (fields.value.length === 0) return '{\n  "type": "object",\n  "properties": {}\n}'
  return JSON.stringify(fieldsToSchema(fields.value), null, 2)
})

/** 类型切换时重置类型相关字段，避免脏数据 */
function onTypeChange(f: SchemaField) {
  if (!['enum', 'enumMulti'].includes(f.fieldType)) f.enumOptions = []
  f.default = ['boolean'].includes(f.fieldType)
    ? false
    : ['enumMulti'].includes(f.fieldType)
      ? []
      : ''
}

function toggleExpand(i: number) {
  expanded.value[i] = !expanded.value[i]
}

function addField() {
  fields.value.push(createEmptyField())
  expanded.value[fields.value.length - 1] = true
}

function removeField(i: number) {
  fields.value.splice(i, 1)
  // 重建展开索引
  const next: Record<number, boolean> = {}
  Object.keys(expanded.value).forEach((k) => {
    const idx = Number(k)
    if (idx < i) next[idx] = expanded.value[idx]
    else if (idx > i) next[idx - 1] = expanded.value[idx]
  })
  expanded.value = next
}

/** 外部 modelValue 变化 -> 同步到 fields（仅当与当前序列化结果不同时覆盖，防循环） */
function syncFromModel() {
  const schema = parseSchemaSafe(props.modelValue)
  if (!schema) return
  const { fields: fs, warnings: ws } = schemaToFields(schema)
  const currentStr = JSON.stringify(fieldsToSchema(fields.value))
  const newStr = JSON.stringify(fieldsToSchema(fs))
  if (currentStr !== newStr) {
    fields.value = fs
    warnings.value = ws
  } else {
    warnings.value = ws
  }
}

watch(() => props.modelValue, syncFromModel, { immediate: true })

/** fields 变化 -> 序列化 emit（校验通过才 emit，防非法 schema 污染外部） */
watch(
  fields,
  () => {
    if (errors.value.length) return
    const str = JSON.stringify(fieldsToSchema(fields.value), null, 2)
    if (str !== props.modelValue) {
      emit('update:modelValue', str)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.schema-builder {
  width: 100%;
  max-height: 60vh;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 12px;
  background: var(--el-fill-color-blank);
}
.field-row {
  border-bottom: 1px dashed var(--el-border-color-lighter);
  padding: 8px 0;
}
.field-row:last-of-type {
  border-bottom: none;
}
.field-main {
  display: flex;
  align-items: center;
  gap: 8px;
}
.col-key { width: 150px; flex-shrink: 0; }
.col-title { width: 150px; flex-shrink: 0; }
.col-type { width: 130px; flex-shrink: 0; }
.col-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #909399;
}
.req-label { line-height: 1; margin-bottom: 2px; }
.field-extra {
  margin-top: 8px;
  padding: 10px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
.extra-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.extra-label {
  width: 70px;
  flex-shrink: 0;
  font-size: 13px;
  color: #606266;
  text-align: right;
}
.extra-control { flex: 1; }
.extra-control.inline { display: flex; align-items: center; }
.sep { color: #909399; padding: 0 4px; }
.enum-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.hint { color: #909399; font-size: 12px; }
.empty { padding: 10px 0; }
.builder-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.schema-preview {
  margin-top: 10px;
  max-height: 240px;
  overflow: auto;
  background: var(--el-fill-color-darker);
  color: var(--el-color-success);
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}
</style>
