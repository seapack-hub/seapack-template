<template>
  <div class="blog-page">
    <!-- 顶部导航 -->
    <header class="blog-header">
      <div class="header-inner">
        <div class="header-left">
          <span class="logo-text">Sea Pack</span>
          <span class="logo-sub">技术博客</span>
        </div>
        <nav class="header-nav">
          <a class="nav-link active">首页</a>
          <a class="nav-link" href="https://juejin.cn/user/2071912223613783" target="_blank">
            <el-icon><Connection /></el-icon>
            掘金主页
          </a>
        </nav>
      </div>
    </header>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-inner">
        <div class="hero-content">
          <img
            class="hero-avatar"
            src="@/assets/images/blogs/left/shandao2.jpg"
            alt="avatar"
          />
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
          <div class="stat-item">
            <span class="stat-num">12</span>
            <span class="stat-label">原创文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">5k+</span>
            <span class="stat-label">总阅读</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">86</span>
            <span class="stat-label">获赞</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 文章列表 -->
    <section class="articles-section">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="section-title">最新文章</h2>
          <div class="filter-tabs">
            <span
              v-for="tab in tabs"
              :key="tab.key"
              class="filter-tab"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </span>
          </div>
        </div>

        <div class="articles-grid">
          <div
            v-for="article in filteredArticles"
            :key="article.id"
            class="article-card"
            @click="openArticle(article.link)"
          >
            <div class="article-cover" :style="{ background: article.coverBg }">
              <span class="cover-icon">{{ article.icon }}</span>
            </div>
            <div class="article-body">
              <div class="article-meta">
                <el-tag :type="article.tagType" size="small" effect="plain">{{ article.tag }}</el-tag>
                <span class="article-date">{{ article.date }}</span>
              </div>
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-desc">{{ article.desc }}</p>
              <div class="article-footer">
                <span class="article-views">
                  <el-icon><View /></el-icon> {{ article.views }}
                </span>
                <span class="article-link">
                  阅读全文 <el-icon><ArrowRight /></el-icon>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="articles-more">
          <el-button round @click="openJuejin">
            <el-icon><Connection /></el-icon>
            查看更多文章 →
          </el-button>
        </div>
      </div>
    </section>

    <!-- 开源项目 -->
    <section class="projects-section">
      <div class="section-inner">
        <h2 class="section-title">开源项目</h2>
        <div class="projects-grid">
          <div
            v-for="project in projects"
            :key="project.name"
            class="project-card"
            @click="openProject(project.url)"
          >
            <div class="project-icon" :style="{ background: project.bgColor }">
              <SPIcon :name="project.icon" :size="28" :color="project.color" />
            </div>
            <div class="project-info">
              <h4 class="project-name">{{ project.name }}</h4>
              <p class="project-desc">{{ project.desc }}</p>
            </div>
            <el-icon class="project-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="blog-footer">
      <div class="footer-inner">
        <p>© 2025 Sea Pack · 烈风逍遥</p>
        <div class="footer-links">
          <el-link
            href="https://juejin.cn/user/2071912223613783"
            target="_blank"
            :underline="false"
          >
            <SPIcon name="juejin" :size="18" /> 掘金
          </el-link>
          <el-divider direction="vertical" />
          <el-link href="https://gitee.com/zenghaifenga/seapack-template" target="_blank" :underline="false">
            <SPIcon name="gitee" :size="18" /> Gitee
          </el-link>
          <el-divider direction="vertical" />
          <el-link href="https://github.com/seapack-hub" target="_blank" :underline="false">
            <SPIcon name="github" :size="18" /> GitHub
          </el-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Connection, View, ArrowRight } from '@element-plus/icons-vue'

const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'vue', label: 'Vue3' },
  { key: 'java', label: 'Java' },
  { key: 'gis', label: 'GIS' },
  { key: 'other', label: '其他' },
]

interface Article {
  id: number
  title: string
  desc: string
  tag: string
  tagType: '' | 'success' | 'warning' | 'danger' | 'info'
  category: string
  date: string
  views: string
  icon: string
  coverBg: string
  link: string
}

const articles = ref<Article[]>([
  {
    id: 1,
    title: 'Vue3 + Element Plus 实现企业级权限管理系统',
    desc: '从零搭建基于 RBAC 模型的后台管理系统，包含用户、角色、菜单权限的完整 CRUD 与动态路由加载。',
    tag: 'Vue3',
    tagType: '',
    category: 'vue',
    date: '2025-06-10',
    views: '1.2k',
    icon: '🔐',
    coverBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    link: 'https://juejin.cn/post/7510000000000000001',
  },
  {
    id: 2,
    title: 'OpenLayers + Vue3 实现热力图与矢量图层',
    desc: '基于 OpenLayers 9 实现地图热力图、矢量标注、图层切换等 GIS 功能，附完整代码。',
    tag: 'GIS',
    tagType: 'success',
    category: 'gis',
    date: '2025-05-28',
    views: '856',
    icon: '🗺️',
    coverBg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    link: 'https://juejin.cn/post/7500000000000000001',
  },
  {
    id: 3,
    title: 'Cesium 3D 地图入门：从加载地球到粒子特效',
    desc: 'Cesium 快速上手指南，涵盖相机控制、3D 模型加载、GeoJSON 数据展示与雨雪粒子特效。',
    tag: 'GIS',
    tagType: 'success',
    category: 'gis',
    date: '2025-05-15',
    views: '1.5k',
    icon: '🌍',
    coverBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    link: 'https://juejin.cn/post/7490000000000000001',
  },
  {
    id: 4,
    title: 'SpringBoot + MyBatis-Plus 实现通用 CRUD 接口',
    desc: '封装一套通用的增删改查接口，减少重复代码，提升后端开发效率。',
    tag: 'Java',
    tagType: 'warning',
    category: 'java',
    date: '2025-04-20',
    views: '2.1k',
    icon: '☕',
    coverBg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    link: 'https://juejin.cn/post/7480000000000000001',
  },
  {
    id: 5,
    title: 'Vue3 电子签名组件：Canvas 实现手写签名',
    desc: '使用 Canvas API 实现支持压感、颜色选择、撤销重做的电子签名组件。',
    tag: 'Vue3',
    tagType: '',
    category: 'vue',
    date: '2025-04-08',
    views: '932',
    icon: '✍️',
    coverBg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    link: 'https://juejin.cn/post/7470000000000000001',
  },
  {
    id: 6,
    title: 'ECharts 实现中国地图与迁徙图可视化',
    desc: '基于 ECharts 5 实现中国地图下钻、迁徙动画、热力分布等数据可视化大屏常用图表。',
    tag: '其他',
    tagType: 'info',
    category: 'other',
    date: '2025-03-25',
    views: '1.8k',
    icon: '📊',
    coverBg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    link: 'https://juejin.cn/post/7460000000000000001',
  },
])

const filteredArticles = computed(() => {
  if (activeTab.value === 'all') return articles.value
  return articles.value.filter(a => a.category === activeTab.value)
})

const projects = ref([
  {
    name: 'Sea Pack Template',
    desc: '企业级后台管理模板 · Vue3 + TypeScript + Vite',
    icon: 'home',
    color: '#409eff',
    bgColor: 'rgba(64,158,255,0.1)',
    url: 'https://gitee.com/zenghaifenga/seapack-template',
  },
  {
    name: 'Vue3 GIS Toolkit',
    desc: 'OpenLayers + Cesium 地图组件库',
    icon: 'gis',
    color: '#67c23a',
    bgColor: 'rgba(103,194,58,0.1)',
    url: 'https://gitee.com/zenghaifenga/seapack-template',
  },
  {
    name: 'Stock Monitor',
    desc: '股票实时监控与告警系统',
    icon: 'trend-charts',
    color: '#e6a23c',
    bgColor: 'rgba(230,162,60,0.1)',
    url: 'https://gitee.com/zenghaifenga/seapack-template',
  },
])

function openArticle(link: string) {
  window.open(link, '_blank')
}

function openProject(url: string) {
  window.open(url, '_blank')
}

function openJuejin() {
  window.open('https://juejin.cn/user/2071912223613783', '_blank')
}
</script>

<style lang="scss" scoped>
.blog-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ========== Header ========== */
.blog-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #ebeef5;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #409eff, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-sub {
  font-size: 13px;
  color: #909399;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover {
    color: #409eff;
    background: rgba(64, 158, 255, 0.06);
  }
  &.active {
    color: #fff;
    background: #409eff;
  }
}

/* ========== Hero ========== */
.hero-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 60px 24px 50px;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.hero-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
}

.hero-text {
  color: #fff;
}

.hero-name {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

.hero-desc {
  margin: 0 0 14px 0;
  font-size: 15px;
  opacity: 0.8;
}

.hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  :deep(.el-tag) {
    border: none;
    font-size: 12px;
  }
}

.hero-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #fff;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  opacity: 0.7;
}

/* ========== Articles ========== */
.articles-section {
  padding: 40px 24px;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 4px;
  background: #fff;
  border-radius: 24px;
  padding: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.filter-tab {
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: #409eff;
  }
  &.active {
    background: #409eff;
    color: #fff;
    font-weight: 500;
  }
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.article-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
  }
}

.article-cover {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-icon {
  font-size: 48px;
}

.article-body {
  padding: 18px 20px 20px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.article-date {
  font-size: 12px;
  color: #c0c4cc;
}

.article-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-desc {
  margin: 0 0 14px 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-views {
  font-size: 12px;
  color: #c0c4cc;
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-link {
  font-size: 13px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.articles-more {
  text-align: center;
  margin-top: 36px;
}

/* ========== Projects ========== */
.projects-section {
  padding: 0 24px 48px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.project-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.project-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-info {
  flex: 1;
}

.project-name {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.project-desc {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.project-arrow {
  color: #c0c4cc;
}

/* ========== Footer ========== */
.blog-footer {
  background: #1a1a2e;
  padding: 32px 24px;
  text-align: center;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.footer-links {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  :deep(.el-link) {
    color: rgba(255, 255, 255, 0.6) !important;
    &:hover {
      color: #fff !important;
    }
  }
}
</style>
