/**
 * SessionSidebar.vue —— 会话侧边栏
 *
 * 显示所有对话会话列表，支持：
 *   - 新建会话
 *   - 切换会话
 *   - 重命名会话（双击标题）
 *   - 删除会话
 *   - 显示 token 计数
 */

<template>
  <div class="session-sidebar">
    <!-- 顶部：新建会话按钮 + 标题 -->
    <div class="sidebar-header">
      <span class="sidebar-title">对话历史</span>
      <el-button type="primary" size="small" :icon="Plus" @click="handleNewSession">
        新建对话
      </el-button>
    </div>

    <!-- 会话列表 -->
    <el-scrollbar class="session-list">
      <div
        v-for="session in store.sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === store.currentSessionId }"
        @click="store.currentSessionId = session.id"
      >
        <!-- 可编辑标题 -->
        <div class="session-info">
          <el-icon v-if="session.id === store.currentSessionId" class="active-icon">
            <ChatDotSquare />
          </el-icon>
          <el-icon v-else class="inactive-icon">
            <ChatLineSquare />
          </el-icon>
          <el-input
            v-if="editingId === session.id"
            ref="editInputRef"
            v-model="editTitle"
            size="small"
            @blur="handleRename(session.id)"
            @keyup.enter="handleRename(session.id)"
            @click.stop
          />
          <span
            v-else
            class="session-title"
            :title="session.title"
            @dblclick.stop="startEditing(session)"
          >
            {{ session.title }}
          </span>
        </div>
        <!-- 操作按钮 -->
        <div class="session-actions" @click.stop>
          <el-button
            text
            size="small"
            :icon="Edit"
            @click="startEditing(session)"
          />
          <el-button
            text
            size="small"
            type="danger"
            :icon="Delete"
            @click="handleDelete(session.id)"
          />
        </div>
      </div>
    </el-scrollbar>

    <!-- 底部：token 计数 -->
    <div class="sidebar-footer">
      <el-tooltip content="当前上下文 Token 数（超出 8000 时自动裁剪旧消息）" placement="top">
        <span class="token-count">
          <el-icon><Coin /></el-icon>
          {{ store.tokenCount }} tokens
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Plus, ChatDotSquare, ChatLineSquare, Edit, Delete, Coin } from '@element-plus/icons-vue';
import { useChatStore, type Session } from '@/store/modules/chat';
import { ElMessageBox, ElMessage } from 'element-plus';

const store = useChatStore();

// ===== 编辑状态 =====
const editingId = ref('');
const editTitle = ref('');
const editInputRef = ref();

/** 开始编辑标题 */
function startEditing(session: Session) {
  editingId.value = session.id;
  editTitle.value = session.title;
  nextTick(() => {
    editInputRef.value?.focus();
  });
}

/** 完成重命名 */
function handleRename(sessionId: string) {
  if (editTitle.value.trim()) {
    store.renameSession(sessionId, editTitle.value.trim());
  }
  editingId.value = '';
}

/** 新建会话 */
function handleNewSession() {
  store.createSessionAndSwitch();
  ElMessage.success('已创建新对话');
}

/** 删除会话 */
async function handleDelete(sessionId: string) {
  if (store.sessions.length <= 1) {
    ElMessage.warning('至少保留一个会话');
    return;
  }
  try {
    await ElMessageBox.confirm('确定要删除此会话吗？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
    store.deleteSession(sessionId);
    ElMessage.success('会话已删除');
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped lang="scss">
.session-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.sidebar-header {
  height: 60px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.session-list {
  flex: 1;
  overflow-y: auto;
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

.sidebar-footer {
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.token-count {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
