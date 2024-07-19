<template>
  <div class="scroll-container">
    <el-icon class="arrow left">
      <ArrowLeft/>
    </el-icon>
    <el-scrollbar ref="scrollbarRef">
      <div>
        <slot></slot>
      </div>
    </el-scrollbar>
    <el-icon class="arrow right">
      <ArrowRight/>
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { ElScrollbar } from "element-plus";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
</script>

<style scoped lang="scss">
.scroll-container{
  height: 100%;
  user-select: none;
  display: flex;
  justify-content: space-between;
  .arrow{
    width: 40px;
    height: 100%;
    font-size: 18px;
    &.left{
      box-shadow: 5px 0 5px -6px var(--el-border-color-darker);
    }
    &.right {
      box-shadow: -5px 0 5px -6px var(--el-border-color-darker);
    }
  }
}
</style>