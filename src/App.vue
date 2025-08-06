<template>
  <div id="app" :class="{ 'dark': isDark }">
    <el-config-provider :locale="zhCn">
      <router-view />
    </el-config-provider>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDark = ref(false)

onMounted(() => {
  isDark.value = themeStore.isDark
  themeStore.$subscribe((mutation, state) => {
    isDark.value = state.isDark
  })
})
</script>

<style lang="scss">
#app {
  height: 100vh;
  transition: all 0.3s ease;
  
  &.dark {
    background: var(--el-bg-color);
    color: var(--el-text-color-primary);
  }
}
</style>