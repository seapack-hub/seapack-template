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

    <!-- Agent 绑定信息：Agent 模式下显示当前绑定的 Agent 详情 -->
    <template v-if="isAgentMode && agentBinding">
      <el-divider />
      <div class="panel-header">Agent 信息</div>
      <div class="agent-info">
        <div class="info-item">
          <span class="info-label">Agent 名称</span>
          <span class="info-value">{{ agentBinding.agentName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">所属场景</span>
          <span class="info-value">{{ agentBinding.sceneName }}</span>
        </div>
        <div v-if="agentBinding.agentModel" class="info-item">
          <span class="info-label">模型覆盖</span>
          <span class="info-value code">{{ agentBinding.agentModel }}</span>
        </div>
        <div v-if="agentBinding.agentTemperature != null" class="info-item">
          <span class="info-label">温度覆盖</span>
          <span class="info-value">{{ agentBinding.agentTemperature }}</span>
        </div>
        <div v-if="agentBinding.knowledgeIds?.length" class="info-item">
          <span class="info-label">关联知识库</span>
          <span class="info-value">{{ agentBinding.knowledgeIds.length }} 个</span>
        </div>
      </div>
    </template>

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
import { ref, computed } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { useRouteListener } from '@/hooks/useRouteListener';
import { useChatStore } from '@/store/modules/chat';

const store = useChatStore();
const route = useRoute();
const { listenerRouteChange } = useRouteListener();

/** 当前会话是否为 Agent 模式 */
const isAgentMode = computed(() => store.isAgentMode);
/** 当前绑定的 Agent 信息 */
const agentBinding = computed(() => store.currentAgentBinding);

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
    // Agent 模式下追加 Agent 信息到上下文
    isAgentMode.value && agentBinding.value
      ? `当前 Agent：${agentBinding.value.agentName}（${agentBinding.value.sceneName}）`
      : '',
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
