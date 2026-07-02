<template>
  <section class="hero-section">
    <div class="hero-inner">
      <div class="hero-content">
        <img class="hero-avatar" src="@/assets/images/blogs/left/shandao2.jpg" alt="avatar" />
        <div class="hero-text">
          <h1 class="hero-name">烈风逍遥</h1>
          <p class="hero-desc">全栈开发 / Vue3 / SpringBoot / 开源爱好者</p>
          <div class="hero-tags">
            <el-tag effect="dark" round size="small">Vue3</el-tag>
            <el-tag effect="dark" round size="small" type="success">TypeScript</el-tag>
            <el-tag effect="dark" round size="small" type="warning">SpringBoot</el-tag>
            <el-tag effect="dark" round size="small" type="danger">OpenLayers</el-tag>
            <el-tag effect="dark" round size="small" type="info">Cesium</el-tag>
          </div>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-item"><span class="stat-num">{{ stats.articleCount }}</span><span class="stat-label">原创文章</span></div>
        <div class="stat-item"><span class="stat-num">{{ stats.totalViews }}</span><span class="stat-label">总阅读</span></div>
        <div class="stat-item"><span class="stat-num">{{ stats.totalLikes }}</span><span class="stat-label">获赞</span></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useBlogStore } from '@/store/modules/blog.ts'

const store = useBlogStore()
const stats = reactive({ articleCount: 0, totalViews: '0', totalLikes: 0 })

const totalViews = computed(() => {
  const total = store.articles.reduce((sum, a) => sum + a.viewCount, 0)
  return total > 1000 ? (total / 1000).toFixed(1) + 'k' : String(total)
})

function updateStats() {
  stats.articleCount = store.articles.length
  stats.totalViews = totalViews.value
  stats.totalLikes = store.articles.reduce((sum, a) => sum + a.likeCount, 0)
}

watch(() => store.articles, updateStats, { immediate: true })

onMounted(() => {
  store.fetchArticles({ pageNum: 1, pageSize: 9999 })
})
</script>

<style lang="scss" scoped>
.hero-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px 0; flex-shrink: 0;
}
.hero-inner { display: flex; justify-content: space-between; align-items: center; padding: 0 40px; }
.hero-content { display: flex; align-items: center; gap: 24px; }
.hero-avatar {
  width: 88px; height: 88px; border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2); object-fit: cover; flex-shrink: 0;
}
.hero-text { color: #fff; }
.hero-name { margin: 0 0 8px 0; font-size: 28px; font-weight: 700; }
.hero-desc { margin: 0 0 14px 0; font-size: 15px; opacity: 0.8; }
.hero-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.hero-tags :deep(.el-tag) { border: none; font-size: 12px; }
.hero-stats { display: flex; gap: 40px; flex-shrink: 0; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #fff; }
.stat-num { font-size: 28px; font-weight: 700; }
.stat-label { font-size: 13px; opacity: 0.7; }
</style>
