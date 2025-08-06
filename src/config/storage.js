import CryptoJS from 'crypto-js'

// 存储配置
export const STORAGE_CONFIG = {
  // 加密密钥（实际项目中应该从环境变量获取）
  ENCRYPTION_KEY: process.env.VUE_APP_ENCRYPTION_KEY || 'ai-api-manager-secret-key-2024',
  
  // 存储键名
  KEYS: {
    APIS: 'ai-apis-encrypted',
    SETTINGS: 'ai-settings',
    THEME: 'ai-theme',
    USER_PREFERENCES: 'ai-user-preferences'
  },
  
  // 存储类型
  TYPE: {
    LOCAL: 'localStorage',
    SESSION: 'sessionStorage',
    INDEXED_DB: 'indexedDB'
  },
  
  // 默认设置
  DEFAULTS: {
    theme: 'light',
    syncEnabled: false,
    syncInterval: 30,
    autoSave: true,
    maxBackups: 10
  }
}

// 存储管理器
class StorageManager {
  constructor() {
    this.config = STORAGE_CONFIG
  }

  // 加密数据
  encrypt(data) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), this.config.ENCRYPTION_KEY).toString()
    } catch (error) {
      console.error('加密失败:', error)
      return null
    }
  }

  // 解密数据
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.config.ENCRYPTION_KEY)
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      console.error('解密失败:', error)
      return null
    }
  }

  // 保存数据（加密）
  saveEncrypted(key, data) {
    try {
      const encryptedData = this.encrypt(data)
      if (encryptedData) {
        localStorage.setItem(key, encryptedData)
        return true
      }
      return false
    } catch (error) {
      console.error('保存加密数据失败:', error)
      return false
    }
  }

  // 加载数据（解密）
  loadEncrypted(key) {
    try {
      const encryptedData = localStorage.getItem(key)
      if (encryptedData) {
        return this.decrypt(encryptedData)
      }
      return null
    } catch (error) {
      console.error('加载加密数据失败:', error)
      return null
    }
  }

  // 保存普通数据
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('保存数据失败:', error)
      return false
    }
  }

  // 加载普通数据
  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('加载数据失败:', error)
      return defaultValue
    }
  }

  // 删除数据
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('删除数据失败:', error)
      return false
    }
  }

  // 清空所有数据
  clear() {
    try {
      Object.values(this.config.KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      return false
    }
  }

  // 获取存储大小
  getSize() {
    try {
      let totalSize = 0
      Object.values(this.config.KEYS).forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          totalSize += new Blob([data]).size
        }
      })
      return totalSize
    } catch (error) {
      console.error('获取存储大小失败:', error)
      return 0
    }
  }

  // 备份数据
  backup() {
    try {
      const backupData = {}
      Object.entries(this.config.KEYS).forEach(([key, storageKey]) => {
        const data = localStorage.getItem(storageKey)
        if (data) {
          backupData[key] = data
        }
      })
      
      const backup = {
        data: backupData,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
      
      const backupKey = `ai-backup-${new Date().toISOString().split('T')[0]}`
      this.save(backupKey, backup)
      
      // 清理旧备份
      this.cleanOldBackups()
      
      return backup
    } catch (error) {
      console.error('备份数据失败:', error)
      return null
    }
  }

  // 恢复数据
  restore(backupData) {
    try {
      if (!backupData || !backupData.data) {
        throw new Error('无效的备份数据')
      }
      
      Object.entries(backupData.data).forEach(([key, value]) => {
        const storageKey = this.config.KEYS[key]
        if (storageKey) {
          localStorage.setItem(storageKey, value)
        }
      })
      
      return true
    } catch (error) {
      console.error('恢复数据失败:', error)
      return false
    }
  }

  // 清理旧备份
  cleanOldBackups() {
    try {
      const maxBackups = this.config.DEFAULTS.maxBackups
      const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('ai-backup-'))
      
      if (backupKeys.length > maxBackups) {
        backupKeys.sort().slice(0, backupKeys.length - maxBackups).forEach(key => {
          localStorage.removeItem(key)
        })
      }
    } catch (error) {
      console.error('清理旧备份失败:', error)
    }
  }

  // 导出数据
  export() {
    try {
      const exportData = {}
      Object.entries(this.config.KEYS).forEach(([key, storageKey]) => {
        const data = localStorage.getItem(storageKey)
        if (data) {
          exportData[key] = data
        }
      })
      
      return {
        data: exportData,
        exportDate: new Date().toISOString(),
        version: '2.0.0',
        size: this.getSize()
      }
    } catch (error) {
      console.error('导出数据失败:', error)
      return null
    }
  }

  // 导入数据
  import(importData) {
    try {
      if (!importData || !importData.data) {
        throw new Error('无效的导入数据')
      }
      
      Object.entries(importData.data).forEach(([key, value]) => {
        const storageKey = this.config.KEYS[key]
        if (storageKey) {
          localStorage.setItem(storageKey, value)
        }
      })
      
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }
}

// 创建单例实例
export const storageManager = new StorageManager()

// 导出便捷方法
export const {
  saveEncrypted,
  loadEncrypted,
  save,
  load,
  remove,
  clear,
  getSize,
  backup,
  restore,
  export: exportData,
  import: importData
} = storageManager