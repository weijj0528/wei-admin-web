import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface CrudApi<T> {
  list: (params?: any) => Promise<any>
  create: (data: T) => Promise<any>
  update: (id: number, data: T) => Promise<any>
  delete: (id: number) => Promise<any>
}

export function useCrud<T extends Record<string, any>>(api: CrudApi<T>, defaultForm: T) {
  const loading = ref(false)
  const submitting = ref(false)
  const tableData = ref<any[]>([])
  const dialogVisible = ref(false)
  const editForm = reactive<T>({ ...defaultForm })

  async function fetchData(params?: any) {
    loading.value = true
    try {
      const res: any = await api.list(params)
      tableData.value = res.list || res || []
    } catch (e) {
      // request 拦截器已 toast
    } finally {
      loading.value = false
    }
  }

  function handleAdd() {
    Object.assign(editForm, defaultForm)
    dialogVisible.value = true
  }

  function handleEdit(row: any) {
    Object.assign(editForm, defaultForm, row)
    dialogVisible.value = true
  }

  async function handleDelete(row: any) {
    await ElMessageBox.confirm(`确认删除「${row.name || row.code || row.id}」？`, '提示', { type: 'warning' })
    await api.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
  }

  async function handleSubmit() {
    submitting.value = true
    try {
      if (editForm.id) {
        await api.update(editForm.id, { ...editForm } as T)
        ElMessage.success('更新成功')
      } else {
        await api.create({ ...editForm } as T)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch (e) {
      // request 拦截器已 toast
    } finally {
      submitting.value = false
    }
  }

  return { loading, submitting, tableData, dialogVisible, editForm, fetchData, handleAdd, handleEdit, handleDelete, handleSubmit }
}
