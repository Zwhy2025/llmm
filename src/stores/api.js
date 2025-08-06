import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { storageManager, STORAGE_CONFIG } from '@/config/storage'

export const useApiStore = defineStore('api', () => {
  const apis = ref([])
  const loading = ref(false)

  // 从存储加载数据
  const loadApis = () => {
    try {
      const data = storageManager.loadEncrypted(STORAGE_CONFIG.KEYS.APIS)
      if (data && Array.isArray(data)) {
        apis.value = data
      }
    } catch (error) {
      console.error('加载API数据失败:', error)
      ElMessage.error('加载API数据失败')
    }
  }

  // 保存数据到存储
  const saveApis = () => {
    try {
      const success = storageManager.saveEncrypted(STORAGE_CONFIG.KEYS.APIS, apis.value)
      if (!success) {
        throw new Error('保存失败')
      }
    } catch (error) {
      console.error('保存API数据失败:', error)
      ElMessage.error('保存API数据失败')
    }
  }

  // 添加API
  const addApi = (apiData) => {
    const newApi = {
      id: Date.now().toString(),
      ...apiData,
      createdAt: new Date().toISOString(),
      status: 'active',
      lastTested: null,
      testCount: 0
    }
    apis.value.push(newApi)
    saveApis()
    ElMessage.success(`API "${apiData.name}" 添加成功`)
  }

  // 更新API
  const updateApi = (id, apiData) => {
    const index = apis.value.findIndex(api => api.id === id)
    if (index !== -1) {
      apis.value[index] = {
        ...apis.value[index],
        ...apiData,
        updatedAt: new Date().toISOString()
      }
      saveApis()
      ElMessage.success(`API "${apiData.name}" 更新成功`)
    }
  }

  // 删除API
  const deleteApi = (id) => {
    const api = apis.value.find(api => api.id === id)
    if (api) {
      apis.value = apis.value.filter(api => api.id !== id)
      saveApis()
      ElMessage.success(`API "${api.name}" 已删除`)
    }
  }

  // 测试API
  const testApi = async (id, testData) => {
    const api = apis.value.find(api => api.id === id)
    if (!api) {
      throw new Error('API不存在')
    }

    loading.value = true
    try {
      const response = await fetch(`${api.url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.key}`
        },
        body: JSON.stringify(testData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      // 更新API测试信息
      const index = apis.value.findIndex(a => a.id === id)
      if (index !== -1) {
        apis.value[index].lastTested = new Date().toISOString()
        apis.value[index].testCount += 1
        saveApis()
      }

      return result
    } finally {
      loading.value = false
    }
  }

  // 获取API统计
  const apiStats = computed(() => {
    const total = apis.value.length
    const active = apis.value.filter(api => api.status === 'active').length
    const totalTests = apis.value.reduce((sum, api) => sum + (api.testCount || 0), 0)
    
    return {
      total,
      active,
      inactive: total - active,
      totalTests
    }
  })

  // 导出数据
  const exportData = () => {
    const data = {
      apis: apis.value,
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-api-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  }

  // 导入数据
  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.apis && Array.isArray(data.apis)) {
            apis.value = data.apis
            saveApis()
            ElMessage.success('数据导入成功')
            resolve()
          } else {
            reject(new Error('无效的数据格式'))
          }
        } catch (error) {
          reject(error)
        }
      }
      reader.readAsText(file)
    })
  }

  // 备份数据
  const backupData = () => {
    const backup = storageManager.backup()
    if (backup) {
      ElMessage.success('数据备份成功')
      return backup
    } else {
      ElMessage.error('数据备份失败')
      return null
    }
  }

  // 恢复数据
  const restoreData = (backupData) => {
    const success = storageManager.restore(backupData)
    if (success) {
      loadApis() // 重新加载数据
      ElMessage.success('数据恢复成功')
      return true
    } else {
      ElMessage.error('数据恢复失败')
      return false
    }
  }

  // 获取存储信息
  const getStorageInfo = () => {
    return {
      size: storageManager.getSize(),
      apiCount: apis.value.length,
      lastBackup: storageManager.load('ai-last-backup')
    }
  }

  // 初始化时加载数据
  loadApis()

  return {
    apis,
    loading,
    apiStats,
    addApi,
    updateApi,
    deleteApi,
    testApi,
    exportData,
    importData,
    backupData,
    restoreData,
    getStorageInfo,
    loadApis,
    saveApis
  }
})