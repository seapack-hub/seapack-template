<template>
  <!-- 自动滚动表格：数据轮播滚动，悬停暂停 -->
  <div
    class="scroll-table"
    :style="{ '--primary': primaryColor, '--text': textColor, '--text-sec': textSecondary, '--border': borderColor }"
    @mouseenter="pause = true"
    @mouseleave="pause = false"
  >
    <div class="scroll-table-header">
      <div v-for="col in columns" :key="col.key" class="scroll-table-th" :style="{ width: col.width || 'auto' }">
        {{ col.label }}
      </div>
    </div>
    <div class="scroll-table-body">
      <div
        class="scroll-table-rows"
        :style="{ transform: `translateY(-${offset}px)`, transition: scrollTransition }"
      >
        <!-- 双倍渲染实现无缝循环：数据复制一份，滚动到头时跳回 0 -->
        <div
          v-for="(row, ri) in displayRows"
          :key="ri"
          class="scroll-table-row"
        >
          <div
            v-for="col in columns"
            :key="col.key"
            class="scroll-table-td"
            :style="{ width: col.width || 'auto' }"
          >
            <slot :name="'cell-' + col.key" :row="row" :value="(row as any)[col.key]">
              {{ (row as any)[col.key] }}
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Column {
  key: string    // 字段名
  label: string  // 列标题
  width?: string // 列宽（如 '80px'）
}

interface Props {
  data: any[]
  columns: Column[]
  rowHeight?: number  // 每行高度 px
  interval?: number   // 滚动间隔 ms
  primaryColor?: string
  textColor?: string
  textSecondary?: string
  borderColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 36,
  interval: 2500,
  primaryColor: '#00d4ff',
  textColor: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.65)',
  borderColor: 'rgba(0,212,255,0.15)',
})

const offset = ref(0)          // 当前 translateY 偏移量
const pause = ref(false)       // 鼠标悬停时暂停滚动
let timer: ReturnType<typeof setInterval> | null = null

// 数据双倍复制，实现无缝循环
const displayRows = computed(() => {
  if (props.data.length <= 1) return props.data
  return [...props.data, ...props.data]
})

// 暂停时取消过渡动画，避免闪烁
const scrollTransition = computed(() => {
  if (pause.value) return 'none'
  return 'transform 0.5s ease-in-out'
})

// 每次滚动一行，滚动完一轮后瞬移回顶部
const scroll = () => {
  if (pause.value || props.data.length <= 1) return
  const total = props.data.length * props.rowHeight
  offset.value += props.rowHeight
  if (offset.value >= total) {
    setTimeout(() => {
      offset.value = 0
    }, 500)
  }
}

onMounted(() => {
  timer = setInterval(scroll, props.interval)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.scroll-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.scroll-table-header {
  display: flex;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 4px;
}

.scroll-table-th {
  color: var(--text-sec);
  font-weight: 600;
  padding: 0 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.scroll-table-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.scroll-table-rows {
  will-change: transform;
}

.scroll-table-row {
  display: flex;
  height: v-bind('props.rowHeight + "px"');
  align-items: center;
  border-bottom: 1px solid var(--border);
  border-bottom-color: color-mix(in srgb, var(--border) 40%, transparent);

  &:hover {
    background: color-mix(in srgb, var(--primary) 6%, transparent);
  }
}

.scroll-table-td {
  padding: 0 8px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}
</style>
