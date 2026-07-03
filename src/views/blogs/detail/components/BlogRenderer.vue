<template>
  <div class="flex-1 min-w-0 overflow-y-auto h-full pr-1">
    <p
      v-if="summary"
      class="text-15px color-[#606266] leading-[1.8] p-[18px_22px] bg-white rounded-10px border-l-4 border-l-[#409eff] m-0_0_22px_0 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
    >
      {{ summary }}
    </p>
    <div
      ref="contentRef"
      class="bg-white rounded-10px p-[20px_24px] text-15px leading-[1.9] color-[#303133] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
      v-html="safeHtml"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { renderSafeHtml } from '@/views/blogs/utils/sanitize.ts'
import { highlightCode, injectHeadingIds } from '@/views/blogs/utils/highlight.ts'
import '@/views/blogs/styles/content.scss'

const props = defineProps<{
  contentHtml: string
  summary?: string
}>()

const contentRef = ref<HTMLElement | null>(null)
const safeHtml = ref('')

watch(() => props.contentHtml, async (val) => {
  if (!val) { safeHtml.value = ''; return }
  safeHtml.value = await renderSafeHtml(val)
  await nextTick()
  highlightCode(contentRef.value)
  injectHeadingIds(contentRef.value)
}, { immediate: false })
</script>
