<template>
  <div class="apis-page">
    <!-- Page Header -->
    <div class="page-header">
      <h2>API管理</h2>
      <div class="header-actions">
        <el-button 
          type="danger" 
          :disabled="selectedApiIds.length === 0"
          :loading="apiState.isLoading('batch-delete')"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加API
        </el-button>
      </div>
    </div>

    <!-- Search and Filter -->
    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-row :gutter="20" align="middle">
        <el-col :span="14">
          <el-input
            v-model="searchQuery"
            placeholder="搜索API名称、URL或描述"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="handleSearch" :loading="apiState.isLoading('list')">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- API List -->
    <el-card shadow="hover">
      <el-alert
        v-if="apiState.error"
        :title="'操作失败: ' + apiState.error"
        type="error"
        show-icon
        style="margin-bottom: 20px;"
        @close="apiState.clearError()"
      />
      <el-table
        :data="apiListStore.apis"
        v-loading="apiState.isLoading('list')"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
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
            <el-tag :type="getApiTypeTagType(row.type)" size="small">
              {{ getApiTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="testApi(row)">
              <el-icon><VideoPlay /></el-icon>
              测试
            </el-button>
            <el-button type="warning" size="small" @click="editApi(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-popconfirm
              :title="`确定要删除API '${row.name}' 吗？`"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" size="small" :loading="apiState.isLoading(`delete-${row.id}`)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="apiListStore.currentPage"
          :page-size="apiListStore.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="apiListStore.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="apiListStore.handlePageSizeChange"
          @current-change="apiListStore.handlePageChange"
        />
      </div>
    </el-card>

    <!-- Add/Edit API Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑API' : '添加API'"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
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
          <el-input v-model="formData.key" type="password" placeholder="请输入API Key" show-password />
        </el-form-item>
        <el-form-item label="API类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择API类型" style="width: 100%">
            <el-option v-for="t in apiTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" active-value="active" inactive-value="inactive" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="apiState.isLoading(isEdit ? `update-${formData.id}` : 'create')">
          {{ isEdit ? '更新' : '添加' }}
        </-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useApiListStore } from '@/stores/api-list.store.js';
import { useApiCrudStore } from '@/stores/api-crud.store.js';
import { useApiStateStore } from '@/stores/api-state.store.js';
import { formatTime, getApiTypeName, getApiTypeTagType } from '@/utils/formatters';
import { ElMessage, ElMessageBox } from 'element-plus';

// Stores
const apiListStore = useApiListStore();
const apiCrudStore = useApiCrudStore();
const apiState = useApiStateStore();
const router = useRouter();

// Component State
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const searchQuery = ref('');
const selectedApiIds = ref([]);

const apiTypes = [
  { label: 'OpenAI 兼容', value: 'openai' },
  { label: 'Anthropic Claude', value: 'anthropic' },
  { label: '自定义', value: 'custom' },
];

const initialFormData = {
  id: null,
  name: '',
  url: '',
  key: '',
  type: 'openai',
  description: '',
  status: 'active',
};
const formData = reactive({ ...initialFormData });

const formRules = {
  name: [{ required: true, message: '请输入API名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入API URL', trigger: 'blur' }, { type: 'url', message: '请输入有效的URL', trigger: 'blur' }],
  key: [{ required: true, message: '请输入API Key', trigger: 'blur' }],
  type: [{ required: true, message: '请选择API类型', trigger: 'change' }],
};

// Actions
const handleSearch = () => {
  apiListStore.searchQuery = searchQuery.value;
  apiListStore.fetchApiList();
};

const showAddDialog = () => {
  isEdit.value = false;
  dialogVisible.value = true;
};

const editApi = (api) => {
  isEdit.value = true;
  Object.assign(formData, api);
  dialogVisible.value = true;
};

const handleDelete = async (api) => {
  try {
    await apiCrudStore.deleteApi(api.id);
    ElMessage.success(`API "${api.name}" 已删除`);
  } catch (e) {
    // Error is already handled by the state store, no need to show a message here.
  }
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedApiIds.value.length} 个API吗？`, '确认批量删除', { type: 'warning' });
    await apiCrudStore.batchDeleteApis(selectedApiIds.value);
    ElMessage.success('批量删除成功');
    selectedApiIds.value = [];
  } catch (e) {
    if (e !== 'cancel') {
       // Error is already handled by the state store
    }
  }
};

const testApi = (api) => {
  router.push({ name: 'Testing', query: { apiId: api.id } });
};

const submitForm = async () => {
  await formRef.value.validate();
  try {
    if (isEdit.value) {
      await apiCrudStore.updateApi(formData.id, formData);
      ElMessage.success('API更新成功');
    } else {
      await apiCrudStore.createApi(formData);
      ElMessage.success('API添加成功');
    }
    dialogVisible.value = false;
  } catch (e) {
    // Error is handled by the state store, but we can log it here if needed.
    console.error("Failed to submit form:", e);
  }
};

const resetForm = () => {
  Object.assign(formData, initialFormData);
  formRef.value?.resetFields();
};

const handleSelectionChange = (selection) => {
  selectedApiIds.value = selection.map(item => item.id);
};

// Lifecycle
onMounted(() => {
  apiListStore.fetchApiList();
});

// Watch for errors from the state store
watch(() => apiState.error, (newError) => {
  if (newError) {
    ElMessage.error({ message: `发生错误: ${newError}`, duration: 5000 });
  }
});
</script>

<style lang="scss" scoped>
.apis-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .api-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>