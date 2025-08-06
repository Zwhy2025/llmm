<template>
  <div class="apis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>API管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加API
      </el-button>
    </div>

    <!-- API列表 -->
    <el-card shadow="hover">
      <el-table
        :data="apiStore.apis"
        v-loading="apiStore.loading"
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <div class="api-name">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '活跃' : '停用' }}
              </el-tag>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="url" label="URL" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="testCount" label="测试次数" width="100" align="center" />
        
        <el-table-column prop="lastTested" label="最后测试" width="150">
          <template #default="{ row }">
            {{ row.lastTested ? formatTime(row.lastTested) : '未测试' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="testApi(row)">
              <el-icon><VideoPlay /></el-icon>
              测试
            </el-button>
            <el-button type="warning" size="small" @click="editApi(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteApi(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑API对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑API' : '添加API'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="API名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入API名称" />
        </el-form-item>
        
        <el-form-item label="API URL" prop="url">
          <el-input v-model="formData.url" placeholder="https://api.openai.com/v1" />
        </el-form-item>
        
        <el-form-item label="API Key" prop="key">
          <el-input
            v-model="formData.key"
            type="password"
            placeholder="请输入API Key"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="API类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择API类型" style="width: 100%">
            <el-option label="OpenAI 兼容" value="openai" />
            <el-option label="Anthropic Claude" value="anthropic" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入API描述（可选）"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch
            v-model="formData.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
            active-text="活跃"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useApiStore } from '@/stores/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const apiStore = useApiStore()

// 对话框状态
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  name: '',
  url: '',
  key: '',
  type: 'openai',
  description: '',
  status: 'active'
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入API名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入API URL', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ],
  key: [
    { required: true, message: '请输入API Key', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择API类型', trigger: 'change' }
  ]
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑API
const editApi = (api) => {
  isEdit.value = true
  Object.assign(formData, api)
  dialogVisible.value = true
}

// 删除API
const deleteApi = async (api) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除API "${api.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    apiStore.deleteApi(api.id)
  } catch {
    // 用户取消删除
  }
}

// 测试API
const testApi = (api) => {
  // 跳转到测试页面
  router.push({
    name: 'Testing',
    query: { apiId: api.id }
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (isEdit.value) {
      apiStore.updateApi(formData.id, formData)
    } else {
      apiStore.addApi(formData)
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    url: '',
    key: '',
    type: 'openai',
    description: '',
    status: 'active'
  })
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 获取类型名称
const getTypeName = (type) => {
  const typeNames = {
    'openai': 'OpenAI 兼容',
    'anthropic': 'Anthropic Claude',
    'custom': '自定义'
  }
  return typeNames[type] || type
}

// 获取类型标签样式
const getTypeTagType = (type) => {
  const typeMap = {
    'openai': 'primary',
    'anthropic': 'success',
    'custom': 'warning'
  }
  return typeMap[type] || 'info'
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.apis-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      color: var(--el-text-color-primary);
    }
  }
  
  .api-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>