<template>
  <div class="setting-container">
    <h4>布局配置</h4>
    <SelectLayoutMode />
    <!--分割线-->
    <el-divider />
    <h4>功能配置</h4>
    <div class="setting-item">
      <div class="el-switch-group">
        <el-switch
          v-for="item in switchOptions"
          :key="item.key"
          v-model="item.value.value"
          :active-text="item.label"
          size="large"
        />
      </div>
      <el-button type="danger" :icon="Refresh">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import SelectLayoutMode from '@/layout/components/settings/SelectLayoutMode.vue';
import { useSettingsStore } from '@/store/modules/settings.ts';
import { storeToRefs } from 'pinia';
import { Refresh } from '@element-plus/icons-vue';

//获取系统全局配置
const settingStore = useSettingsStore();

/** 使用 storeToRefs 将提取的属性保持其响应性 */
const { showWatermark } = storeToRefs(settingStore);

// 定义 switch 设置项
const switchOptions = [
  {
    label: '开启水印',
    key: 'showWatermark',
    value: showWatermark
  }
];
</script>

<style scoped lang="scss">
.setting-container {
  padding: 20px;
  .setting-item {
    .el-switch-group {
      margin-bottom: 20px;
    }
  }
}
</style>
