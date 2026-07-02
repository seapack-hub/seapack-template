<template>
  <!--
    右侧边栏：文章目录导航
    自动从正文 HTML 中提取 h1/h2/h3 标题，生成可点击的锚点目录；
    滚动内容时高亮当前所在标题
  -->
  <aside
    v-if="headings.length > 0"
    class="flex-shrink-0 w-[220px] bg-white rd-10 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden sticky top-0 self-start max-h-full"
  >
    <!-- 面板标题 -->
    <div class="flex-shrink-0 px-[18px] py-[12px] border-b border-b-[var(--el-border-color-lighter)]">
      <h3 class="ma-0 text-15px font-600 color-[#303133] flex items-center gap-[6px]">
        <el-icon><List /></el-icon>
        <span>目录</span>
      </h3>
    </div>

    <!-- 目录项列表 -->
    <div class="flex-1 overflow-y-auto py-[8px]">
      <nav class="flex flex-col">
        <a
          v-for="(item, index) in headings"
          :key="index"
          :class="[
            'block px-[18px] py-[6px] text-13px color-[#606266] no-underline lh-[1.6] border-l-2 border-l-transparent transition-all-200 overflow-hidden text-ellipsis whitespace-nowrap',
            index === activeIndex
              ? 'color-[#409eff] bg-[#ecf5ff] border-l-[#409eff] font-500'
              : 'hover:color-[#409eff] hover:bg-[#f5f7fa]',
            `pl-[${18 + (item.level - 1) * 14}px]`,
            item.level === 1 ? 'font-600' : '',
            item.level === 3 ? 'text-12px' : '',
          ]"
          :title="item.text"
          @click.prevent="scrollToHeading(index)"
        >
          {{ item.text }}
        </a>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * ArticleToc —— 右侧文章目录导航组件
 *
 * 功能：
 *   1. 根据传入的 HTML 内容提取 h1/h2/h3 标题
 *   2. 点击目录项平滑滚动到对应标题位置
 *   3. 监听正文滚动，自动高亮当前所在标题
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { List } from '@element-plus/icons-vue'

/** 目录项数据结构 */
interface TocItem {
  id: string    // 标题 DOM 元素 id
  text: string  // 标题文本
  level: number // 标题层级：1 / 2 / 3
}

/** 正文 HTML 内容，由父组件传入 */
const props = defineProps<{ contentHtml: string }>()

const headings = ref<TocItem[]>([])
const activeIndex = ref(0)

/**
 * 从 HTML 字符串中提取所有 h1/h2/h3 标题
 */
function extractHeadings(html: string): TocItem[] {
  const result: TocItem[] = []
  const temp = document.createElement('div')
  temp.innerHTML = html
  const elements = temp.querySelectorAll('h1, h2, h3')
  elements.forEach((el) => {
    const tag = el.tagName.toLowerCase()
    const level = parseInt(tag.replace('h', ''), 10)
    const text = el.textContent?.trim() || ''
    if (text) {
      // 以标题文本的 base64 作为唯一 id（转义中文等字符）
      const id = `toc-${btoa(encodeURIComponent(text)).slice(0, 32)}`
      result.push({ id, text, level })
    }
  })
  return result
}

/**
 * 点击目录项，平滑滚动到正文中对应标题的位置
 */
function scrollToHeading(index: number) {
  const item = headings.value[index]
  if (!item) return
  const el = document.getElementById(item.id)
  if (el) {
    activeIndex.value = index
    const bodyInner = document.querySelector('.body-inner')
    if (bodyInner) {
      const top = el.getBoundingClientRect().top - bodyInner.getBoundingClientRect().top + bodyInner.scrollTop - 20
      bodyInner.scrollTo({ top, behavior: 'smooth' })
    }
  }
}

/** 滚动节流定时器 */
let scrollTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 滚动事件回调（节流 80ms）
 * 从后向前遍历标题，找到第一个位于可视区域上方的标题并高亮
 */
function onScroll() {
  if (scrollTimer) return
  scrollTimer = setTimeout(() => {
    scrollTimer = null
    const bodyInner = document.querySelector('.body-inner')
    if (!bodyInner || headings.value.length === 0) return

    const bodyRect = bodyInner.getBoundingClientRect()

    let bestIndex = 0
    for (let i = headings.value.length - 1; i >= 0; i--) {
      const el = document.getElementById(headings.value[i].id)
      if (el) {
        const top = el.getBoundingClientRect().top - bodyRect.top
        if (top <= 80) {
          bestIndex = i
          break
        }
      }
    }
    activeIndex.value = bestIndex
  }, 80)
}

/** 监听 HTML 内容变化，重新提取目录 */
watch(
  () => props.contentHtml,
  (html) => {
    if (html) {
      headings.value = extractHeadings(html)
    }
  },
  { immediate: true }
)

onMounted(() => {
  const bodyInner = document.querySelector('.body-inner')
  bodyInner?.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  const bodyInner = document.querySelector('.body-inner')
  bodyInner?.removeEventListener('scroll', onScroll)
  if (scrollTimer) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }
})
</script>
