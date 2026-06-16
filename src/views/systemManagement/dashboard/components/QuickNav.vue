<template>
  <el-card class="quick-nav" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="card-title">快捷导航</span>
        <el-text type="info" size="small">点击跳转至对应模块</el-text>
      </div>
    </template>
    <div class="nav-grid">
      <div
        v-for="item in navList"
        :key="item.path"
        class="nav-item"
        @click="handleNavigate(item.path, item.external)"
      >
        <div class="nav-icon" :style="{ background: item.bgColor }">
          <SPIcon :name="item.icon" :size="26" :color="item.color" />
        </div>
        <span class="nav-label">{{ item.label }}</span>
        <span class="nav-desc">{{ item.desc }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface NavItem {
  label: string
  desc: string
  path: string
  icon: string
  color: string
  bgColor: string
  external?: boolean
}

const navList = ref<NavItem[]>([
  { label: '用户管理', desc: '系统用户', path: '/user', icon: 'user', color: '#409eff', bgColor: 'rgba(64,158,255,0.08)' },
  { label: '角色管理', desc: '权限角色', path: '/role', icon: 'role', color: '#67c23a', bgColor: 'rgba(103,194,58,0.08)' },
  { label: '菜单权限', desc: '菜单配置', path: '/menu', icon: 'menu', color: '#e6a23c', bgColor: 'rgba(230,162,60,0.08)' },
  { label: '股票行情', desc: '实时数据', path: '/stockQuote', icon: 'trend-charts', color: '#f56c6c', bgColor: 'rgba(245,108,108,0.08)' },
  { label: '股票池', desc: '监控管理', path: '/stockPool', icon: 'fund-info', color: '#909399', bgColor: 'rgba(144,147,153,0.08)' },
  { label: '告警历史', desc: '告警记录', path: '/alertHistory', icon: 'histogram', color: '#f56c6c', bgColor: 'rgba(245,108,108,0.08)' },
  { label: '基金信息', desc: '基金数据', path: '/fundBaseInfo', icon: 'fund', color: '#67c23a', bgColor: 'rgba(103,194,58,0.08)' },
  { label: 'RAG知识库', desc: 'AI智能', path: '/rag', icon: 'rag', color: '#9b59b6', bgColor: 'rgba(155,89,182,0.08)' },
  { label: '智能体', desc: 'AI交互', path: '/agent', icon: 'agent', color: '#e91e63', bgColor: 'rgba(233,30,99,0.08)' },
  { label: '流程图', desc: '可视化', path: '/flowCharts', icon: 'flow-chart', color: '#00bcd4', bgColor: 'rgba(0,188,212,0.08)' },
  { label: '地图世界', desc: 'GIS地图', path: '/worldData', icon: 'gis', color: '#3f51b5', bgColor: 'rgba(63,81,181,0.08)', external: true },
  { label: '大数据屏', desc: '数据展示', path: '/universalTemplate', icon: 'basic-dashboard', color: '#ff9800', bgColor: 'rgba(255,152,0,0.08)', external: true },
  { label: '个人博客', desc: '博客系统', path: '/blogs', icon: 'blogs', color: '#009688', bgColor: 'rgba(0,150,136,0.08)', external: true },
])

function handleNavigate(path: string, external?: boolean) {
  if (external) {
    window.open(path, '_blank')
  } else {
    router.push(path)
  }
}
</script>

<style lang="scss" scoped>
.quick-nav {
  border-radius: 12px;
  border: none;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

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

.nav-label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.nav-desc {
  font-size: 11px;
  color: #c0c4cc;
}
</style>
