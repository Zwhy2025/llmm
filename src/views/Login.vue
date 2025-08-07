<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>欢迎回来</h2>
          <span>登录到 AI API Manager</span>
        </div>
      </template>
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input v-model="username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" style="width: 100%;">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { ElMessage } from 'element-plus';

const username = ref('admin');
const password = ref('password');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = () => {
  // Mock login logic
  if (username.value === 'admin' && password.value === 'password') {
    // In a real app, you would call an API to get a token
    const mockToken = 'fake-jwt-token-for-ai-api-manager';
    authStore.setToken(mockToken);
    authStore.setUser({ name: 'Admin User' });

    ElMessage.success('登录成功！');
    router.push('/dashboard');
  } else {
    ElMessage.error('用户名或密码错误');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--el-bg-color-page);
}
.login-card {
  width: 400px;
}
.card-header {
  text-align: center;
}
</style>
