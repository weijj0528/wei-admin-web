<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>部门树</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新建部门</el-button>
        </div>
      </template>
      <el-table
        :data="tableData"
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children' }"
        stripe
        default-expand-all
      >
        <el-table-column prop="name" label="部门名称" width="220" />
        <el-table-column prop="code" label="编码" width="140" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" @click="handleAddChild(row)">新增子级</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无部门" /></template>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑部门' : '新建部门'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称" required><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="父级ID"><el-input-number v-model="editForm.parent" :min="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useCrud } from '@/composables/useCrud'
import { createDepartment, updateDepartment, deleteDepartment, getDepartmentTree, type DepartmentDTO } from '@/api/org/department'

const {
  loading, submitting, tableData, dialogVisible, editForm,
  fetchData, handleAdd, handleEdit, handleDelete, handleSubmit,
} = useCrud<DepartmentDTO>(
  { list: getDepartmentTree, create: createDepartment, update: updateDepartment, delete: deleteDepartment },
  { name: '', parent: 0, remark: '' } as DepartmentDTO,
  { clientSidePagination: false }
)
function handleAddChild(row: any) {
  handleAdd()
  editForm.parent = row.id
}
fetchData()
</script>

<style scoped>
.page { display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
</style>
