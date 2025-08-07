import axios from 'axios';

// API服务配置
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api', // Using relative URL for proxy
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 30000,
};

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => {
    const { useAuthStore } = await import('@/stores/auth.store.js');
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['X-Request-ID'] = Date.now().toString();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // Directly return the data part of the response
    return response.data;
  },
  async (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      const { useAuthStore } = await import('@/stores/auth.store.js');
      const authStore = useAuthStore();
      authStore.clearAuth(); // This will clear token and redirect to login
    }
    
    // For other errors, just pass them along
    // The calling code (e.g., in the store's wrapRequest) will handle them
    return Promise.reject(error);
  }
);

// API服务类
// All methods are now clean, one-liners that return promises.
// Error handling is centralized in the interceptor and the store's wrapRequest.
// The `{ success: true/false }` wrapper is removed.
class ApiService {
  getApiList(params = {}) {
    return apiClient.get('/apis', { params });
  }

  getApiDetail(apiId) {
    return apiClient.get(`/apis/${apiId}`);
  }

  createApi(apiData) {
    return apiClient.post('/apis', apiData);
  }

  updateApi(apiId, apiData) {
    return apiClient.put(`/apis/${apiId}`, apiData);
  }

  deleteApi(apiId) {
    return apiClient.delete(`/apis/${apiId}`);
  }

  testApi(apiId, testData) {
    return apiClient.post(`/apis/${apiId}/test`, testData);
  }

  getApiStats() {
    return apiClient.get('/apis/stats');
  }

  getApiHistory(apiId, params = {}) {
    return apiClient.get(`/apis/${apiId}/history`, { params });
  }

  batchOperation(operation, apiIds, data = {}) {
    return apiClient.post('/apis/batch', { operation, apiIds, data });
  }

  searchApis(query, params = {}) {
    return apiClient.get('/apis/search', { params: { ...params, q: query } });
  }

  getApiTypes() {
    return apiClient.get('/apis/types');
  }

  getApiStatus(apiId) {
    return apiClient.get(`/apis/${apiId}/status`);
  }
}

// 创建API服务实例
export const apiService = new ApiService()

// 导出配置
export { API_CONFIG }