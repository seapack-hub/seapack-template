<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
    <AiAssistant v-if="showAiAssistant" />
  </el-config-provider>
</template>
<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import AiAssistant from '@/components/AiAssistant/index.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 根据路由 meta.showAiAssistant 控制 AI 助手显隐，默认显示
const showAiAssistant = computed(() => route.meta.showAiAssistant !== false)
</script>

<style scoped></style>
