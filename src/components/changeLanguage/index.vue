<template>
  <el-dropdown
    :hide-on-click="false"
    @command="handleCommand"
  >
    <div>
      <Icon
        name="translation"
        :size="20"
      />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN">
          <Icon
            name="simplified"
            :size="20"
            class="svg-icon"
          />
          中文简体
        </el-dropdown-item>
        <el-dropdown-item command="zh-TW">
          <Icon
            name="complex"
            :size="20"
            class="svg-icon"
          />
          中文繁體
        </el-dropdown-item>
        <el-dropdown-item command="en">
          <Icon
            name="english"
            :size="20"
            class="svg-icon"
          />
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import i18n from '@/locales';
import { useAppStore } from '@/store/modules/app.ts';

//引入状态管理器
const appStore = useAppStore();

function handleCommand(command: any) {
  i18n.global.locale.value = command;
  appStore.changeLanguage(command);
}
</script>

<style scoped lang="scss">
.el-dropdown {
  .el-tooltip__trigger:focus-visible {
    outline: unset;
  }
}
</style>
