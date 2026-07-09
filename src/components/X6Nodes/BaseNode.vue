<template>
  <div class="workflow-node" :class="[`status-${status}`, { selected: isSelected }]">
    <!-- 状态指示灯 -->
    <div class="node-status" :class="status" />

    <!-- 图标区域 -->
    <div class="node-icon" :style="{ backgroundColor: color + '20', color: color }">
      <slot name="icon">
        <span class="icon-text">{{ iconText }}</span>
      </slot>
    </div>

    <!-- 内容区域 -->
    <div class="node-content">
      <div class="node-title text-ellipsis">{{ title }}</div>
      <div v-if="subtitle" class="node-subtitle text-ellipsis">{{ subtitle }}</div>
    </div>

    <!-- 错误提示 -->
    <el-tooltip v-if="error" :content="error" placement="top">
      <div class="node-error">
        <el-icon :size="14" color="#F56C6C"><WarningFilled /></el-icon>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Node, Graph } from '@antv/x6'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  node: {
    type: Object as PropType<Node>,
    required: true,
  },
  graph: {
    type: Object as PropType<Graph>,
    required: true,
  },
  title: {
    type: String,
    default: '节点',
  },
  subtitle: {
    type: String,
    default: '',
  },
  iconText: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#409EFF',
  },
  status: {
    type: String as PropType<'idle' | 'running' | 'success' | 'error' | 'warning'>,
    default: 'idle',
  },
  error: {
    type: String,
    default: '',
  },
})

const isSelected = ref(false)

// 监听节点选中状态
onMounted(() => {
  if (props.graph) {
    props.graph.on('node:click', ({ node }) => {
      isSelected.value = node === props.node
    })
    props.graph.on('blank:click', () => {
      isSelected.value = false
    })
  }
})
</script>

<style lang="scss" scoped>
.workflow-node {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: #fff;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: #c0c4cc;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  &.status-running {
    border-color: #409EFF;
  }

  &.status-success {
    border-color: #67C23A;
  }

  &.status-error {
    border-color: #F56C6C;
  }

  &.status-warning {
    border-color: #E6A23C;
  }
}

.node-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  top: 6px;
  right: 6px;

  &.idle {
    background: #C0C4CC;
  }

  &.running {
    background: #409EFF;
    animation: pulse 1.5s infinite;
  }

  &.success {
    background: #67C23A;
  }

  &.error {
    background: #F56C6C;
  }

  &.warning {
    background: #E6A23C;
  }
}

.node-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 10px;

  .icon-text {
    font-size: 18px;
    font-weight: 500;
  }
}

.node-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.node-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.node-subtitle {
  font-size: 11px;
  color: #909399;
  line-height: 1.4;
  margin-top: 2px;
}

.node-error {
  position: absolute;
  top: 6px;
  left: 6px;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
