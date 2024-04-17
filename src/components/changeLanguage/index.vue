<template>
  <el-dropdown @command="handleCommand" :hide-on-click="false">
    <div>
      <SPIcon name="translation" size="20px"></SPIcon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN">
          <SPIcon name="simplified" size="20px" class="svg-icon"></SPIcon>
          中文简体
        </el-dropdown-item>
        <el-dropdown-item command="zh-TW">
          <SPIcon name="complex" size="20px" class="svg-icon"></SPIcon>
          中文繁體
        </el-dropdown-item>
        <el-dropdown-item command="en">
          <SPIcon name="english" size="20px" class="svg-icon"></SPIcon>
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import i18n from "@/locales";
import {useAppStore} from "@/store/modules/app.ts";

const appStore = useAppStore();

function handleCommand(command:any){
  i18n.global.locale.value = command;
  appStore.changeLanguage(command);
}
</script>

<style scoped lang="scss">
.svg-icon{
  margin-right: 8px;
}

.el-dropdown{
  .el-tooltip__trigger:focus-visible{
    outline: unset;
  }
}
</style>