<template>
  <el-card v-loading="loading" shadow="never" class="page">
    <template #header><span class="card-title">机构信息维护</span></template>
    <el-form
      v-if="editForm.id"
      :model="editForm"
      label-width="100px"
      style="max-width: 680px"
    >
      <el-divider content-position="left">基本信息</el-divider>
      <el-form-item label="机构编码"><el-input v-model="editForm.code" disabled /></el-form-item>
      <el-form-item label="机构名称"><el-input v-model="editForm.name" /></el-form-item>
      <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" :rows="2" /></el-form-item>

      <el-divider content-position="left">联系方式</el-divider>
      <el-form-item label="联系人"><el-input v-model="editForm.contact" /></el-form-item>
      <el-form-item label="联系电话"><el-input v-model="editForm.phone" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="editForm.email" /></el-form-item>
      <el-form-item label="地址"><el-input v-model="editForm.address" /></el-form-item>

      <el-form-item>
        <el-button v-permission="['org:info:update']" type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
    <el-empty v-else description="暂无机构信息" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listOrgs, updateOrg, type OrgInfoDTO } from '@/api/org/info'

const loading = ref(false)
const submitting = ref(false)
const editForm = reactive<OrgInfoDTO>({})

async function loadOrg() {
  loading.value = true
  try {
    const res = await listOrgs({ page: 1, size: 1 })
    const list = Array.isArray(res) ? res : (res.list || res.records || [])
    if (list.length > 0) {
      Object.assign(editForm, list[0])
    }
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!editForm.id) return
  submitting.value = true
  try {
    await updateOrg(editForm.id, { ...editForm })
    ElMessage.success('保存成功')
    loadOrg()
  } finally {
    submitting.value = false
  }
}

onMounted(loadOrg)
</script>

<style scoped>
.page { height: 100%; }
.card-title { font-weight: 600; }
</style>
