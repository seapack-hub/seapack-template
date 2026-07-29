<!--
  AiAssistant/SceneSelector.vue — 场景选择器

  职责：
    1. 显示当前场景状态（已选择/未选择）
    2. 弹出场景列表供用户选择
    3. 支持场景搜索

  Props：
    - isSceneMode: 是否处于场景模式
    - sceneName: 当前场景名称

  Emits：
    - select: 选择场景
    - unbind: 取消场景绑定
-->
<template>
  <div class="scene-bar px-12px py-8px flex items-center gap-8px" style="border-bottom: 1px solid var(--el-border-color-light)">
    <span class="text-12px color-#909399 shrink-0">场景：</span>
    <div v-if="isSceneMode" class="flex items-center gap-6px flex-1 min-w-0">
      <el-tag size="small" type="success" class="flex-1 min-w-0">
        <span class="overflow-hidden text-ellipsis whitespace-nowrap block">{{ sceneName }}</span>
      </el-tag>
      <el-button size="small" text type="info" @click="emit('unbind')">取消</el-button>
    </div>
    <div v-else class="flex-1">
      <el-popover placement="bottom-start" :width="360" trigger="click" @show="loadScenes">
        <template #reference>
          <el-button class="w-full">
            <el-icon style="margin-right: 4px"><Grid /></el-icon>
            选择场景开始专业对话
          </el-button>
        </template>
        <div class="scene-list">
          <el-input
            v-model="searchText"
            placeholder="搜索场景..."
            clearable
            class="mb-8px"
          />
          <div v-if="loading" class="flex justify-center py-12px">
            <el-icon class="is-loading" :size="18"><Loading /></el-icon>
          </div>
          <div v-else-if="filteredScenes.length === 0" class="text-14px color-#909399 text-center py-12px">
            暂无可用场景
          </div>
          <div v-else class="grid grid-cols-2 gap-6px max-h-200px overflow-y-auto">
            <div
              v-for="scene in filteredScenes"
              :key="scene.id"
              class="scene-option flex flex-col items-center gap-2px px-6px py-8px border rounded-6px cursor-pointer bg-#fff transition-all duration-150 hover:border-[var(--el-color-primary)] hover:bg-[var(--el-color-primary-light-9)]"
              style="border-color: var(--el-border-color-lighter)"
              @click="handleSelect(scene)"
            >
              <Icon :name="scene.icon || 'ChatDotSquare'" :size="18" :color="scene.coverColor || '#409eff'" />
              <span class="text-11px font-500 color-#303133 text-center">{{ scene.name }}</span>
            </div>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Loading, Grid } from '@element-plus/icons-vue'
import { SceneAPI, type Scene } from '@/api/ai/scene'
import Icon from '@/components/Icon/index.vue'

// ===== Props =====
defineProps<{
  isSceneMode: boolean
  sceneName: string
}>()

// ===== Emits =====
const emit = defineEmits<{
  select: [scene: Scene]
  unbind: []
}>()

// ===== 状态 =====
const scenes = ref<Scene[]>([])
const loading = ref(false)
const searchText = ref('')

// ===== 计算属性 =====
const filteredScenes = computed(() => {
  if (!searchText.value) return scenes.value
  const q = searchText.value.toLowerCase()
  return scenes.value.filter(s =>
    s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  )
})

// ===== 方法 =====
async function loadScenes() {
  if (scenes.value.length > 0) return
  loading.value = true
  try {
    scenes.value = await SceneAPI.list()
  } catch {
    scenes.value = []
  } finally {
    loading.value = false
  }
}

function handleSelect(scene: Scene) {
  emit('select', scene)
  searchText.value = ''
  document.body.click()
}
</script>

<style scoped lang="scss">
.scene-option {
  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
</style>
