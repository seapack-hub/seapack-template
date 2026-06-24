<template>
  <div class="workbench">
    <div class="workbench-header">
      <div class="header-content">
        <h1 class="header-title">欢迎使用 Sea Pack</h1>
        <p class="header-desc">请选择一个模块进入</p>
      </div>
    </div>
    <div class="module-grid">
      <div
        v-for="mod in accessibleModules"
        :key="mod.key"
        class="module-card"
        @click="enterModule(mod)"
      >
        <div class="card-icon">
          <SPIcon :name="moduleIcons[mod.key] || 'home'" size="48px"></SPIcon>
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ mod.title }}</h3>
          <p class="card-desc">{{ moduleDescs[mod.key] || '' }}</p>
        </div>
        <div class="card-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { MODULE_DEFS } from '@/config/modules'

const router = useRouter()
const userStore = useUserStore()

// 各模块对应的 SVG 图标名（对应 src/assets/icons/ 下的文件）
const moduleIcons: Record<string, string> = {
  systemManagement: 'system',
  worldData: 'gis',
  bigData: 'basic-dashboard',
  blogsManagement: 'blogs',
}

// 各模块中文描述
const moduleDescs: Record<string, string> = {
  systemManagement: '用户、部门、菜单权限、系统配置等管理功能',
  worldData: 'OpenLayers / Cesium 二三维地图展示与交互',
  bigData: '智慧大屏与通用模板数据可视化',
  blogsManagement: '博客阅读与管理',
}

// 当前用户有权限访问的模块列表（admin 全部可见）
const accessibleModules = computed(() => {
  if (userStore.username === 'admin') return MODULE_DEFS
  const perms = userStore.perms ?? []
  return MODULE_DEFS.filter(m => !m.permKey || perms.includes(m.permKey))
})

// 点击卡片跳转到该模块的默认入口
function enterModule(mod: typeof MODULE_DEFS[number]) {
  router.push({ path: mod.path })
}
</script>

<style scoped lang="scss">
.workbench {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.workbench-header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 80px 20px 40px;
}

.header-content {
  text-align: center;
}

.header-title {
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: 2px;
}

.header-desc {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 680px;
  width: 100%;
  padding: 0 20px;
}

.module-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
}

.card-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.card-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-arrow {
  flex-shrink: 0;
  color: #ccc;
  transition: color 0.2s, transform 0.2s;

  .module-card:hover & {
    color: #667eea;
    transform: translateX(4px);
  }
}
</style>
