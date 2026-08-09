<template>
  <div class="schema-form">
    <!-- schema 缺失/非法：降级为 JSON 文本框（兼容旧数据） -->
    <template v-if="!fields.length">
      <el-input
        v-model="rawText"
        type="textarea"
        :rows="5"
        :disabled="disabled"
        placeholder="该字典类型未定义有效的 JSON Schema，请直接输入合法 JSON"
      />
      <div v-if="rawError" style="color: #f56c6c; font-size: 12px; margin-top: 4px">{{ rawError }}</div>
    </template>

    <!-- 按 schema 渲染表单（双列网格，数组/多选占整行） -->
    <el-form
      v-else
      ref="formRef"
      :model="formModel"
      :rules="formRules"
      :disabled="disabled"
      label-width="90px"
      class="schema-form-inner"
    >
      <el-form-item
        v-for="f in fields"
        :key="f.key"
        :prop="f.key"
        :class="{ 'full-row': isFullRow(f) }"
      >
        <template #label>
          <span class="field-label">{{ f.title || f.key }}</span>
          <el-tooltip v-if="f.description" :content="f.description" placement="top">
            <el-icon class="desc-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </template>

        <!-- 文本 -->
        <el-input
          v-if="f.fieldType === 'string'"
          v-model="formModel[f.key]"
          :maxlength="f.constraints.maxLength || undefined"
          :show-word-limit="!!f.constraints.maxLength"
          placeholder="请输入"
        />

        <!-- 数字 -->
        <el-input-number
          v-else-if="f.fieldType === 'number'"
          v-model="formModel[f.key]"
          :controls="false"
          :min="f.constraints.minimum"
          :max="f.constraints.maximum"
          placeholder="请输入数字"
          style="width: 100%"
        />

        <!-- 整数 -->
        <el-input-number
          v-else-if="f.fieldType === 'integer'"
          v-model="formModel[f.key]"
          :controls="false"
          :step="1"
          :precision="0"
          :min="f.constraints.minimum"
          :max="f.constraints.maximum"
          placeholder="请输入整数"
          style="width: 100%"
        />

        <!-- 布尔 -->
        <el-switch v-else-if="f.fieldType === 'boolean'" v-model="formModel[f.key]" />

        <!-- 日期 -->
        <el-date-picker
          v-else-if="f.fieldType === 'date'"
          v-model="formModel[f.key]"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        />

        <!-- 时间 -->
        <el-time-picker
          v-else-if="f.fieldType === 'time'"
          v-model="formModel[f.key]"
          format="HH:mm:ss"
          value-format="HH:mm:ss"
          placeholder="选择时间"
          style="width: 100%"
        />

        <!-- 日期时间 -->
        <el-date-picker
          v-else-if="f.fieldType === 'datetime'"
          v-model="formModel[f.key]"
          type="datetime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择日期时间"
          style="width: 100%"
        />

        <!-- 单选下拉 -->
        <el-select
          v-else-if="f.fieldType === 'enum'"
          v-model="formModel[f.key]"
          placeholder="请选择"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="(o, oi) in f.enumOptions"
            :key="oi"
            :label="o.label || o.value"
            :value="o.value"
          />
        </el-select>

        <!-- 多选下拉（整行） -->
        <el-select
          v-else-if="f.fieldType === 'enumMulti'"
          v-model="formModel[f.key]"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择(可多选)"
          style="width: 100%"
        >
          <el-option
            v-for="(o, oi) in f.enumOptions"
            :key="oi"
            :label="o.label || o.value"
            :value="o.value"
          />
        </el-select>

        <!-- 数组：tag 输入式（整行） -->
        <el-select
          v-else-if="f.fieldType === 'array'"
          v-model="formModel[f.key]"
          multiple
          filterable
          allow-create
          default-first-option
          collapse-tags
          collapse-tags-tooltip
          :placeholder="`输入${f.itemsType === 'string' ? '文本' : '数字'}后回车添加`"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import {
  parseSchemaSafe, schemaToFields, type SchemaField, type FieldType,
} from '@/utils/jsonSchema'

const props = withDefaults(
  defineProps<{ modelValue?: string; schema?: string; disabled?: boolean }>(),
  { disabled: false }
)
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const formRef = ref<FormInstance>()
const formModel = ref<Record<string, any>>({})
const fields = ref<SchemaField[]>([])
const requiredKeys = ref<string[]>([])
const rawText = ref('')
const rawError = ref('')

const parsedSchema = computed(() => parseSchemaSafe(props.schema))

/** 类型零值 */
function typeZero(t: FieldType): any {
  switch (t) {
    case 'number':
    case 'integer':
      return undefined
    case 'boolean':
      return false
    case 'enumMulti':
    case 'array':
      return []
    default:
      return ''
  }
}

/** 数组/多选占整行 */
function isFullRow(f: SchemaField): boolean {
  return f.fieldType === 'array' || f.fieldType === 'enumMulti'
}

function isRequired(key: string): boolean {
  return requiredKeys.value.includes(key)
}

/** 生成字段校验规则：required + 类型 + 约束 */
function fieldRules(f: SchemaField): any[] {
  const rules: any[] = []
  if (isRequired(f.key)) {
    rules.push({ required: true, message: '必填项', trigger: ['blur', 'change'] })
  }
  if (f.fieldType === 'number' || f.fieldType === 'integer') {
    rules.push({
      validator: (_r: any, v: any, cb: (e?: Error) => void) => {
        if (v === undefined || v === null || v === '') return cb()
        if (Number.isNaN(Number(v))) return cb(new Error('须为数字'))
        cb()
      },
      trigger: ['blur', 'change'],
    })
    if (f.constraints.minimum !== undefined || f.constraints.maximum !== undefined) {
      rules.push({
        validator: (_r: any, v: any, cb: (e?: Error) => void) => {
          if (v === undefined || v === null || v === '') return cb()
          const n = Number(v)
          if (f.constraints.minimum !== undefined && n < f.constraints.minimum) return cb(new Error(`不能小于 ${f.constraints.minimum}`))
          if (f.constraints.maximum !== undefined && n > f.constraints.maximum) return cb(new Error(`不能大于 ${f.constraints.maximum}`))
          cb()
        },
        trigger: ['blur', 'change'],
      })
    }
  }
  if (['string', 'date', 'time', 'datetime', 'enum'].includes(f.fieldType)) {
    if (f.constraints.minLength !== undefined || f.constraints.maxLength !== undefined) {
      rules.push({
        validator: (_r: any, v: any, cb: (e?: Error) => void) => {
          if (v === undefined || v === null) return cb()
          const len = String(v).length
          if (f.constraints.minLength !== undefined && len < f.constraints.minLength) return cb(new Error(`不少于 ${f.constraints.minLength} 字符`))
          if (f.constraints.maxLength !== undefined && len > f.constraints.maxLength) return cb(new Error(`不超过 ${f.constraints.maxLength} 字符`))
          cb()
        },
        trigger: ['blur', 'change'],
      })
    }
    if (f.constraints.pattern) {
      rules.push({ pattern: new RegExp(f.constraints.pattern), message: '格式不正确', trigger: ['blur', 'change'] })
    }
  }
  return rules
}

const formRules = computed<Record<string, any[]>>(() => {
  const r: Record<string, any[]> = {}
  fields.value.forEach((f) => { r[f.key] = fieldRules(f) })
  return r
})

/** 序列化前清洗：array 按 itemsType 转换元素类型 */
function sanitizeModel(): Record<string, any> {
  const out: Record<string, any> = {}
  fields.value.forEach((f) => {
    let v = formModel.value[f.key]
    if (f.fieldType === 'array' && Array.isArray(v)) {
      v = v.map((x) => (f.itemsType === 'string' ? String(x) : Number(x)))
    }
    out[f.key] = v
  })
  return out
}

/** 根据 schema + modelValue 构建 formModel */
function buildFormModel() {
  const schema = parsedSchema.value
  if (!schema) {
    formModel.value = {}
    fields.value = []
    requiredKeys.value = []
    return
  }
  const { fields: fs } = schemaToFields(schema)
  fields.value = fs
  requiredKeys.value = Array.isArray(schema.required) ? schema.required : []
  const existing = parseSchemaSafe(props.modelValue) || {}
  const model: Record<string, any> = {}
  fs.forEach((f) => {
    let val: any
    if (existing[f.key] !== undefined && existing[f.key] !== null) val = existing[f.key]
    else if (f.default !== undefined && f.default !== null && f.default !== '') val = f.default
    else val = typeZero(f.fieldType)
    // array 统一为 string[]（el-select allow-create 输入为 string）
    if (f.fieldType === 'array' && Array.isArray(val)) val = val.map(String)
    model[f.key] = val
  })
  formModel.value = model
}

/** schema 变化 -> 重建表单 */
watch(() => props.schema, buildFormModel, { immediate: true })

/** modelValue 外部变化 -> 同步（防循环） */
watch(
  () => props.modelValue,
  (val) => {
    if (!parsedSchema.value) {
      rawText.value = val || ''
      rawError.value = val ? '' : ''
      return
    }
    const curStr = JSON.stringify(sanitizeModel())
    const newStr = JSON.stringify(parseSchemaSafe(val))
    if (curStr !== newStr) buildFormModel()
  }
)

/** 降级模式 rawText 同步 */
watch(rawText, (val) => {
  if (!parsedSchema.value) {
    rawError.value = ''
    if (val) {
      try {
        JSON.parse(val)
        emit('update:modelValue', val)
      } catch (e: any) {
        rawError.value = 'JSON 格式错误: ' + e.message
      }
    } else {
      emit('update:modelValue', '')
    }
  }
})

/** formModel 变化 -> 序列化 emit */
watch(
  formModel,
  () => {
    if (!parsedSchema.value) return
    const str = JSON.stringify(sanitizeModel())
    if (str !== props.modelValue) emit('update:modelValue', str)
  },
  { deep: true }
)

/** 提交前校验：el-form rules（required + 类型 + 约束） */
async function validate(): Promise<boolean> {
  if (!parsedSchema.value) {
    if (rawText.value) {
      try {
        JSON.parse(rawText.value)
      } catch (e: any) {
        ElMessage.error('JSON 格式错误: ' + e.message)
        return false
      }
    }
    return true
  }
  if (!formRef.value) return true
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

defineExpose({ validate })
</script>

<style scoped>
.schema-form { width: 100%; }
.schema-form :deep(.schema-form-inner) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 16px;
}
.schema-form :deep(.el-form-item) {
  margin-bottom: 0;
}
.schema-form :deep(.el-form-item.full-row) {
  grid-column: 1 / -1;
}
.field-label { margin-right: 2px; }
.desc-icon {
  font-size: 14px;
  color: #909399;
  cursor: help;
  vertical-align: middle;
}
@media (max-width: 720px) {
  .schema-form :deep(.schema-form-inner) {
    grid-template-columns: 1fr;
  }
}
</style>
