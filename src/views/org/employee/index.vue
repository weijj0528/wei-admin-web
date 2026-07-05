<template>
  <el-card>
    <template #header><div class="card-header"><span>员工管理</span><el-button type="primary" :icon="Plus" @click="handleAdd">新建员工</el-button></div></template>
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="code" label="员工编码" width="120" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="userName" label="账号" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }"><el-button link type="primary" @click="handleEdit(row)">编辑</el-button><el-button link type="danger" @click="handleDelete(row)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑员工' : '新建员工'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="账号"><el-input v-model="editForm.userName" /></el-form-item>
        <el-form-item label="密码" v-if="!editForm.id"><el-input v-model="editForm.pwd" type="password" show-password /></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useCrud } from '@/composables/useCrud'
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, type EmployeeDTO } from '@/api/org/employee'
const { loading, submitting, tableData, dialogVisible, editForm, fetchData, handleAdd, handleEdit, handleDelete, handleSubmit } = useCrud<EmployeeDTO>({ list: listEmployees, create: createEmployee, update: updateEmployee, delete: deleteEmployee }, { name: '', userName: '', pwd: '', remark: '' } as EmployeeDTO)
fetchData()
</script>
