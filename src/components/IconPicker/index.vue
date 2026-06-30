<template>
  <el-popover
    ref="popoverRef"
    placement="bottom-start"
    :width="width"
    trigger="click"
    v-bind="$attrs"
    @hide="onPopoverHide"
  >
    <!-- 图标选择面板 -->
    <div class="icon-picker-panel">
      <!-- 搜索栏 -->
      <div class="icon-picker-panel__search">
        <el-input
          v-model="search"
          placeholder="搜索图标..."
          :prefix-icon="Search"
          clearable
          size="small"
        />
      </div>
      <!-- 图标网格 -->
      <div class="icon-picker-panel__grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-picker-panel__item"
          :class="{ 'is-selected': modelValue === icon }"
          :title="icon"
          @click="selectIcon(icon)"
        >
          <component :is="iconComponents[icon]" style="width: 18px; height: 18px;" />
        </div>
        <div v-if="!filteredIcons.length" class="icon-picker-panel__empty">
          未找到匹配的图标
        </div>
      </div>
    </div>
    <!-- 触发元素 -->
    <template #reference>
      <div class="icon-picker-trigger">
        <el-input
          :model-value="modelValue"
          readonly
          :placeholder="placeholder"
          :clearable="clearable"
          v-bind="$attrs"
          @clear="onClear"
        >
          <template #prefix>
            <component
              :is="iconComponents[modelValue]"
              v-if="modelValue && iconComponents[modelValue]"
              style="width: 16px; height: 16px; color: #409eff;"
            />
          </template>
          <template #append>
            <el-icon style="cursor: pointer;"><ArrowDown /></el-icon>
          </template>
        </el-input>
      </div>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'

withDefaults(defineProps<{
  /** 弹出面板宽度 */
  width?: number
  /** 输入框占位符 */
  placeholder?: string
  /** 是否可清除 */
  clearable?: boolean
}>(), {
  width: 340,
  placeholder: '请选择图标',
  clearable: false,
})

const modelValue = defineModel<string>({ default: '' })

const emit = defineEmits<{
  select: [iconName: string]
  clear: []
}>()

const popoverRef = ref<any>(null)
const search = ref('')

/** 所有 Element Plus 图标组件映射 */
const iconComponents: Record<string, any> = ElementPlusIcons

/** 所有图标名称列表 */
const allIcons = Object.keys(iconComponents).sort()

/** 根据搜索过滤 */
const filteredIcons = computed(() => {
  if (!search.value) return allIcons
  const kw = search.value.toLowerCase()
  return allIcons.filter(name => name.toLowerCase().includes(kw))
})

function selectIcon(name: string) {
  modelValue.value = name
  emit('select', name)
  popoverRef.value?.hide()
}

function onPopoverHide() {
  search.value = ''
}

function onClear() {
  modelValue.value = ''
  emit('clear')
}
</script>

<style scoped lang="scss">
.icon-picker-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__search {
    flex-shrink: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
    gap: 5px;
    max-height: 260px;
    overflow-y: auto;
    padding: 2px;
    scrollbar-width: thin;
    scrollbar-color: #d0d5dd transparent;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    color: var(--el-text-color-regular);

    &:hover {
      border-color: #409eff;
      color: #409eff;
      background: #f0f7ff;
    }

    &.is-selected {
      border-color: #409eff;
      color: #fff;
      background: #409eff;
    }
  }

  &__empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 24px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.icon-picker-trigger {
  cursor: pointer;
}
</style>
