<template>
  <div class="nav-right">
    <div class="setting-navigation">
      <!-- 模块切换下拉 -->
      <el-dropdown trigger="click" @command="switchModule">
        <el-button text bg size="small" class="module-switcher-btn">
          <el-icon style="margin-right:4px"><Grid /></el-icon>
          {{ currentModuleTitle }}
          <el-icon style="margin-left:4px"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-item
            v-for="mod in accessibleModules"
            :key="mod.key"
            :command="mod.path"
            :disabled="mod.key === activeModule"
          >
            <el-icon style="margin-right:6px"><component :is="mod.icon" /></el-icon>
            {{ mod.title }}
          </el-dropdown-item>
        </template>
      </el-dropdown>

      <!-- 返回主屏幕 -->
      <el-tooltip class="item" content="主屏幕" effect="light" placement="top">
        <SPIcon class="setting-item" name="to-home" size="20px" @click="jumpToLink('/menuTab')"></SPIcon>
      </el-tooltip>
      <!-- 消息通知 -->
      <el-tooltip class="item" content="消息通知" effect="light" placement="top">
        <SPIcon class="setting-item" name="message-notify" size="20px"></SPIcon>
      </el-tooltip>
      <!-- 全屏设置 -->
      <el-tooltip class="item" content="全屏设置" effect="light" placement="top">
        <SPIcon :name="isFullscreen ? 'fullscreen-shrink' : 'fullscreen-expand'" size="20px" @click="toggle"></SPIcon>
      </el-tooltip>
      <!-- 语言设置 -->
      <changeLanguage></changeLanguage>
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

// admin 全部可见，非 admin 根据菜单树 permKey 过滤
const accessibleModules = computed(() => {
  if (userStore.username === 'admin') return MODULE_DEFS
  return MODULE_DEFS.filter(m => !m.permKey || userStore.menuPermKeys.includes(m.permKey))
})

const activeModule = computed(() => {
  const path = router.currentRoute.value.path
  // 取路径第一段做模块匹配
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
  flex-direction: row;
  align-items: center;
  .setting-navigation {
    display: flex;
    gap: 10px;
    align-items: center;
    .setting-item {
      margin-bottom: 5px;
    }
  }
}
.module-switcher-btn {
  font-size: 13px;
}
</style>
