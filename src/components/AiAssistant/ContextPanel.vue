<template>
  <div class="context-panel">
    <div class="panel-header">当前页面</div>

    <div class="route-info">
      <div class="info-item">
        <span class="info-label">页面名称</span>
        <span class="info-value">{{ routeName }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">路由路径</span>
        <span class="info-value code">{{ routePath }}</span>
      </div>
      <div v-if="routeDescription" class="info-item">
        <span class="info-label">页面描述</span>
        <span class="info-value">{{ routeDescription }}</span>
      </div>
    </div>

    <el-divider />

    <div class="panel-header">页面上下文</div>
    <p class="context-hint">将当前页面信息发送给 AI，获取更精准的帮助。</p>
    <div class="context-preview">
      <div v-for="(ctx, i) in contextList" :key="i" class="context-item">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ ctx }}</span>
      </div>
    </div>

    <el-button type="primary" class="mt-10px w-full" @click="sendContext">
      将页面上下文发送给 AI
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { useRouteListener } from '@/hooks/useRouteListener';
import { useChatStore } from '@/store/modules/chat';

const store = useChatStore();
const route = useRoute();
const { listenerRouteChange } = useRouteListener();

const routeName = ref('');
const routePath = ref('');
const routeDescription = ref('');
const contextList = ref<string[]>([]);

function updateContext() {
  const meta = route.meta as Record<string, any>;
  routeName.value = (meta.title as string) || route.name as string || '未知页面';
  routePath.value = route.path;
  routeDescription.value = (meta.description as string) || '';

  contextList.value = [
    `当前页面：${routeName.value}`,
    `路由路径：${routePath.value}`,
    routeDescription.value ? `页面描述：${routeDescription.value}` : '',
  ].filter(Boolean);
}

listenerRouteChange(() => {
  updateContext();
}, true);

function sendContext() {
  const text = `我正在访问「${routeName.value}」页面（${routePath.value}），请根据这个页面上下文提供帮助。`;
  store.addMessage({ role: 'user', content: text });
}
</script>

<style scoped lang="scss">
.context-panel {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 11px;
  color: #909399;
}

.info-value {
  font-size: 13px;
  color: #303133;

  &.code {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    word-break: break-all;
  }
}

.context-hint {
  font-size: 12px;
  color: #909399;
  margin: 0 0 12px;
  line-height: 1.5;
}

.context-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  padding: 6px 10px;
  border-radius: 6px;
}

.mt-10px { margin-top: 10px; }
.w-full { width: 100%; }
</style>
