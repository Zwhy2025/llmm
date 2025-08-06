import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { apiService } from '@/services/api'

export const useApiStore = defineStore('api', () => {
  const apis = ref([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchQuery = ref('')
  const selectedApis = ref([])

  // 获取API列表
  const fetchApiList = async (params = {}) => {
    loading.value = true
    try {
      const result = await apiService.getApiList({
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value,
        ...params
      })

      if (result.success) {
        apis.value = result.data
        total.value = result.total
        currentPage.value = result.page
        pageSize.value = result.pageSize
      } else {
        ElMessage.error(result.error || '获取API列表失败')
      }
    } catch (error) {
      console.error('获取API列表失败:', error)
      ElMessage.error('获取API列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取API详情
  const fetchApiDetail = async (apiId) => {
    try {
      const result = await apiService.getApiDetail(apiId)
      if (result.success) {
        return result.data
      } else {
        ElMessage.error(result.error || '获取API详情失败')
        return null
      }
    } catch (error) {
      console.error('获取API详情失败:', error)
      ElMessage.error('获取API详情失败')
      return null
    }
  }

  // 创建API
  const createApi = async (apiData) => {
    loading.value = true
    try {
      const result = await apiService.createApi(apiData)
      if (result.success) {
        ElMessage.success('API创建成功')
        await fetchApiList() // 刷新列表
        return result.data
      } else {
        ElMessage.error(result.error || '创建API失败')
        return null
      }
    } catch (error) {
      console.error('创建API失败:', error)
      ElMessage.error('创建API失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新API
  const updateApi = async (apiId, apiData) => {
    loading.value = true
    try {
      const result = await apiService.updateApi(apiId, apiData)
      if (result.success) {
        ElMessage.success('API更新成功')
        await fetchApiList() // 刷新列表
        return result.data
      } else {
        ElMessage.error(result.error || '更新API失败')
        return null
      }
    } catch (error) {
      console.error('更新API失败:', error)
      ElMessage.error('更新API失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 删除API
  const deleteApi = async (apiId) => {
    loading.value = true
    try {
      const result = await apiService.deleteApi(apiId)
      if (result.success) {
        ElMessage.success('API删除成功')
        await fetchApiList() // 刷新列表
        return true
      } else {
        ElMessage.error(result.error || '删除API失败')
        return false
      }
    } catch (error) {
      console.error('删除API失败:', error)
      ElMessage.error('删除API失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 批量删除API
  const batchDeleteApis = async (apiIds) => {
    loading.value = true
    try {
      const result = await apiService.batchOperation('delete', apiIds)
      if (result.success) {
        ElMessage.success(`成功删除 ${apiIds.length} 个API`)
        await fetchApiList() // 刷新列表
        selectedApis.value = [] // 清空选择
        return true
      } else {
        ElMessage.error(result.error || '批量删除失败')
        return false
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 测试API
  const testApi = async (apiId, testData) => {
    loading.value = true
    try {
      const result = await apiService.testApi(apiId, testData)
      if (result.success) {
        return result.data
      } else {
        ElMessage.error(result.error || 'API测试失败')
        return null
      }
    } catch (error) {
      console.error('API测试失败:', error)
      ElMessage.error('API测试失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 搜索API
  const searchApis = async (query) => {
    searchQuery.value = query
    await fetchApiList()
  }

  // 获取API统计
  const fetchApiStats = async () => {
    try {
      const result = await apiService.getApiStats()
      if (result.success) {
        return result.data
      } else {
        console.error('获取API统计失败:', result.error)
        return null
      }
    } catch (error) {
      console.error('获取API统计失败:', error)
      return null
    }
  }

  // 获取API历史
  const fetchApiHistory = async (apiId, params = {}) => {
    try {
      const result = await apiService.getApiHistory(apiId, params)
      if (result.success) {
        return {
          data: result.data,
          total: result.total
        }
      } else {
        console.error('获取API历史失败:', result.error)
        return null
      }
    } catch (error) {
      console.error('获取API历史失败:', error)
      return null
    }
  }

  // 获取API状态
  const fetchApiStatus = async (apiId) => {
    try {
      const result = await apiService.getApiStatus(apiId)
      if (result.success) {
        return result.data
      } else {
        console.error('获取API状态失败:', result.error)
        return null
      }
    } catch (error) {
      console.error('获取API状态失败:', error)
      return null
    }
  }

  // 获取API类型
  const fetchApiTypes = async () => {
    try {
      const result = await apiService.getApiTypes()
      if (result.success) {
        return result.data
      } else {
        console.error('获取API类型失败:', result.error)
        return []
      }
    } catch (error) {
      console.error('获取API类型失败:', error)
      return []
    }
  }

  // 切换API选择状态
  const toggleApiSelection = (apiId) => {
    const index = selectedApis.value.indexOf(apiId)
    if (index > -1) {
      selectedApis.value.splice(index, 1)
    } else {
      selectedApis.value.push(apiId)
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedApis.value.length === apis.value.length) {
      selectedApis.value = []
    } else {
      selectedApis.value = apis.value.map(api => api.id)
    }
  }

  // 分页处理
  const handlePageChange = (page) => {
    currentPage.value = page
    fetchApiList()
  }

  const handlePageSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
    fetchApiList()
  }

  // 计算属性
  const apiStats = computed(() => {
    const total = apis.value.length
    const active = apis.value.filter(api => api.status === 'active').length
    const inactive = total - active
    
    return {
      total,
      active,
      inactive,
      selected: selectedApis.value.length
    }
  })

  const hasSelected = computed(() => selectedApis.value.length > 0)

  const isAllSelected = computed(() => {
    return apis.value.length > 0 && selectedApis.value.length === apis.value.length
  })

  const isIndeterminate = computed(() => {
    return selectedApis.value.length > 0 && selectedApis.value.length < apis.value.length
  })

  // 初始化
  const init = async () => {
    await fetchApiList()
  }

  return {
    // 状态
    apis,
    loading,
    total,
    currentPage,
    pageSize,
    searchQuery,
    selectedApis,
    
    // 计算属性
    apiStats,
    hasSelected,
    isAllSelected,
    isIndeterminate,
    
    // 方法
    fetchApiList,
    fetchApiDetail,
    createApi,
    updateApi,
    deleteApi,
    batchDeleteApis,
    testApi,
    searchApis,
    fetchApiStats,
    fetchApiHistory,
    fetchApiStatus,
    fetchApiTypes,
    toggleApiSelection,
    toggleSelectAll,
    handlePageChange,
    handlePageSizeChange,
    init
  }
})