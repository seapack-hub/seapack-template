<!--
  场景卡片组件
  图标 + 名称 + 描述 + 状态 + 操作
-->
<template>
  <div
    class="scene-card"
    :style="{ background: scene.coverColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
  >
    <div class="card-top">
      <div class="card-icon">{{ scene.icon || scene.name?.charAt(0) || 'S' }}</div>
      <el-switch
        :model-value="scene.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', scene, val)"
      />
    </div>
    <div class="card-name">{{ scene.name }}</div>
    <div class="card-desc">{{ scene.description || '暂无描述' }}</div>
    <div class="card-footer">
      <span class="text-12px opacity-70">使用 {{ scene.useCount || 0 }} 次</span>
      <div class="flex gap-4px">
        <el-button link size="small" class="!text-white !opacity-80 hover:!opacity-100" @click="emit('edit', scene)">编辑</el-button>
        <el-button link size="small" class="!text-white !opacity-80 hover:!opacity-100" @click="emit('config', scene)">配置</el-button>
        <el-button link size="small" class="!text-white !opacity-80 hover:!opacity-100" @click="emit('copy', scene)">复制</el-button>
        <el-button link size="small" class="!text-white !opacity-80 hover:!opacity-100" @click="emit('delete', scene)">删除</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Scene } from '@/api/ai/scene'

defineProps<{ scene: Scene }>()

const emit = defineEmits<{
  edit: [scene: Scene]
  config: [scene: Scene]
  copy: [scene: Scene]
  delete: [scene: Scene]
  statusChange: [scene: Scene, val: number]
}>()
</script>

<style scoped>
.scene-card {
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: white;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}
.scene-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}
.card-name {
  font-size: 16px;
  font-weight: 600;
}
.card-desc {
  font-size: 12px;
  opacity: 0.85;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 10px;
}
</style>
