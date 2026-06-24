<!-- ============================================================
  QuickNav 快捷导航组件
  以网格布局展示系统各功能模块的快捷入口图标，
  点击后跳转至对应路由（内部路由用 router.push，外部链接用 window.open）。
  ============================================================ -->
<template>
  <el-card class="quick-nav" shadow="hover">
    <!-- 卡片标题栏 -->
    <template #header>
      <div class="card-header">
        <span class="card-title">快捷导航</span>
        <el-text type="info">点击跳转至对应模块</el-text>
      </div>
    </template>
    <!-- 导航网格 -->
    <div class="nav-grid">
      <div
        v-for="item in navList"
        :key="item.path"
        class="nav-item"
        @click="handleNavigate(item.path, item.external)"
      >
        <!-- 图标容器：带彩色背景 -->
        <div class="nav-icon" :style="{ background: item.bgColor }">
          <SPIcon :name="item.icon" :size="26" :color="item.color" />
        </div>
        <!-- 模块名称 -->
        <span class="nav-label">{{ item.label }}</span>
        <!-- 模块描述 -->
        <span class="nav-desc">{{ item.desc }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

/** Vue Router 实例，供内部路由跳转 */
const router = useRouter()

/**
 * 导航项数据结构
 * @property label - 显示名称
 * @property desc - 简短描述
 * @property path - 路由路径或外部 URL
 * @property icon - SPIcon 图标名称
 * @property color - 图标主题色
 * @property bgColor - 图标背景色
 * @property external - 是否为外部链接（true 时用 window.open）
 */
interface NavItem {
  label: string
  desc: string
  path: string
  icon: string
  color: string
  bgColor: string
  external?: boolean
}

/** 导航数据集：涵盖用户管理、权限、股票、基金、AI、博客等模块 */
const navList = ref<NavItem[]>([
  { label: '用户管理', desc: '系统用户', path: 'user', icon: 'user', color: '#409eff', bgColor: 'rgba(64,158,255,0.08)' },
  { label: '角色管理', desc: '权限角色', path: 'role', icon: 'role', color: '#67c23a', bgColor: 'rgba(103,194,58,0.08)' },
  { label: '菜单权限', desc: '菜单配置', path: 'menu', icon: 'menu', color: '#e6a23c', bgColor: 'rgba(230,162,60,0.08)' },
  { label: '股票行情', desc: '实时数据', path: 'stockQuote', icon: 'trend-charts', color: '#f56c6c', bgColor: 'rgba(245,108,108,0.08)' },
  { label: '股票池', desc: '监控管理', path: 'stockPool', icon: 'fund-info', color: '#909399', bgColor: 'rgba(144,147,153,0.08)' },
  { label: '告警历史', desc: '告警记录', path: 'alertHistory', icon: 'histogram', color: '#f56c6c', bgColor: 'rgba(245,108,108,0.08)' },
  { label: '基金信息', desc: '基金数据', path: 'fundBaseInfo', icon: 'fund', color: '#67c23a', bgColor: 'rgba(103,194,58,0.08)' },
  { label: 'RAG知识库', desc: 'AI智能', path: 'rag', icon: 'rag', color: '#9b59b6', bgColor: 'rgba(155,89,182,0.08)' },
  { label: '智能体', desc: 'AI交互', path: 'agent', icon: 'agent', color: '#e91e63', bgColor: 'rgba(233,30,99,0.08)' },
  { label: '流程图', desc: '可视化', path: 'flowCharts', icon: 'flow-chart', color: '#00bcd4', bgColor: 'rgba(0,188,212,0.08)' },
  { label: '地图世界', desc: 'GIS地图', path: '/worldData', icon: 'gis', color: '#3f51b5', bgColor: 'rgba(63,81,181,0.08)', external: true },
  { label: '大数据屏', desc: '数据展示', path: '/universalTemplate', icon: 'basic-dashboard', color: '#ff9800', bgColor: 'rgba(255,152,0,0.08)', external: true },
  { label: '个人博客', desc: '博客系统', path: '/blogsManagement/blogs', icon: 'blogs', color: '#009688', bgColor: 'rgba(0,150,136,0.08)', external: true },
])

/**
 * 导航点击处理
 * @param path - 目标路径
 * @param external - 是否为外部链接
 */
function handleNavigate(path: string, external?: boolean) {
  if (external) {
    // 外部链接：新窗口打开
    window.open(path, '_blank')
  } else {
    // 内部路由：使用命名路由跳转
    router.push({ name: path })
  }
}
</script>

<style lang="scss" scoped>
/** 快捷导航卡片 */
.quick-nav {
  border-radius: 12px;
  border: none;
  margin-bottom: 16px;
}

/** 卡片头部：标题居左，提示居右 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/** 卡片标题文字 */
.card-title {
  font-size: 16px;
  font-weight: 600;
}

/**
 * 导航网格：自动填充，每项最小宽度 100px
 */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

/**
 * 单个导航项：纵向排列图标+文字，hover 上移
 */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #f5f7fa;
    transform: translateY(-2px);
  }
}

/** 图标圆角容器，hover 时放大 */
.nav-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  .nav-item:hover & {
    transform: scale(1.08);
  }
}

/** 导航标签 */
.nav-label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

/** 导航描述 */
.nav-desc {
  font-size: 11px;
  color: #c0c4cc;
}
</style>
