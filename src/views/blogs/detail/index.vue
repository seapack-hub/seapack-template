<!--
  ArticleDetail —— 文章详情页

  功能：
    1. 展示文章标题、摘要、元信息（标签/日期/阅读/点赞）
    2. 文章正文 HTML 渲染（contentHtml 由后端生成）
    3. 渐变色头部 + 返回按钮
-->
<template>
  <div class="article-detail">
    <div class="detail-header" :style="{ background: article?.coverColor || 'linear-gradient(135deg, #667eea, #764ba2)' }">
      <div class="header-content">
        <el-button class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <h1 class="article-title">{{ article?.title }}</h1>
        <div class="article-meta">
          <el-tag :type="article?.tagType || 'primary'" size="small" effect="dark">{{ article?.tag }}</el-tag>
          <span class="meta-item"><el-icon><Calendar /></el-icon> {{ article?.createTime?.slice(0, 10) }}</span>
          <span class="meta-item"><el-icon><View /></el-icon> {{ article?.viewCount }} 阅读</span>
          <span class="meta-item"><el-icon><Star /></el-icon> {{ article?.likeCount }} 赞</span>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <div class="body-inner">
        <p v-if="article?.summary" class="article-summary">{{ article.summary }}</p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="article-content prose" v-html="article?.contentHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { ArrowLeft, Calendar, View, Star } from '@element-plus/icons-vue'
import type { Article } from '@/api/blogs/article.ts'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const article = ref<Article | null>(null)

/** 返回博客首页 */
function goBack() { router.push('/blogsManagement/blogs') }

onMounted(async () => {
  const id = Number(route.params.id)
  article.value = await store.fetchArticleById(id)
})
</script>

<style scoped>
.article-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 48px 0 36px;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.header-content {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
}

.back-btn {
  color: #fff;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 4px 16px;
  height: auto;
  font-size: 13px;
  transition: all 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 14px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  opacity: 0.88;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px 0 48px;
}

.body-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
}

.article-summary {
  font-size: 15px;
  color: #606266;
  line-height: 1.8;
  padding: 18px 22px;
  background: #fff;
  border-radius: 10px;
  border-left: 4px solid #409eff;
  margin: 0 0 22px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.article-content {
  background: #fff;
  border-radius: 10px;
  padding: 28px 36px;
  font-size: 15px;
  line-height: 1.9;
  color: #303133;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

:deep(h1), :deep(h2), :deep(h3) {
  margin-top: 28px;
  margin-bottom: 12px;
}

:deep(p) {
  margin-bottom: 16px;
}

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

:deep(a) {
  color: #409eff;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

:deep(ul), :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

:deep(li) {
  margin-bottom: 6px;
}

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

:deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}
</style>
