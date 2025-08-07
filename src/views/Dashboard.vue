<template>
  <div class="dashboard">
    <!-- Loading and Error States -->
    <el-alert
      v-if="apiState.error"
      :title="'获取数据失败: ' + apiState.error"
      type="error"
      show-icon
      @close="apiState.clearError()"
    />
    <div v-if="apiState.isLoading('list')" v-loading.fullscreen.lock="true" element-loading-text="正在加载仪表板数据..."></div>

    <!-- Main Content -->
    <div v-else>
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
            <el-timeline v-if="apiListStore.recentActivities.length > 0">
              <el-timeline-item
                v-for="activity in apiListStore.recentActivities"
                :key="activity.id"
                :timestamp="activity.time"
                :type="activity.type"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无活动" />
          </el-card>
        </el-col>

        <!-- API状态 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>API状态概览</span>
              </div>
            </template>
            <div class="api-status-list" v-if="apiListStore.apis.length > 0">
              <div
                v-for="api in apiListStore.apis.slice(0, 5)"
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
                  <span class="test-count">调用次数: {{ api.testCount || 0 }}</span>
                  <span v-if="api.lastTested" class="last-tested">
                    最后调用: {{ formatTime(api.lastTested, 'MM-DD HH:mm') }}
                  </span>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无API数据" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useApiListStore } from '@/stores/api-list.store.js';
import { useApiStateStore } from '@/stores/api-state.store.js';
import { formatTime } from '@/utils/formatters';

const apiListStore = useApiListStore();
const apiState = useApiStateStore();

// Fetch data when component is mounted
onMounted(() => {
  // Only fetch if the list is empty to avoid redundant calls when switching views
  if (apiListStore.apis.length === 0) {
    apiListStore.fetchApiList();
  }
});

// The stats data is now a simple computed property that maps store data to UI-specific properties like icons and colors.
// The core logic is in the store.
const stats = computed(() => [
  {
    title: '总API数',
    value: apiListStore.apiStats.total,
    icon: 'Connection',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '活跃API',
    value: apiListStore.apiStats.active,
    icon: 'CircleCheck',
    color: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
  },
  {
    title: '总调用次数',
    value: apiListStore.apiStats.totalTests,
    icon: 'VideoPlay',
    color: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
  },
  {
    title: '停用API',
    value: apiListStore.apiStats.inactive,
    icon: 'CircleClose',
    color: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
  }
]);

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