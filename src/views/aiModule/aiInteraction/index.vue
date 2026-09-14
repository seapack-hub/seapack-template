<template>
  <div class="ai-layout">
    <div class="panel panel-left">
      <SessionSidebar />
      <div class="left-divider" />
      <KnowledgeBaseList @select="onKnowledgeSelect" />
    </div>
    <div class="panel panel-chat">
      <ChatInterface :selected-knowledge-id="selectedKnowledgeId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SessionSidebar from './components/SessionSidebar.vue';
import KnowledgeBaseList from './components/KnowledgeBaseList.vue';
import ChatInterface from './components/ChatInterface.vue';

const selectedKnowledgeId = ref<number | null>(null);

function onKnowledgeSelect(id: number | null) {
  selectedKnowledgeId.value = id;
}
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

.panel-left {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8e8e8;
}

.left-divider {
  height: 1px;
  background: #e8e8e8;
  flex-shrink: 0;
}

.panel-chat {
  flex: 1;
}
</style>
