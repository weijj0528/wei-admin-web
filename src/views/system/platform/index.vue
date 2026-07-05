<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>平台管理</span>
          <el-button v-permission="['system:platform:add']" type="primary" :icon="Plus" @click="handleAdd">新建平台</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="code" label="平台编码" width="150" />
        <el-table-column prop="name" label="平台名称" width="180" />
        <el-table-column prop="entryUrl" label="子应用入口URL" show-overflow-tooltip />
        <el-table-column prop="remark" label="描述" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="['system:platform:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['system:platform:del']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑平台' : '新建平台'" width="500px">
      <el-form :model="editForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="平台编码" prop="code">
          <el-input v-model="editForm.code" :disabled="!!editForm.id" placeholder="如 MALL" />
        </el-form-item>
        <el-form-item label="平台名称" prop="name">
          <el-input v-model="editForm.name" placeholder="如 SAAS商城" />
        </el-form-item>
        <el-form-item label="入口URL" prop="entryUrl">
          <el-input v-model="editForm.entryUrl" placeholder="http://localhost:8001" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.remark" type="textarea" />
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
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { listPlatforms, createPlatform, updatePlatform, deletePlatform, type PlatformDTO } from '@/api/system/platform'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const editForm = reactive<PlatformDTO>({
  id: undefined,
  code: '',
  name: '',
  entryUrl: '',
  remark: ''
})

const rules = {
  code: [{ required: true, message: '请输入平台编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  entryUrl: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (!value) return callback()
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return callback(new Error('URL 必须以 http:// 或 https:// 开头'))
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await listPlatforms({})
    tableData.value = res.list || res || []
  } catch (e) {
    // request 拦截器已 toast
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  Object.assign(editForm, { id: undefined, code: '', name: '', entryUrl: '', remark: '' })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  Object.assign(editForm, row)
  dialogVisible.value = true
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除平台「${row.name}」？`, '提示', { type: 'warning' })
  await deletePlatform(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editForm.id) {
        await updatePlatform(editForm.id, editForm)
        ElMessage.success('更新成功')
      } else {
        await createPlatform(editForm)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch (e) {
      // request 拦截器已 toast
    } finally {
      submitting.value = false
    }
  })
}

fetchData()
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
