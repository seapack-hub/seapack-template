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
</script>

<style scoped lang="scss">
.setting-container{
  padding: 20px;
}
</style>