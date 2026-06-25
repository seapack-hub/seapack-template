<template>
  <!-- AI 交互主布局：三栏结构 [会话侧边栏] [知识库面板] [对话界面] -->
  <el-container class="ai-layout">
    <!-- 左侧：会话列表 -->
    <el-aside width="260px" class="panel">
      <SessionSidebar />
    </el-aside>

    <!-- 中间：知识库与上传 -->
    <el-aside width="320px" class="panel panel-border">
      <KnowledgeBase />
    </el-aside>

    <!-- 右侧：聊天界面 -->
    <el-container direction="vertical" class="chat-panel">
      <ChatInterface />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import SessionSidebar from './components/SessionSidebar.vue';
import KnowledgeBase from './components/KnowledgeBase.vue';
import ChatInterface from './components/ChatInterface.vue';
</script>

<style scoped lang="scss">
.ai-layout {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: sans-serif;
}

.panel {
  height: 100%;
  overflow: hidden;
  background: white;
}

.panel-border {
  border-right: 1px solid #e8e8e8;
}

.chat-panel {
  flex: 1;
  overflow: hidden;
  background: white;
}
</style>
