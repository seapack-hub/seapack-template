<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
    <AiAssistant />
  </el-config-provider>
</template>
<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import AiAssistant from '@/components/AiAssistant/index.vue'
</script>

<style scoped></style>
