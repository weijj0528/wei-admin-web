/**
 * JSON Schema 子集工具：用于 OBJECT 字典类型的可视化构建与表单渲染。
 *
 * 支持的 JSON Schema 关键字（基础平铺，不含嵌套对象）：
 * - 顶层：{ type:"object", properties:{...}, required:[...] }
 * - property：type / format / title / description / enum / enumNames / default
 *   / minLength / maxLength / minimum / maximum / pattern / items
 *
 * 可视化字段类型与 JSON Schema 的映射见 FIELD_TYPE_OPTIONS。
 */

/** 可视化字段类型 */
export type FieldType =
  | 'string' | 'number' | 'integer' | 'boolean'
  | 'date' | 'time' | 'datetime'
  | 'enum' | 'enumMulti' | 'array'

/** 字段类型选项（带分组，供下拉使用） */
export const FIELD_TYPE_OPTIONS: { label: string; value: FieldType; group: string }[] = [
  { label: '文本', value: 'string', group: '基础' },
  { label: '数字', value: 'number', group: '基础' },
  { label: '整数', value: 'integer', group: '基础' },
  { label: '布尔', value: 'boolean', group: '基础' },
  { label: '日期', value: 'date', group: '日期时间' },
  { label: '时间', value: 'time', group: '日期时间' },
  { label: '日期时间', value: 'datetime', group: '日期时间' },
  { label: '单选下拉', value: 'enum', group: '选择' },
  { label: '多选下拉', value: 'enumMulti', group: '选择' },
  { label: '数组', value: 'array', group: '其他' },
]

export const FIELD_TYPE_LABEL: Record<FieldType, string> = FIELD_TYPE_OPTIONS.reduce(
  (m, o) => ({ ...m, [o.value]: o.label }),
  {} as Record<FieldType, string>
)

/** 下拉选项 */
export interface EnumOption { label: string; value: string }

/** 数组元素允许的基础类型 */
export type ItemsType = 'string' | 'number' | 'integer'

/** 字段约束 */
export interface FieldConstraints {
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
}

/** 字段中间态（构建器内部编辑用） */
export interface SchemaField {
  key: string
  fieldType: FieldType
  title: string
  description: string
  required: boolean
  default: any
  enumOptions: EnumOption[]
  constraints: FieldConstraints
  /** 数组/多选下拉的元素类型 */
  itemsType: ItemsType
}

/** 创建空字段 */
export function createEmptyField(): SchemaField {
  return {
    key: '',
    fieldType: 'string',
    title: '',
    description: '',
    required: false,
    default: '',
    enumOptions: [],
    constraints: {},
    itemsType: 'string',
  }
}

/** 安全解析 JSON Schema 字符串 */
export function parseSchemaSafe(str: string | null | undefined): any | null {
  if (!str || !str.trim()) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

/** 中间态字段 -> JSON Schema 对象 */
export function fieldsToSchema(fields: SchemaField[]): Record<string, any> {
  const properties: Record<string, any> = {}
  const required: string[] = []

  for (const f of fields) {
    const prop: Record<string, any> = {}
    switch (f.fieldType) {
      case 'string': prop.type = 'string'; break
      case 'number': prop.type = 'number'; break
      case 'integer': prop.type = 'integer'; break
      case 'boolean': prop.type = 'boolean'; break
      case 'date': prop.type = 'string'; prop.format = 'date'; break
      case 'time': prop.type = 'string'; prop.format = 'time'; break
      case 'datetime': prop.type = 'string'; prop.format = 'date-time'; break
      case 'enum':
        prop.type = 'string'
        prop.enum = f.enumOptions.map((o) => o.value)
        if (f.enumOptions.some((o) => o.label && o.label !== o.value)) {
          prop.enumNames = f.enumOptions.map((o) => o.label || o.value)
        }
        break
      case 'enumMulti': {
        prop.type = 'array'
        const items: Record<string, any> = { type: f.itemsType, enum: f.enumOptions.map((o) => o.value) }
        if (f.enumOptions.some((o) => o.label && o.label !== o.value)) {
          items.enumNames = f.enumOptions.map((o) => o.label || o.value)
        }
        prop.items = items
        break
      }
      case 'array':
        prop.type = 'array'
        prop.items = { type: f.itemsType }
        break
    }
    if (f.title) prop.title = f.title
    if (f.description) prop.description = f.description
    if (f.default !== undefined && f.default !== null && f.default !== '') {
      prop.default = f.default
    }
    // 字符串族约束
    if (['string', 'date', 'time', 'datetime', 'enum'].includes(f.fieldType)) {
      if (f.constraints.minLength !== undefined && f.constraints.minLength !== null) {
        prop.minLength = f.constraints.minLength
      }
      if (f.constraints.maxLength !== undefined && f.constraints.maxLength !== null) {
        prop.maxLength = f.constraints.maxLength
      }
      if (f.constraints.pattern) prop.pattern = f.constraints.pattern
    }
    // 数值族约束
    if (['number', 'integer'].includes(f.fieldType)) {
      if (f.constraints.minimum !== undefined && f.constraints.minimum !== null) {
        prop.minimum = f.constraints.minimum
      }
      if (f.constraints.maximum !== undefined && f.constraints.maximum !== null) {
        prop.maximum = f.constraints.maximum
      }
    }
    properties[f.key] = prop
    if (f.required) required.push(f.key)
  }

  const schema: Record<string, any> = { type: 'object', properties }
  if (required.length) schema.required = required
  return schema
}

/** 推断单个 property 的可视化类型，遇嵌套对象降级为 string 并收集警告 */
function detectFieldType(prop: any, warnings: string[], key: string): FieldType {
  const t = prop.type
  if (t === 'object') {
    warnings.push(`字段「${key}」为嵌套对象，已降级为文本`)
    return 'string'
  }
  if (t === 'array') {
    const items = prop.items || {}
    if (Array.isArray(items.enum)) return 'enumMulti'
    return 'array'
  }
  if (t === 'string') {
    if (prop.format === 'date') return 'date'
    if (prop.format === 'time') return 'time'
    if (prop.format === 'date-time') return 'datetime'
    if (Array.isArray(prop.enum)) return 'enum'
    return 'string'
  }
  if (t === 'number') return 'number'
  if (t === 'integer') return 'integer'
  if (t === 'boolean') return 'boolean'
  return 'string'
}

/** JSON Schema -> 中间态字段（回填，含降级容错） */
export function schemaToFields(schema: any): { fields: SchemaField[]; warnings: string[] } {
  const warnings: string[] = []
  if (!schema || typeof schema !== 'object') return { fields: [], warnings }
  const properties = schema.properties || {}
  const requiredList: string[] = Array.isArray(schema.required) ? schema.required : []

  const fields: SchemaField[] = Object.keys(properties).map((key) => {
    const prop = properties[key] || {}
    const fieldType = detectFieldType(prop, warnings, key)
    const f = createEmptyField()
    f.key = key
    f.fieldType = fieldType
    f.title = prop.title || ''
    f.description = prop.description || ''
    f.required = requiredList.includes(key)
    if (prop.default !== undefined && prop.default !== null) f.default = prop.default

    if (fieldType === 'enum') {
      const vals: string[] = Array.isArray(prop.enum) ? prop.enum.map(String) : []
      const names: string[] = Array.isArray(prop.enumNames) ? prop.enumNames : []
      f.enumOptions = vals.map((v, i) => ({ label: names[i] || v, value: v }))
    } else if (fieldType === 'enumMulti') {
      const items = prop.items || {}
      const vals: string[] = Array.isArray(items.enum) ? items.enum.map(String) : []
      const names: string[] = Array.isArray(items.enumNames) ? items.enumNames : []
      f.enumOptions = vals.map((v, i) => ({ label: names[i] || v, value: v }))
      f.itemsType = items.type === 'number' || items.type === 'integer' ? items.type : 'string'
    } else if (fieldType === 'array') {
      const items = prop.items || {}
      f.itemsType = items.type === 'number' || items.type === 'integer' ? items.type : 'string'
    }

    if (prop.minLength !== undefined) f.constraints.minLength = prop.minLength
    if (prop.maxLength !== undefined) f.constraints.maxLength = prop.maxLength
    if (prop.minimum !== undefined) f.constraints.minimum = prop.minimum
    if (prop.maximum !== undefined) f.constraints.maximum = prop.maximum
    if (prop.pattern) f.constraints.pattern = prop.pattern
    return f
  })

  return { fields, warnings }
}

/** 校验字段配置，返回错误信息列表（空表示通过） */
export function validateFields(fields: SchemaField[]): string[] {
  const errors: string[] = []
  const keySet = new Set<string>()
  const keyRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/
  fields.forEach((f, i) => {
    if (!f.key) {
      errors.push(`第 ${i + 1} 个字段缺少字段名`)
    } else if (!keyRegex.test(f.key)) {
      errors.push(`字段「${f.key}」名称非法（须字母/下划线开头，仅含字母数字下划线）`)
    } else if (keySet.has(f.key)) {
      errors.push(`字段名「${f.key}」重复`)
    } else {
      keySet.add(f.key)
    }
    if ((f.fieldType === 'enum' || f.fieldType === 'enumMulti') && f.enumOptions.length === 0) {
      errors.push(`字段「${f.key || `第${i + 1}行`}」缺少下拉选项`)
    }
  })
  return errors
}
