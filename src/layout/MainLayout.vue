<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '250px'" class="sidebar">
      <div class="sidebar-header">
        <el-icon v-if="!isCollapse" class="logo-icon"><Robot /></el-icon>
        <span v-if="!isCollapse" class="logo-text">AI API Manager</span>
        <el-icon v-else class="logo-icon-collapsed"><Robot /></el-icon>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表板</template>
        </el-menu-item>
        
        <el-menu-item index="/apis">
          <el-icon><Connection /></el-icon>
          <template #title>API管理</template>
        </el-menu-item>
        
        <el-menu-item index="/testing">
          <el-icon><VideoPlay /></el-icon>
          <template #title>API测试</template>
        </el-menu-item>
        
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleCollapse"
            class="collapse-btn"
          >
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-button
            type="text"
            @click="themeStore.toggleTheme()"
            class="theme-btn"
          >
            <el-icon><Sunny v-if="themeStore.isDark" /><Moon v-else /></el-icon>
          </el-button>
          
          <el-dropdown>
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="exportData">
                  <el-icon><Download /></el-icon>
                  导出数据
                </el-dropdown-item>
                <el-dropdown-item @click="importData">
                  <el-icon><Upload /></el-icon>
                  导入数据
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><InfoFilled /></el-icon>
                  关于
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useApiStore } from '@/stores/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const themeStore = useThemeStore()
const apiStore = useApiStore()

const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    title: item.meta.title,
    path: item.path
  }))
})

// 切换侧边栏
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 导出数据
const exportData = () => {
  apiStore.exportData()
}

// 导入数据
const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        await apiStore.importData(file)
      } catch (error) {
        ElMessage.error(`导入失败: ${error.message}`)
      }
    }
  }
  input.click()
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: var(--el-menu-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s;
  
  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .logo-icon {
      font-size: 24px;
      color: var(--el-color-primary);
      margin-right: 8px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .logo-icon-collapsed {
      font-size: 24px;
      color: var(--el-color-primary);
    }
  }
  
  .sidebar-menu {
    border-right: none;
  }
}

.header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .collapse-btn {
      font-size: 18px;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .theme-btn {
      font-size: 18px;
    }
  }
}

.main-content {
  background: var(--el-bg-color-page);
  padding: 20px;
}
</style>