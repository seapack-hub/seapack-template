<template>
  <!-- 外层容器 -->
  <el-container class="h-[100%] w-[100%] border bg-gray-50 overflow-hidden font-sans">
    <!-- 侧边栏：知识库与上传 -->
    <el-aside width="320px" class="bg-white flex-shrink-0">
      <KnowledgeBase />
    </el-aside>
    <!-- 主区域：聊天 -->
    <el-container direction="vertical" class="flex-1 bg-white overflow-hidden relative">
      <ChatInterface />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import KnowledgeBase from './components/KnowledgeBase.vue'
import ChatInterface from './components/ChatInterface.vue'
</script>

<style lang="scss"></style>