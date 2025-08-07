import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '@/services/api';
import { useApiStateStore } from './api-state.store';
import { formatTime } from '@/utils/formatters';

export const useApiListStore = defineStore('api-list', () => {
  const stateStore = useApiStateStore();

  const apis = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const searchQuery = ref('');

  async function fetchApiList(params = {}) {
    const requestFn = async () => {
      const result = await apiService.getApiList({
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value,
        ...params
      });
      // The service now returns the data directly.
      // The response is expected to have a `data` property with the list and a `total` property.
      apis.value = result.data;
      total.value = result.total;
      currentPage.value = result.page;
    };

    // Use the state store to wrap the request
    await stateStore.wrapRequest('list', requestFn);
  }

  async function searchApis(query) {
    searchQuery.value = query;
    currentPage.value = 1; // Reset to first page on new search
    await fetchApiList();
  }

  function handlePageChange(page) {
    currentPage.value = page;
    fetchApiList();
  }

  function handlePageSizeChange(size) {
    pageSize.value = size;
    currentPage.value = 1; // Reset to first page on size change
    fetchApiList();
  }

  // A helper action to refresh the list, e.g., after a CRUD operation
  function refreshList() {
    fetchApiList();
  }

  // Getters / Computed Properties
  const apiStats = computed(() => {
    const total = apis.value.length;
    const active = apis.value.filter(api => api.status === 'active').length;
    const inactive = total - active;
    const totalTests = apis.value.reduce((sum, api) => sum + (api.testCount || 0), 0);

    return { total, active, inactive, totalTests };
  });

  const recentActivities = computed(() => {
    const activities = [];
    apis.value.forEach(api => {
      if (api.lastTested) {
        activities.push({
          id: `test-${api.id}`,
          content: `测试了API: ${api.name}`,
          time: formatTime(api.lastTested, 'MM-DD HH:mm'),
          type: 'primary'
        });
      }
    });
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  });

  return {
    // State
    apis,
    total,
    currentPage,
    pageSize,
    searchQuery,

    // Getters
    apiStats,
    recentActivities,

    // Actions
    fetchApiList,
    searchApis,
    handlePageChange,
    handlePageSizeChange,
    refreshList,
  };
});
