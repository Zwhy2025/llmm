import { defineStore } from 'pinia';
import { ref } from 'vue';
import Cookies from 'js-cookie';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(Cookies.get('authToken') || null);
  const user = ref(JSON.parse(localStorage.getItem('userInfo')) || null);

  const isAuthenticated = ref(!!token.value);

  function setToken(newToken) {
    token.value = newToken;
    isAuthenticated.value = true;
    Cookies.set('authToken', newToken, { expires: 7 });
  }

  function setUser(newUser) {
    user.value = newUser;
    localStorage.setItem('userInfo', JSON.stringify(newUser));
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    Cookies.remove('authToken');
    localStorage.removeItem('userInfo');
    // Potentially redirect to login page
    window.location.href = '/login';
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    setUser,
    clearAuth,
  };
});
