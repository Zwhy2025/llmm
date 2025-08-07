import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useApiStateStore = defineStore('api-state', () => {
  // Using a Map to track loading state for individual actions or items
  // e.g., 'list', 'create', 'delete-123'
  const loading = ref(new Map());
  const error = ref(null);

  function setLoading(key, isLoading) {
    loading.value.set(key, isLoading);
  }

  function isLoading(key = 'global') {
    return loading.value.get(key) || false;
  }

  function setError(newError) {
    error.value = newError;
  }

  function clearError() {
    error.value = null;
  }

  // A helper to wrap async actions for loading and error handling
  async function wrapRequest(key, requestFn) {
    setLoading(key, true);
    setError(null);
    try {
      const response = await requestFn();
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred';
      setError(errorMessage);
      console.error(`Error during [${key}]:`, err);
      // Re-throw the error if the caller needs to handle it
      throw new Error(errorMessage);
    } finally {
      setLoading(key, false);
    }
  }


  return {
    loading,
    error,
    setLoading,
    isLoading,
    setError,
    clearError,
    wrapRequest,
  };
});
