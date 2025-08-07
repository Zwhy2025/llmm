import { defineStore } from 'pinia';
import { apiService } from '@/services/api';
import { useApiStateStore } from './api-state.store';
import { useApiListStore } from './api-list.store';

export const useApiCrudStore = defineStore('api-crud', () => {
  const stateStore = useApiStateStore();
  const listStore = useApiListStore();

  async function createApi(apiData) {
    const requestFn = async () => {
      const createdApi = await apiService.createApi(apiData);
      listStore.refreshList(); // Refresh the list after creation
      return createdApi;
    };
    return await stateStore.wrapRequest('create', requestFn);
  }

  async function updateApi(apiId, apiData) {
    const requestFn = async () => {
      const updatedApi = await apiService.updateApi(apiId, apiData);
      listStore.refreshList(); // Refresh the list after update
      return updatedApi;
    };
    return await stateStore.wrapRequest(`update-${apiId}`, requestFn);
  }

  async function deleteApi(apiId) {
    const requestFn = async () => {
      await apiService.deleteApi(apiId);
      listStore.refreshList(); // Refresh the list after deletion
      return true;
    };
    return await stateStore.wrapRequest(`delete-${apiId}`, requestFn);
  }

  async function batchDeleteApis(apiIds) {
    const requestFn = async () => {
      await apiService.batchOperation('delete', apiIds);
      listStore.refreshList();
      return true;
    };
    return await stateStore.wrapRequest('batch-delete', requestFn);
  }

  async function fetchApiDetail(apiId) {
    const requestFn = () => apiService.getApiDetail(apiId);
    return await stateStore.wrapRequest(`detail-${apiId}`, requestFn);
  }

  async function testApi(apiId, testData) {
    const requestFn = () => apiService.testApi(apiId, testData);
    return await stateStore.wrapRequest(`test-${apiId}`, requestFn);
  }

  return {
    createApi,
    updateApi,
    deleteApi,
    batchDeleteApis,
    fetchApiDetail,
    testApi,
  };
});
