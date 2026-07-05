<template>
  <el-card>
    <template #header><div class="card-header"><span>机构管理</span><el-button type="primary" :icon="Plus" @click="handleAdd">新建</el-button></div></template>
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="code" label="机构编码" width="150" />
      <el-table-column prop="name" label="机构名称" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }"><el-button link type="primary" @click="handleEdit(row)">编辑</el-button><el-button link type="danger" @click="handleDelete(row)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑机构' : '新建机构'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="编码"><el-input v-model="editForm.code" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useCrud } from '@/composables/useCrud'
import { listOrgs, createOrg, updateOrg, deleteOrg, type OrgInfoDTO } from '@/api/org/info'
const { loading, submitting, tableData, dialogVisible, editForm, fetchData, handleAdd, handleEdit, handleDelete, handleSubmit } = useCrud<OrgInfoDTO>({ list: listOrgs, create: createOrg, update: updateOrg, delete: deleteOrg }, { code: '', name: '', remark: '' } as OrgInfoDTO)
fetchData()
</script>
