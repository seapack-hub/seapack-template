<template>
  <div class="ai-layout">
    <div class="panel panel-session">
      <SessionSidebar />
    </div>
    <div class="panel panel-knowledge">
      <KnowledgeBase />
    </div>
    <div class="panel panel-chat">
      <ChatInterface />
    </div>
  </div>
</template>

<script setup lang="ts">
import SessionSidebar from './components/SessionSidebar.vue';
import KnowledgeBase from './components/KnowledgeBase.vue';
import ChatInterface from './components/ChatInterface.vue';
</script>

<style scoped lang="scss">
.ai-layout {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.panel {
  height: 100%;
  overflow: hidden;
  background: white;
}

.panel-session {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
}

.panel-knowledge {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
}

.panel-chat {
  flex: 1;
}
</style>
