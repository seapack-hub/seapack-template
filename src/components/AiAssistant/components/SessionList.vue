<template>
  <div class="session-list h-full flex flex-col bg-[#f5f7fa]">
    <div class="px-16px py-12px flex items-center justify-between" style="border-bottom: 1px solid var(--el-border-color-light)">
      <span class="text-13px font-600 color-#303133">会话列表</span>
      <el-button type="primary" :icon="Plus" @click="handleNewSession">
        新建
      </el-button>
    </div>
    <el-scrollbar class="flex-1">
      <div class="px-12px py-8px">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="group flex items-center justify-between px-10px py-8px rounded-8px cursor-pointer mb-2px transition-all duration-150 hover:bg-#e8eaed"
          :class="{ 'bg-[#ecf5ff]': session.id === currentSessionId }"
          @click="switchSession(session.id)"
        >
          <div class="flex items-center gap-8px flex-1 min-w-0">
            <el-icon :size="16" :class="session.id === currentSessionId ? 'color-#409eff' : 'color-#999999'">
              <ChatDotSquare v-if="session.id === currentSessionId" />
              <ChatLineSquare v-else />
            </el-icon>
            <span v-if="editingId !== session.id" class="text-13px overflow-hidden text-ellipsis whitespace-nowrap flex-1" :class="session.id === currentSessionId ? 'color-#409eff font-600' : 'color-#606266'" :title="session.title">
              {{ session.title }}
            </span>
            <el-tag
              v-if="editingId !== session.id && session.mode === 'scene'"
              size="small"
              type="success"
              effect="plain"
              class="flex-shrink-0 scale-85"
            >
              场景
            </el-tag>
            <el-input
              v-else
              ref="editInputRef"
              v-model="editTitle"
              @blur="confirmRename(session.id)"
              @keyup.enter="confirmRename(session.id)"
              @click.stop
            />
          </div>
          <div class="flex gap-2px opacity-0 group-hover:opacity-100 transition-opacity duration-150" @click.stop>
            <el-button text :icon="Edit" @click="startRename(session)" />
            <el-button text type="danger" :icon="Delete" @click="handleDelete(session.id)" />
          </div>
        </div>
      </div>
    </el-scrollbar>
    <div class="px-16px py-10px" style="border-top: 1px solid var(--el-border-color-light)">
      <el-tooltip content="当前上下文 Token 数" placement="top">
        <span class="flex items-center gap-4px text-12px color-#909399">
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
