<template>
  <div class="setting-container">
    <h4>布局配置</h4>
    <SelectLayoutMode/>
    <!--分割线-->
    <el-divider />
    <h4>功能配置</h4>
  </div>
</template>

<script setup lang="ts">
import SelectLayoutMode from "@/layout/components/settings/SelectLayoutMode.vue";
import {useSettingsStore} from "@/store/modules/settings.ts";
import {storeToRefs} from "pinia";

//获取系统全局配置
const settingStore = useSettingsStore();
settingStore.$patch((state)=>{
  console.log('---state--',state)
})
/** 使用 storeToRefs 将提取的属性保持其响应性 */
const {
  showWatermark
} = storeToRefs(settingStore)
</script>

<style scoped lang="scss">
.setting-container{
  padding: 20px;
}
</style>