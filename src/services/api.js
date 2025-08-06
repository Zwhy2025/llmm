import axios from 'axios'
import { ElMessage } from 'element-plus'

// API服务配置
const API_CONFIG = {
  // 远端API基础URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  
  // 请求超时时间
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 30000,
  
  // 重试次数
  RETRY_COUNT: import.meta.env.VITE_API_RETRY_COUNT || 3
}

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = Date.now().toString()
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 统一错误处理
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('认证失败，请重新登录')
          // 清除本地token
          localStorage.removeItem('auth-token')
          // 跳转到登录页
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(`请求失败: ${response.status}`)
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络设置')
    }
    
    return Promise.reject(error)
  }
)

// API服务类
class ApiService {
  // 获取API列表
  async getApiList(params = {}) {
    try {
      const response = await apiClient.get('/apis', { params })
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10
      }
    } catch (error) {
      console.error('获取API列表失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取单个API详情
  async getApiDetail(apiId) {
    try {
      const response = await apiClient.get(`/apis/${apiId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('获取API详情失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 创建API
  async createApi(apiData) {
    try {
      const response = await apiClient.post('/apis', apiData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('创建API失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 更新API
  async updateApi(apiId, apiData) {
    try {
      const response = await apiClient.put(`/apis/${apiId}`, apiData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('更新API失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 删除API
  async deleteApi(apiId) {
    try {
      await apiClient.delete(`/apis/${apiId}`)
      return {
        success: true
      }
    } catch (error) {
      console.error('删除API失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 测试API
  async testApi(apiId, testData) {
    try {
      const response = await apiClient.post(`/apis/${apiId}/test`, testData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('测试API失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取API统计信息
  async getApiStats() {
    try {
      const response = await apiClient.get('/apis/stats')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('获取API统计失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取API使用历史
  async getApiHistory(apiId, params = {}) {
    try {
      const response = await apiClient.get(`/apis/${apiId}/history`, { params })
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error('获取API历史失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 批量操作
  async batchOperation(operation, apiIds, data = {}) {
    try {
      const response = await apiClient.post('/apis/batch', {
        operation,
        apiIds,
        data
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('批量操作失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 搜索API
  async searchApis(query, params = {}) {
    try {
      const response = await apiClient.get('/apis/search', {
        params: { ...params, q: query }
      })
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error('搜索API失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取API类型列表
  async getApiTypes() {
    try {
      const response = await apiClient.get('/apis/types')
      return {
        success: true,
        data: response.data || []
      }
    } catch (error) {
      console.error('获取API类型失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取API状态
  async getApiStatus(apiId) {
    try {
      const response = await apiClient.get(`/apis/${apiId}/status`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('获取API状态失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// 创建API服务实例
export const apiService = new ApiService()

// 导出配置
export { API_CONFIG }