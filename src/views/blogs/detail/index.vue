<template>
  <!--
    ArticleDetail —— 文章详情页
    三栏布局：左侧文章列表 | 正文内容 | 右侧目录导航
  -->
  <div class="h-full flex flex-col">
    <!-- 渐变色头部区：标题、元信息、返回按钮 -->
    <div
      class="p-15 color-white border-color-red relative overflow-hidden"
      :style="{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }"
    >
      <div class="w-100% flex items-center justify-between">
        <div>
          <div class="text-30px font-500 p-y-10">{{ article?.title }}</div>
          <div class="flex items-center flex-wrap gap-[16px] text-14px opacity-88">
            <el-tag :type="article?.tagType || 'primary'" size="small" effect="dark">{{ article?.tag }}</el-tag>
            <span class="flex items-center gap-[4px]"><el-icon><Calendar /></el-icon> {{ article?.createTime?.slice(0, 10) }}</span>
            <span class="flex items-center gap-[4px]"><el-icon><View /></el-icon> {{ article?.viewCount }} 阅读</span>
            <span class="flex items-center gap-[4px]"><el-icon><Star /></el-icon> {{ article?.likeCount }} 赞</span>
          </div>
        </div>
        <el-button class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
      </div>
    </div>

    <!-- 三栏主体：左侧列表 | 正文 | 右侧目录 -->
    <div class="flex-1 overflow-hidden p-15">
      <div class="flex gap-[10px] w-full mx-auto h-full items-start">
        <ArticleList v-if="article?.id" :current-id="article.id" />

        <!-- 正文区（独立滚动） -->
        <div class="flex-1 min-w-0 overflow-y-auto h-full pr-[4px] body-inner">
          <p v-if="article?.summary" class="text-15px color-[#606266] lh-[1.8] px-[22px] py-[18px] bg-white rd-10 border-l-4 border-l-[#409eff] ma-0 mb-[22px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            {{ article.summary }}
          </p>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div ref="contentRef" class="bg-white rd-10 px-[36px] py-[28px] text-15px lh-[1.9] color-[#303133] shadow-[0_1px_4px_rgba(0,0,0,0.04)] prose" v-html="article?.contentHtml"></div>
        </div>

        <ArticleToc v-if="article?.contentHtml" :content-html="article.contentHtml" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ArticleDetail —— 文章详情页
 *
 * 功能：
 *   1. 根据路由参数加载指定文章
 *   2. 渲染文章头部（标题、标签、日期、阅读/点赞数）
 *   3. 三栏布局：左侧其他文章列表 | 中间正文 | 右侧目录导航
 *   4. 为正文标题自动注入 id，供目录组件定位
 */
import { onMounted, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { ArrowLeft, Calendar, View, Star } from '@element-plus/icons-vue'
import type { Article } from '@/api/blogs/article.ts'
import ArticleList from './components/ArticleList.vue'
import ArticleToc from './components/ArticleToc.vue'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const article = ref<Article | null>(null)
const contentRef = ref<HTMLElement | null>(null)

/**
 * 为正文中所有 h1/h2/h3 标题元素注入 id
 * 目录组件（ArticleToc）通过此 id 实现锚点定位
 */
function injectHeadingIds() {
  if (!contentRef.value) return
  const headings = contentRef.value.querySelectorAll('h1, h2, h3')
  headings.forEach((el) => {
    const text = el.textContent?.trim() || ''
    if (text && !el.id) {
      el.id = `toc-${btoa(encodeURIComponent(text)).slice(0, 32)}`
    }
  })
}

/** 返回博客首页 */
function goBack() { router.push('/blogsManagement/blogs') }

async function loadArticle(id: number) {
  article.value = await store.fetchArticleById(id)
  await nextTick()
  injectHeadingIds()
}

onMounted(async () => {
  await loadArticle(Number(route.params.id))
})

/** 路由参数变化时重新加载文章（组件复用场景） */
watch(() => route.params.id, async (newId) => {
  if (newId) await loadArticle(Number(newId))
})

/** 当正文 HTML 变化时，重新注入标题 id */
watch(() => article.value?.contentHtml, async () => {
  await nextTick()
  injectHeadingIds()
})
</script>

<!--
  以下 :deep() 样式仅针对 v-html 渲染后的正文 HTML 内容生效，
  用于控制文章正文中的标题/段落/代码块/图片/表格等元素的默认样式。
  由于渲染内容不受组件作用域影响，必须使用 :deep() 穿透。
-->
<style scoped>
/* --- 返回按钮（含半透明 hover 效果） --- */
.back-btn {
  color: #fff;
  margin-right: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 4px 16px;
  height: auto;
  font-size: 13px;
  transition: all 0.2s;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

/* ===== 正文内容排版样式（作用于 v-html 渲染的 HTML） ===== */
:deep(h1), :deep(h2), :deep(h3) {
  margin-top: 28px;
  margin-bottom: 12px;
  scroll-margin-top: 20px;
}
:deep(p) { margin-bottom: 16px; }
:deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  color: #d63384;
}
:deep(pre) {
  background: #1a1a2e;
  color: #f8f8f2;
  padding: 18px 22px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
}
:deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}
:deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
}
:deep(blockquote) {
  border-left: 4px solid #409eff;
  margin: 16px 0;
  padding: 10px 18px;
  background: #f5f7fa;
  border-radius: 0 8px 8px 0;
  color: #606266;
}
:deep(a) { color: #409eff; text-decoration: none; }
:deep(a:hover) { text-decoration: underline; }
:deep(ul), :deep(ol) { padding-left: 24px; margin-bottom: 16px; }
:deep(li) { margin-bottom: 6px; }
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}
:deep(th), :deep(td) {
  border: 1px solid var(--el-border-color-light);
  padding: 10px 14px;
  text-align: left;
}
:deep(th) { background: #f5f7fa; font-weight: 600; }
</style>
