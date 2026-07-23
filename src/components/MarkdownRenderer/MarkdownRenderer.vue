<!--
  MarkdownRenderer - 公共 Markdown 渲染组件
  将 Markdown 文本转为 HTML 并渲染，支持代码高亮、复制按钮、表格等完整排版
  复用 sanitize.ts 的 renderSafeHtml 管线 + highlight.ts 的代码高亮
-->
<template>
  <div ref="contentRef" class="blog-renderer content" v-html="safeHtml" />
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { renderSafeHtml } from '@/views/blogs/utils/sanitize'
import { highlightCode, injectCopyButtons } from '@/utils/highlight'
import '@/styles/content.scss'

const props = defineProps<{
  /** Markdown 原始文本 */
  content: string
}>()

const contentRef = ref<HTMLElement | null>(null)
const safeHtml = ref('')

let observer: MutationObserver | null = null

watch(() => props.content, async (val) => {
  if (!val) { safeHtml.value = ''; return }
  try {
    safeHtml.value = await renderSafeHtml(val)
    await nextTick()
    applyHighlight()
  } catch (e) {
    console.error('[MarkdownRenderer] render failed:', e)
    safeHtml.value = val
  }
}, { immediate: true })

function applyHighlight() {
  if (!contentRef.value) return
  highlightCode(contentRef.value)
  injectCopyButtons(contentRef.value)
}

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>
