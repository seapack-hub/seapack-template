<template>
  <header class="blog-header">
    <div class="header-inner">
      <div class="header-left">
        <span class="logo-text">Sea Pack</span>
        <span class="logo-sub">技术博客</span>
      </div>
      <nav class="header-nav">
        <router-link class="nav-link" :class="{ active: isActive('/menuTab') }" to="/menuTab">
          <el-icon><HomeFilled /></el-icon> 工作台
        </router-link>
        <router-link class="nav-link" :class="{ active: isBlogHome }" to="/blogsManagement/blogs">
          <el-icon><Notebook /></el-icon> 博客首页
        </router-link>
        <router-link class="nav-link" :class="{ active: isAdmin }" to="/blogsManagement/admin/articles">
          <el-icon><Setting /></el-icon> 管理
        </router-link>
        <a class="nav-link" href="https://juejin.cn/user/2071912223613783" target="_blank">
          <el-icon><Connection /></el-icon> 掘金主页
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Connection, Setting, HomeFilled, Notebook } from '@element-plus/icons-vue'

const route = useRoute()

function isActive(path: string) {
  return route.path.startsWith(path)
}

const isBlogHome = computed(() => {
  return route.path.startsWith('/blogsManagement') && !route.path.includes('/admin')
})

const isAdmin = computed(() => {
  return route.path.includes('/admin')
})
</script>

<style lang="scss" scoped>
.blog-header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}
.header-inner {
  height: 60px; padding: 0 40px;
  display: flex; justify-content: space-between; align-items: center;
}
.header-left { display: flex; align-items: baseline; gap: 8px; }
.logo-text {
  font-size: 20px; font-weight: 700;
  background: linear-gradient(135deg, #409eff, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.logo-sub { font-size: 13px; color: #909399; }
.header-nav { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nav-link {
  padding: 6px 16px; border-radius: 20px; font-size: 14px;
  color: #606266; cursor: pointer; transition: all 0.2s;
  text-decoration: none; display: flex; align-items: center; gap: 4px;
  &:hover { color: #409eff; background: rgba(64, 158, 255, 0.06); }
  &.active { color: #fff; background: #409eff; }
}
</style>
