<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 最近活动 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
              <el-button type="text">查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.time"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- API状态 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>API状态</span>
            </div>
          </template>
          <div class="api-status-list">
            <div
              v-for="api in apiStore.apis.slice(0, 5)"
              :key="api.id"
              class="api-status-item"
            >
              <div class="api-info">
                <el-tag :type="api.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ api.status === 'active' ? '活跃' : '停用' }}
                </el-tag>
                <span class="api-name">{{ api.name }}</span>
              </div>
              <div class="api-meta">
                <span class="test-count">测试次数: {{ api.testCount || 0 }}</span>
                <span v-if="api.lastTested" class="last-tested">
                  最后测试: {{ formatTime(api.lastTested) }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useApiStore } from '@/stores/api'
import dayjs from 'dayjs'

const apiStore = useApiStore()

// 统计数据
const stats = computed(() => [
  {
    title: '总API数',
    value: apiStore.apiStats.total,
    icon: 'Connection',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '活跃API',
    value: apiStore.apiStats.active,
    icon: 'CircleCheck',
    color: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
  },
  {
    title: '总测试次数',
    value: apiStore.apiStats.totalTests,
    icon: 'VideoPlay',
    color: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
  },
  {
    title: '停用API',
    value: apiStore.apiStats.inactive,
    icon: 'CircleClose',
    color: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
  }
])

// 最近活动
const recentActivities = computed(() => {
  const activities = []
  
  apiStore.apis.forEach(api => {
    if (api.lastTested) {
      activities.push({
        id: `test-${api.id}`,
        content: `测试了API: ${api.name}`,
        time: formatTime(api.lastTested),
        type: 'primary'
      })
    }
  })
  
  return activities
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5)
})

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      
      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        .stat-title {
          font-size: 14px;
          color: var(--el-text-color-regular);
          margin-top: 4px;
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .api-status-list {
    .api-status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      .api-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .api-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
      
      .api-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        
        .test-count {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
        
        .last-tested {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>