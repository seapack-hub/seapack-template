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
        <div class="flex gap-[8px]">
          <el-button class="back-btn" @click="copyContent">
            <el-icon><CopyDocument /></el-icon> 复制
          </el-button>
          <el-button class="back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回
          </el-button>
        </div>
      </div>
    </div>

    <!-- 三栏主体：左侧列表 | 正文 | 右侧目录 -->
    <div class="flex-1 overflow-hidden p-[12px]">
      <div class="flex gap-[10px] w-full mx-auto h-full items-start">
        <ArticleList v-if="article?.id" :current-id="article.id" />

        <!-- 正文区（使用 BlogRenderer 组件，含 sanitize-html + highlight.js） -->
        <BlogRenderer
          class="body-inner"
          :content-html="article?.contentHtml || ''"
          :summary="article?.summary"
        />

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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { ArrowLeft, Calendar, View, Star, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Article } from '@/api/blogs/article.ts'
import ArticleList from './components/ArticleList.vue'
import ArticleToc from './components/ArticleToc.vue'
import BlogRenderer from './components/BlogRenderer.vue'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const article = ref<Article | null>(null)

/** 复制文章全文到剪贴板 */
function copyContent() {
  const raw = article.value
  const text = raw ? `${raw.title}\n\n${raw.summary || ''}\n\n${raw.contentHtml?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || ''}` : ''
  if (!text) {
    ElMessage.warning('暂无内容');
    return
  }
  navigator.clipboard.writeText(text)
    .then(() => ElMessage.success('已复制到剪贴板'))
    .catch(() => ElMessage.error('复制失败'))
}

/** 返回博客首页 */
function goBack() { router.push('/blogsManagement/blogs') }

async function loadArticle(id: number) {
  article.value = await store.fetchArticleById(id)
}

onMounted(async () => {
  await loadArticle(Number(route.params.id))
})

/** 路由参数变化时重新加载文章 */
watch(() => route.params.id, async (newId) => {
  if (newId) await loadArticle(Number(newId))
})
</script>

<!--
  页面级别的样式：头部渐变区、返回按钮。
  正文排版样式已移至 BlogRenderer 组件的全局样式中。
-->
<style scoped>
.back-btn {
  color: #fff;
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
</style>
