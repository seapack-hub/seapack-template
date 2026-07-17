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
        <div class="card-accent"></div>
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

const router = useRouter()
const userStore = useUserStore()

const accessibleModules = computed(() => {
  if (userStore.username === 'admin') return MODULE_DEFS
  return MODULE_DEFS.filter(m => !m.permKey || userStore.menuPermKeys.includes(m.permKey))
})

const TAB_MODULES = ['bigScreen', 'universalTemplate']

function enterModule(mod: typeof MODULE_DEFS[number]) {
  if (TAB_MODULES.includes(mod.key)) {
    window.open(mod.path, '_blank')
  } else {
    router.push({ path: mod.path })
  }
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
  background: linear-gradient(135deg, #1a1a3e 0%, #2d1b69 40%, #667eea 100%);
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
  filter: blur(80px);
  opacity: 0.3;
  animation: orbFloat 8s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  background: #7c3aed;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  bottom: -150px;
  left: -150px;
  background: #3b82f6;
  animation-delay: -3s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 60%;
  background: #ec4899;
  animation-delay: -6s;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(40px, 30px) scale(1.05); }
}

/* ── 头部 ── */
.workbench-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 60px 20px 32px;
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
  padding: 4px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.header-title {
  font-size: 38px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
  letter-spacing: 2px;
}

.header-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
}

/* ── 模块网格 ── */
.module-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 720px;
  width: 100%;
  padding: 0 20px 60px;
}

/* ── 卡片 ── */
.module-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  overflow: hidden;
  animation: cardIn 0.5s ease both;
  animation-delay: var(--delay);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--accent) inset;

    .card-arrow {
      color: var(--accent);
      transform: translateX(4px);
      opacity: 1;
    }
  }
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--accent);
  border-radius: 4px 0 0 4px;
  opacity: 0;
  transition: opacity 0.3s ease;

  .module-card:hover & {
    opacity: 1;
  }
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
  transition: transform 0.3s ease;

  .module-card:hover & {
    transform: scale(1.1) rotate(-4deg);
  }
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 17px;
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
  opacity: 0;
  transition: color 0.25s, transform 0.25s, opacity 0.25s;
}

@media (max-width: 600px) {
  .module-grid {
    grid-template-columns: 1fr;
  }

  .workbench-header {
    padding: 40px 16px 24px;
  }

  .header-title {
    font-size: 28px;
  }
}
</style>
