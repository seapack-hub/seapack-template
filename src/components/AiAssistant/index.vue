<template>
  <div class="ai-assistant-wrapper">
    <div
      ref="dragEl"
      class="ai-trigger"
      :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
      @mousedown="startDrag"
      @click="visible = true"
    >
      <Icon name="robot-2-fill" :size="25" color="#fff"/>
    </div>

    <el-drawer
      v-model="visible"
      size="500px"
      :with-header="false"
      direction="rtl"
      @open="handleOpen"
    >
      <div class="assistant-container">
        <div class="assistant-header">
          <div class="header-left">
            <el-icon size="18" color="#409eff"><ChatDotSquare /></el-icon>
            <span class="header-title">AI 助手</span>
          </div>
          <el-button text :icon="Close" @click="visible = false" />
        </div>
        <el-tabs v-model="activeTab" class="assistant-tabs">
          <el-tab-pane label="聊天" name="chat" />
          <el-tab-pane label="会话" name="sessions" />
          <el-tab-pane label="上下文" name="context" />
        </el-tabs>
        <div class="assistant-body">
          <ChatPanel v-if="activeTab === 'chat'" />
          <SessionList v-else-if="activeTab === 'sessions'" />
          <ContextPanel v-else />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { ChatDotSquare, Close } from '@element-plus/icons-vue';
import { useChatStore } from '@/store/modules/chat';
import ChatPanel from './ChatPanel.vue';
import SessionList from './SessionList.vue';
import ContextPanel from './ContextPanel.vue';

const store = useChatStore();
const visible = ref(false);
const activeTab = ref('chat');

const dragEl = ref<HTMLElement>();
const position = ref({ x: 0, y: 0 });
let startPos = { x: 0, y: 0 };
let mouseStart = { x: 0, y: 0 };

function startDrag(e: MouseEvent) {
  if (!dragEl.value) return;
  mouseStart = { x: e.clientX, y: e.clientY };
  startPos = { ...position.value };
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(e: MouseEvent) {
  position.value = {
    x: startPos.x + e.clientX - mouseStart.x,
    y: startPos.y + e.clientY - mouseStart.y,
  };
}

function stopDrag() {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

onBeforeUnmount(stopDrag);

function handleOpen() {
  store.ensureSession();
}
</script>

<style scoped lang="scss">
.ai-trigger {
  width: 44px;
  height: 44px;
  background: #409eff;
  position: fixed;
  top: 300px;
  right: 0;
  border-radius: 6px 0 0 6px;
  z-index: 1000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.5);
  }
}

.assistant-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.assistant-header {
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.assistant-tabs {
  flex-shrink: 0;
  padding: 0 16px;

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: 13px;
    height: 36px;
    line-height: 36px;
  }
}

.assistant-body {
  flex: 1;
  overflow: hidden;
}
</style>
