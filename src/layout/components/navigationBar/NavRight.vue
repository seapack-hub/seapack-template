<template>
  <div class="nav-right">
    <div class="nav-actions">
      <!-- 模块切换下拉 -->
      <el-dropdown trigger="click" @command="switchModule">
        <div class="module-switcher">
          <el-icon class="module-icon"><Grid /></el-icon>
          <span class="module-label">{{ currentModuleTitle }}</span>
          <el-icon class="module-arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="mod in accessibleModules"
              :key="mod.key"
              :command="mod.path"
              :disabled="mod.key === activeModule"
            >
              <el-icon><component :is="mod.icon" /></el-icon>
              {{ mod.title }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="action-divider"></div>

      <!-- 工具按钮 -->
      <el-tooltip content="主屏幕" placement="bottom" :show-after="300">
        <div class="icon-btn" @click="jumpToLink('/menuTab')">
          <SPIcon name="to-home" size="18px" />
        </div>
      </el-tooltip>

      <el-tooltip content="消息通知" placement="bottom" :show-after="300">
        <div class="icon-btn">
          <SPIcon name="message-notify" size="18px" />
        </div>
      </el-tooltip>

      <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom" :show-after="300">
        <div class="icon-btn" @click="toggle">
          <SPIcon :name="isFullscreen ? 'fullscreen-shrink' : 'fullscreen-expand'" size="18px" />
        </div>
      </el-tooltip>

      <changeLanguage></changeLanguage>

      <div class="action-divider"></div>

      <!-- 用户 -->
      <loginUser></loginUser>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFullscreen } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { MODULE_DEFS } from '@/config/modules';
import { Grid, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const { isFullscreen, toggle } = useFullscreen();

const accessibleModules = computed(() => {
  if (userStore.username === 'admin') return MODULE_DEFS
  return MODULE_DEFS.filter(m => !m.permKey || userStore.menuPermKeys.includes(m.permKey))
})

const activeModule = computed(() => {
  const path = router.currentRoute.value.path
  const seg = path.split('/')[1]
  const found = MODULE_DEFS.find(m => m.key === seg || m.path.startsWith('/' + seg))
  return found?.key ?? ''
})

const currentModuleTitle = computed(() => {
  const found = MODULE_DEFS.find(m => m.key === activeModule.value)
  return found?.title ?? '切换模块'
})

function switchModule(path: string) {
  router.push(path)
}

function jumpToLink(path: string) {
  router.push(path)
}
</script>

<style scoped lang="scss">
.nav-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
}

/* ── 模块切换器 ── */
.module-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 13px;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.module-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.module-label {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.module-arrow {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.2s;

  .module-switcher:hover & {
    transform: rotate(180deg);
  }
}

/* ── 分割线 ── */
.action-divider {
  width: 1px;
  height: 20px;
  background: var(--el-border-color-light);
  margin: 0 4px;
}

/* ── 图标按钮 ── */
.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  color: var(--el-text-color-secondary);

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    color: var(--el-text-color-primary);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
