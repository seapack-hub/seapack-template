<template>
  <header class="blog-header">
    <div class="header-inner">
      <div class="header-left">
        <span class="logo-text">Sea Pack</span>
        <span class="logo-sub">技术博客</span>
      </div>
      <nav class="header-nav">
        <a class="nav-link active" @click="goHome">首页</a>
        <a class="nav-link" href="https://juejin.cn/user/2071912223613783" target="_blank">
          <el-icon><Connection /></el-icon>
          掘金主页
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Connection } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/menuTab')
}
</script>

<style lang="scss" scoped>
.blog-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.header-inner {
  height: 60px;
  padding: 0 40px;
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
  flex-shrink: 0;
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
</style>
