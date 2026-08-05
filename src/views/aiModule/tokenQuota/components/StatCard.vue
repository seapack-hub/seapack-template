<!--
  StatCard — 统计卡片

  Props:
    - title: 标题
    - value: 数值
    - icon: 图标组件
    - color: 主题色 (primary/success/danger/info)
    - description: 底部说明文字
-->
<template>
  <div class="stat-card" :class="`stat-card--${color}`">
    <div class="stat-card-content">
      <div class="stat-card-info">
        <span class="stat-card-title">{{ title }}</span>
        <span class="stat-card-value" :class="`stat-card-value--${color}`">{{ value }}</span>
      </div>
      <div class="stat-card-icon" :class="`stat-card-icon--${color}`">
        <el-icon :size="28"><component :is="icon" /></el-icon>
      </div>
    </div>
    <div class="stat-card-footer">
      <span class="stat-card-desc">{{ description }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number | string
  icon: any
  color?: 'primary' | 'success' | 'danger' | 'info'
  description?: string
}>()
</script>

<style scoped lang="scss">
.stat-card {
  position: relative;
  padding: 20px;
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    border-radius: 4px 0 0 4px;
  }

  &--primary::before { background: var(--el-color-primary); }
  &--success::before { background: var(--el-color-success); }
  &--danger::before { background: var(--el-color-danger); }
  &--info::before { background: var(--el-color-info); }
}

.stat-card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.stat-card-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;

  &--success { color: var(--el-color-success); }
  &--danger { color: var(--el-color-danger); }
  &--info { color: var(--el-color-info); }
}

.stat-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--primary {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
  &--success {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }
  &--danger {
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
  }
  &--info {
    background: var(--el-color-info-light-9);
    color: var(--el-color-info);
  }
}

.stat-card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.stat-card-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
