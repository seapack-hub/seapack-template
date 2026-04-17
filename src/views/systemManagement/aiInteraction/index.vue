<template>
  <!-- 外层容器 -->
  <el-container class="h-[100%] w-[100%] border bg-gray-50 overflow-hidden font-sans">
    <!-- 侧边栏：知识库与上传 -->
    <el-aside width="320px" class="bg-white flex-shrink-0">
      <!-- 绑定 currentNamespace 并监听变化（如果需要双向绑定） -->
      <KnowledgeBase v-model:namespace="currentNamespace"/>
    </el-aside>
    <!-- 主区域：聊天 -->
    <el-container direction="vertical" class="flex-1 bg-white overflow-hidden relative">
      <!-- 将 currentNamespace 传给右侧 -->
      <ChatInterface :currentNamespace="currentNamespace"/>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import KnowledgeBase from './components/KnowledgeBase.vue'
import ChatInterface from './components/ChatInterface.vue'

// 这里的状态管理建议提取出来，或者通过 provide/inject，或者简单的父组件状态
const currentNamespace = ref(''); 
</script>

<style lang="scss"></style>