<!--
  BlogLayout —— 博客模块统一布局壳子

  职责：
    1. 所有博客页面共享 BlogHeader 导航
    2. 管理后台子路由自动显示左侧管理导航
    3. 博客前台/详情页全宽渲染
-->
<template>
  <el-container class="blog-layout">
    <!-- 统一顶部导航 -->
    <el-header height="auto" class="blog-header-wrapper">
      <BlogHeader />
    </el-header>

    <!-- 主体区域 -->
    <el-container class="blog-body">
      <!-- 管理后台侧边导航 -->
      <el-aside v-if="isAdminRoute" width="200px" class="admin-sidebar">
        <nav class="sidebar-nav">
          <router-link
            v-for="item in adminNavItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="sidebar-link"
            :class="{ active: isActive(item.name) }"
          >
            <SPIcon :name="item.icon" size="18px" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </el-aside>

      <!-- 内容区 -->
      <el-main class="blog-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BlogHeader from '@/views/blogs/components/BlogHeader.vue'
import { useUserStore } from '@/store/modules/user'
import { filterVisibleRoutes } from '@/utils/routeUtils'
import { getRawModuleRoutes } from '@/router/index'

const route = useRoute()
const userStore = useUserStore()

/** 当前是否为管理后台路由 */
const isAdminRoute = computed(() => route.path.includes('/admin'))

/** 管理后台侧边导航项（从路由动态读取，经权限过滤） */
const adminNavItems = computed(() => {
  const blogsMgmtRoute = getRawModuleRoutes().find(r => r.name === 'blogsManagement')
  const adminRoute = blogsMgmtRoute?.children?.find(r => r.name === 'blogsAdmin')
  if (!adminRoute?.children) return []
  const visibleRoutes = filterVisibleRoutes(
    adminRoute.children,
    userStore.menuPermKeys,
    userStore.username === 'admin',
  )
  return visibleRoutes.map(r => ({
    name: r.name as string,
    label: (r.meta?.description as string) || '',
    icon: (r.meta?.icon as string) || '',
  }))
})

/** 判断当前激活的导航项 */
function isActive(name: string) {
  return route.name === name
}
</script>

<style lang="scss" scoped>
.blog-layout {
  width: 100vw;
  height: 100vh;
  background: #f5f7fa;
}

.blog-header-wrapper {
  padding: 0;
  overflow: visible;
}

.blog-body {
  overflow: hidden;
}

// ===== 管理后台侧边栏 =====
.admin-sidebar {
  background: #fff;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  gap: 4px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #606266;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(64, 158, 255, 0.06);
    color: #409eff;
  }

  &.active {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.12), rgba(118, 75, 162, 0.08));
    color: #409eff;
    font-weight: 600;
  }
}

// ===== 内容区 =====
.blog-content {
  padding: 0;
}
</style>
