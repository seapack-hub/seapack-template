<template>
  <div class="workbench">
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="workbench-header">
      <div class="header-content">
        <span class="header-badge">工作台</span>
        <h1 class="header-title">欢迎使用 Sea Pack</h1>
        <p class="header-desc">请选择一个模块进入</p>
      </div>
    </div>

    <div class="module-grid">
      <div
        v-for="(mod, idx) in accessibleModules"
        :key="mod.key"
        class="module-card"
        :style="{
          '--accent': mod.color,
          '--delay': `${idx * 0.12}s`,
          '--icon-bg': mod.color,
        }"
        @click="enterModule(mod)"
      >
        <div class="card-icon">
          <Icon :name="mod.icon" :size="28" color="#ffffff" />
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ mod.title }}</h3>
          <p class="card-desc">{{ mod.description }}</p>
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
import { useRoutePermission } from '@/hooks/useRoutePermission'

const router = useRouter()
const userStore = useUserStore()
const { navigateWithPermission, hasRoutePermission } = useRoutePermission()

const accessibleModules = computed(() => {
  return MODULE_DEFS.filter(m => !m.permKey || userStore.menuPermKeys.includes(m.permKey))
})

const TAB_MODULES = ['bigScreen', 'universalTemplate']

function enterModule(mod: typeof MODULE_DEFS[number]) {
  if (TAB_MODULES.includes(mod.key)) {
    window.open(mod.path, '_blank')
    return
  }

  // 有 entryRoutes 配置时，从列表中找第一个用户有权限的路由跳转
  if (mod.entryRoutes?.length) {
    const target = mod.entryRoutes.find(name => hasRoutePermission(name))
    if (target) {
      navigateWithPermission(target)
      return
    }
    // entryRoutes 里全没权限，跳 403
    router.push('/errorPage/403')
    return
  }

  // 无 entryRoutes 的模块（如大屏），保持原有逻辑
  router.push({ path: mod.path })
}
</script>

<style scoped lang="scss">
.workbench {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

/* ── 浮动装饰球 ── */
.bg-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.25;
  animation: orbFloat 12s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -100px;
  background: #7c3aed;
  animation-delay: 0s;
}

.orb-2 {
  width: 600px;
  height: 600px;
  bottom: -200px;
  left: -200px;
  background: #3b82f6;
  animation-delay: -4s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  top: 40%;
  left: 55%;
  background: #ec4899;
  animation-delay: -8s;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-40px, 30px) scale(0.9); }
}

/* ── 头部 ── */
.workbench-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 56px 20px 40px;
}

.header-content {
  text-align: center;
  animation: fadeDown 0.6s ease both;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-badge {
  display: inline-block;
  padding: 5px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
  margin-bottom: 20px;
}

.header-title {
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
  letter-spacing: 1px;
}

/* ── 模块网格 ── */
.module-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1400px;
  width: 100%;
  padding: 0 40px 60px;
}

/* ── 卡片 ── */
.module-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px 20px;
  cursor: pointer;
  overflow: hidden;
  animation: cardIn 0.5s ease both;
  animation-delay: var(--delay);
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;

    .card-icon {
      transform: scale(1.08);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }

    .card-arrow {
      opacity: 1;
      transform: translateX(4px);
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: var(--icon-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px;
  letter-spacing: 0.5px;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.3s;

  .module-card:hover & {
    color: rgba(255, 255, 255, 0.7);
  }
}

.card-arrow {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.25);
  opacity: 0;
  transition: all 0.3s ease;
}

/* ── 响应式 ── */
@media (max-width: 1200px) {
  .module-grid {
    grid-template-columns: repeat(3, 1fr);
    padding: 0 32px 60px;
  }
}

@media (max-width: 900px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 24px 40px;
  }
}

@media (max-width: 600px) {
  .module-grid {
    grid-template-columns: 1fr;
    padding: 0 16px 32px;
  }

  .workbench-header {
    padding: 40px 16px 24px;
  }

  .header-title {
    font-size: 28px;
  }

  .module-card {
    padding: 20px 16px;
  }
}
</style>
