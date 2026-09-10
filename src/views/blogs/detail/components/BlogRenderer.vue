<template>
  <div class="blog-renderer flex-1 min-w-0 overflow-y-auto h-full pr-1">
    <div
      v-if="summary"
      class="summary-card m-b-22px rounded-10px p-[18px_22px] border border-solid border-[#d0d5f0] border-l-4 border-l-[#667eea] bg-[#eef0fb] shadow-[0_2px_8px_rgba(102,126,234,0.08)]"
    >
      <div class="flex items-center gap-6px m-b-10px">
        <span class="summary-label inline-block px-8px py-2px rounded-4px text-12px font-500 color-white bg-[#667eea]">摘要</span>
      </div>
      <p class="text-14px color-[#4a5568] leading-[1.8] m-0">{{ summary }}</p>
    </div>
    <div
      ref="contentRef"
      class="content bg-white rounded-10px p-[20px_24px] text-15px leading-[1.9] color-[#303133] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
      v-html="safeHtml"
    ></div>
    <div
      v-if="renderError"
      class="m-t-12 text-13px color-[#909399]"
    >
      内容渲染异常，已显示原始内容
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { renderSafeHtml } from '@/views/blogs/utils/sanitize.ts'
import { highlightCode, injectCopyButtons, injectHeadingIds } from '@/utils/highlight'
import '@/styles/content.scss'

const props = defineProps<{
  contentHtml: string
  summary?: string
}>()

const contentRef = ref<HTMLElement | null>(null)
const safeHtml = ref('')
const renderError = ref(false)

watch(() => props.contentHtml, async (val) => {
  if (!val) { safeHtml.value = ''; renderError.value = false; return }
  try {
    renderError.value = false
    safeHtml.value = await renderSafeHtml(val)
    await nextTick()
    highlightCode(contentRef.value)
    injectCopyButtons(contentRef.value)
    injectHeadingIds(contentRef.value)
  } catch (e) {
    console.error('[BlogRenderer] renderSafeHtml failed:', e)
    renderError.value = true
    safeHtml.value = val
  }
}, { immediate: true })
</script>
