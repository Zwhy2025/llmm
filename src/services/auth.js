import axios from 'axios'
import { ElMessage } from 'element-plus'

// 认证服务配置
const AUTH_CONFIG = {
  // 认证API基础URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  
  // Token存储键名
  TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth-token',
  
  // 用户信息存储键名
  USER_KEY: 'auth-user',
  
  // Token刷新间隔（毫秒）
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5分钟
}

// 创建认证专用axios实例
const authClient = axios.create({
  baseURL: AUTH_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 认证服务类
class AuthService {
  constructor() {
    this.token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
    this.user = JSON.parse(localStorage.getItem(AUTH_CONFIG.USER_KEY) || 'null')
    this.refreshTimer = null
    
    // 如果有token，启动自动刷新
    if (this.token) {
      this.startTokenRefresh()
    }
  }

  // 用户登录
  async login(credentials) {
    try {
      const response = await authClient.post('/auth/login', credentials)
      
      if (response.data.success) {
        const { token, user } = response.data.data
        
        // 保存认证信息
        this.setToken(token)
        this.setUser(user)
        
        // 启动token自动刷新
        this.startTokenRefresh()
        
        ElMessage.success('登录成功')
        return { success: true, user }
      } else {
        ElMessage.error(response.data.message || '登录失败')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查网络连接')
      return { success: false, message: '登录失败' }
    }
  }

  // 用户注册
  async register(userData) {
    try {
      const response = await authClient.post('/auth/register', userData)
      
      if (response.data.success) {
        ElMessage.success('注册成功，请登录')
        return { success: true }
      } else {
        ElMessage.error(response.data.message || '注册失败')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('注册失败:', error)
      ElMessage.error('注册失败，请检查网络连接')
      return { success: false, message: '注册失败' }
    }
  }

  // 用户登出
  async logout() {
    try {
      if (this.token) {
        // 调用后端登出接口
        await authClient.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      }
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除本地认证信息
      this.clearAuth()
      ElMessage.success('已退出登录')
    }
  }

  // 刷新Token
  async refreshToken() {
    try {
      const response = await authClient.post('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
      
      if (response.data.success) {
        const { token } = response.data.data
        this.setToken(token)
        return true
      } else {
        // Token刷新失败，需要重新登录
        this.clearAuth()
        window.location.href = '/login'
        return false
      }
    } catch (error) {
      console.error('Token刷新失败:', error)
      this.clearAuth()
      window.location.href = '/login'
      return false
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      const response = await authClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${this.token}` }
      })
      
      if (response.data.success) {
        const user = response.data.data
        this.setUser(user)
        return user
      } else {
        return null
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 检查用户权限
  async checkPermission(permission) {
    try {
      const response = await authClient.post('/auth/check-permission', {
        permission
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
      
      return response.data.success
    } catch (error) {
      console.error('权限检查失败:', error)
      return false
    }
  }

  // 修改密码
  async changePassword(passwordData) {
    try {
      const response = await authClient.post('/auth/change-password', passwordData, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
      
      if (response.data.success) {
        ElMessage.success('密码修改成功')
        return { success: true }
      } else {
        ElMessage.error(response.data.message || '密码修改失败')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('密码修改失败:', error)
      ElMessage.error('密码修改失败')
      return { success: false, message: '密码修改失败' }
    }
  }

  // 设置Token
  setToken(token) {
    this.token = token
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token)
  }

  // 设置用户信息
  setUser(user) {
    this.user = user
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user))
  }

  // 获取Token
  getToken() {
    return this.token
  }

  // 获取用户信息
  getUser() {
    return this.user
  }

  // 检查是否已登录
  isAuthenticated() {
    return !!this.token && !!this.user
  }

  // 清除认证信息
  clearAuth() {
    this.token = null
    this.user = null
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
    localStorage.removeItem(AUTH_CONFIG.USER_KEY)
    this.stopTokenRefresh()
  }

  // 启动Token自动刷新
  startTokenRefresh() {
    this.stopTokenRefresh()
    this.refreshTimer = setInterval(() => {
      this.refreshToken()
    }, AUTH_CONFIG.REFRESH_INTERVAL)
  }

  // 停止Token自动刷新
  stopTokenRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  // 获取用户角色
  getUserRole() {
    return this.user?.role || 'user'
  }

  // 检查是否为管理员
  isAdmin() {
    return this.getUserRole() === 'admin'
  }

  // 检查是否为超级管理员
  isSuperAdmin() {
    return this.getUserRole() === 'super_admin'
  }
}

// 创建认证服务实例
export const authService = new AuthService()

// 导出配置
export { AUTH_CONFIG }