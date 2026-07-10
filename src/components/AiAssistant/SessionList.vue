<template>
  <div class="session-list">
    <div class="list-header">
      <span class="list-title">会话列表</span>
      <el-button type="primary" :icon="Plus" @click="handleNewSession">
        新建
      </el-button>
    </div>
    <el-scrollbar class="list-scroll">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === currentSessionId }"
        @click="switchSession(session.id)"
      >
        <div class="session-info">
          <el-icon size="16" :class="session.id === currentSessionId ? 'active-icon' : 'inactive-icon'">
            <ChatDotSquare v-if="session.id === currentSessionId" />
            <ChatLineSquare v-else />
          </el-icon>
          <span v-if="editingId !== session.id" class="session-title" :title="session.title">
            {{ session.title }}
          </span>
          <el-input
            v-else
            ref="editInputRef"
            v-model="editTitle"
            @blur="confirmRename(session.id)"
            @keyup.enter="confirmRename(session.id)"
            @click.stop
          />
        </div>
        <div class="session-actions" @click.stop>
          <el-button text :icon="Edit" @click="startRename(session)" />
          <el-button text type="danger" :icon="Delete" @click="handleDelete(session.id)" />
        </div>
      </div>
    </el-scrollbar>
    <div class="list-footer">
      <el-tooltip content="当前上下文 Token 数" placement="top">
        <span class="token-badge">
          <el-icon size="20"><Coin /></el-icon>
          {{ tokenCount }} tokens
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Plus, ChatDotSquare, ChatLineSquare, Edit, Delete, Coin } from '@element-plus/icons-vue';
import { useChatStore } from '@/store/modules/chat';
import { ElMessageBox, ElMessage } from 'element-plus';

const store = useChatStore();

const sessions = computed(() => store.sessions);
const currentSessionId = computed(() => store.currentSessionId);
const tokenCount = computed(() => store.tokenCount);

const editingId = ref('');
const editTitle = ref('');
const editInputRef = ref();

function startRename(session: { id: string; title: string }) {
  editingId.value = session.id;
  editTitle.value = session.title;
  nextTick(() => editInputRef.value?.focus());
}

function confirmRename(sessionId: string) {
  if (editTitle.value.trim()) {
    store.renameSession(sessionId, editTitle.value.trim());
  }
  editingId.value = '';
}

function switchSession(id: string) {
  store.currentSessionId = id;
}

function handleNewSession() {
  store.createSessionAndSwitch();
  ElMessage.success('已创建新对话');
}

async function handleDelete(sessionId: string) {
  if (store.sessions.length <= 1) {
    ElMessage.warning('至少保留一个会话');
    return;
  }
  try {
    await ElMessageBox.confirm('确定删除此会话？', '确认', { type: 'warning' });
    store.deleteSession(sessionId);
    ElMessage.success('会话已删除');
  } catch {}
}
</script>

<style scoped lang="scss">
.session-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.list-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.list-scroll {
  flex: 1;
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f0f0f0;
    .session-actions { opacity: 1; }
  }

  &.active {
    background-color: #ecf5ff;
    .session-title { color: #409eff; font-weight: 600; }
  }
}

.session-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.active-icon { color: #409eff; }
.inactive-icon { color: #999; }

.session-title {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.session-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.list-footer {
  padding: 8px 16px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.token-badge {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
