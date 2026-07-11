import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface CrudApi<T> {
  list: (params?: any) => Promise<any>
  create: (data: T) => Promise<any>
  update: (id: number, data: T) => Promise<any>
  delete: (id: number) => Promise<any>
}

interface UseCrudOptions {
  pageSize?: number
  /** 列表返回数组时是否做客户端分页（树表应设 false） */
  clientSidePagination?: boolean
}

/**
 * 通用 CRUD：支持搜索、分页（服务端 {list,total} 或客户端数组）。
 * request 拦截器已拆 Result，list 拿到的就是 data。
 */
export function useCrud<T extends Record<string, any>>(
  api: CrudApi<T>,
  defaultForm: T,
  options: UseCrudOptions = {}
) {
  const loading = ref(false)
  const submitting = ref(false)
  const tableData = ref<any[]>([])
  const dialogVisible = ref(false)
  const editForm = reactive<T>({ ...defaultForm })
  const search = reactive<Record<string, any>>({})
  const pagination = reactive({
    page: 1,
    size: options.pageSize ?? 10,
    total: 0,
  })
  const clientSide = options.clientSidePagination ?? true

  async function fetchData(extra?: any) {
    loading.value = true
    try {
      const params = { ...search, page: pagination.page, size: pagination.size, ...extra }
      const res: any = await api.list(params)
      if (Array.isArray(res)) {
        // 非分页接口：返回数组
        pagination.total = res.length
        if (clientSide) {
          const start = (pagination.page - 1) * pagination.size
          tableData.value = res.slice(start, start + pagination.size)
        } else {
          tableData.value = res
        }
      } else {
        // 服务端分页：{ list, total, ... }
        tableData.value = res.list || res.records || []
        pagination.total = res.total ?? tableData.value.length
      }
    } catch (e) {
      // request 拦截器已 toast
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    pagination.page = 1
    fetchData()
  }

  function handleReset() {
    Object.keys(search).forEach((k) => (search[k] = undefined))
    pagination.page = 1
    fetchData()
  }

  function handlePageChange(p: number) {
    pagination.page = p
    fetchData()
  }

  function handleSizeChange(s: number) {
    pagination.size = s
    pagination.page = 1
    fetchData()
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
    await ElMessageBox.confirm(`确认删除「${row.name || row.code || row.id}」？`, '提示', {
      type: 'warning',
    })
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

  return {
    loading,
    submitting,
    tableData,
    dialogVisible,
    editForm,
    search,
    pagination,
    fetchData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
  }
}
