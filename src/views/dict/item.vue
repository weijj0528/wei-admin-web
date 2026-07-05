<template>
  <el-card>
    <template #header><div class="card-header"><span>字典项</span><el-button type="primary" :icon="Plus" @click="handleAdd">新建</el-button></div></template>
    <div style="margin-bottom: 12px"><el-input v-model="typeCode" placeholder="按类型编码筛选" style="width: 200px" clearable @clear="fetchData()" /><el-button type="primary" @click="fetchData({ typeCode })" style="margin-left: 8px">查询</el-button></div>
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="typeCode" label="类型编码" width="150" />
      <el-table-column prop="code" label="项编码" width="120" />
      <el-table-column prop="name" label="项名称" />
      <el-table-column prop="value" label="项值" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }"><el-button link type="primary" @click="handleEdit(row)">编辑</el-button><el-button link type="danger" @click="handleDelete(row)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑项' : '新建项'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="类型编码"><el-input v-model="editForm.typeCode" /></el-form-item>
        <el-form-item label="项编码"><el-input v-model="editForm.code" /></el-form-item>
        <el-form-item label="项名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="项值"><el-input v-model="editForm.value" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="editForm.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useCrud } from '@/composables/useCrud'
import { listDictItems, createDictItem, updateDictItem, deleteDictItem, type DictDTO } from '@/api/dict'
const typeCode = ref('')
const { loading, submitting, tableData, dialogVisible, editForm, fetchData, handleAdd, handleEdit, handleDelete, handleSubmit } = useCrud<DictDTO>({ list: listDictItems, create: createDictItem, update: updateDictItem, delete: deleteDictItem }, { typeCode: '', code: '', name: '', value: '', sort: 0 } as DictDTO)
fetchData()
</script>
