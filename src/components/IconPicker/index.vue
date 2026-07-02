<!--
  IconPicker 图标选择器公共组件
  支持双 Tab 切换：
    - Element Plus 图标（~293 个）
    - 自定义 SVG 图标（来自 Iconfont + 本地 SVG 精灵）
-->
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
      <!-- 分类 Tab -->
      <el-tabs v-model="activeTab" size="small" class="icon-picker-tabs">
        <el-tab-pane label="Element Plus" name="ep" />
        <el-tab-pane label="自定义 SVG" name="svg" />
      </el-tabs>

      <!-- 搜索栏 -->
      <div class="icon-picker-panel__search">
        <el-input
          v-model="search"
          :placeholder="activeTab === 'ep' ? '搜索 EP 图标...' : '搜索 SVG 图标...'"
          :prefix-icon="Search"
          clearable
          size="small"
        />
      </div>

      <!-- 图标网格 -->
      <div class="icon-picker-panel__grid">
        <!-- EP 图标 -->
        <template v-if="activeTab === 'ep'">
          <div
            v-for="icon in filteredEPIcons"
            :key="icon"
            class="icon-picker-panel__item"
            :class="{ 'is-selected': modelValue === icon }"
            :title="icon"
            @click="selectIcon(icon)"
          >
            <component :is="epComponents[icon]" style="width: 18px; height: 18px;" />
          </div>
        </template>

        <!-- SVG 图标 -->
        <template v-else>
          <div
            v-for="icon in filteredSVGIcons"
            :key="icon.name"
            class="icon-picker-panel__item"
            :class="{ 'is-selected': modelValue === icon.name }"
            :title="icon.label"
            @click="selectIcon(icon.name)"
          >
            <Icon :name="icon.name" :size="18" />
          </div>
        </template>

        <div v-if="filteredIconsCount === 0" class="icon-picker-panel__empty">
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
            <Icon
              v-if="modelValue"
              :name="modelValue"
              :size="16"
              color="#409eff"
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
import { computed, ref, onMounted } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { ICONFONT_GLYPHS } from '@/config/iconfont'

withDefaults(defineProps<{
  width?: number
  placeholder?: string
  clearable?: boolean
}>(), {
  width: 360,
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
const activeTab = ref<'ep' | 'svg'>('ep')

/** 所有 EP 图标组件映射 */
const epComponents: Record<string, any> = ElementPlusIcons
/** EP 图标名列表 */
const epIcons = Object.keys(epComponents).sort()

/** SVG 图标列表（Iconfont + 本地精灵图中的额外图标） */
const svgIcons = ref<{ name: string; label: string }[]>([])

onMounted(() => {
  // 从 iconfont.json 读取
  const fromIconfont = ICONFONT_GLYPHS.map(g => ({
    name: g.font_class,
    label: g.name || g.font_class,
  }))

  // 从 DOM 收集 vite-plugin-svg-icons 注册的额外 SVG symbol
  const iconfontNames = new Set(fromIconfont.map(i => i.name))
  const extra: { name: string; label: string }[] = []
  try {
    const symbols = document.querySelectorAll('symbol[id^="icon-"]')
    symbols.forEach(s => {
      const id = s.id.replace('icon-', '')
      if (!iconfontNames.has(id)) {
        extra.push({ name: id, label: id })
      }
    })
  } catch { /* SSR 环境忽略 */ }

  svgIcons.value = [...fromIconfont, ...extra]
})

/** 过滤后的 EP 图标 */
const filteredEPIcons = computed(() => {
  if (!search.value) return epIcons
  const kw = search.value.toLowerCase()
  return epIcons.filter(name => name.toLowerCase().includes(kw))
})

/** 过滤后的 SVG 图标 */
const filteredSVGIcons = computed(() => {
  if (!search.value) return svgIcons.value
  const kw = search.value.toLowerCase()
  return svgIcons.value.filter(
    i => i.name.toLowerCase().includes(kw) || i.label.toLowerCase().includes(kw),
  )
})

/** 当前可见图标数量 */
const filteredIconsCount = computed(() => {
  return activeTab.value === 'ep' ? filteredEPIcons.value.length : filteredSVGIcons.value.length
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

  .icon-picker-tabs {
    flex-shrink: 0;
  }

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
