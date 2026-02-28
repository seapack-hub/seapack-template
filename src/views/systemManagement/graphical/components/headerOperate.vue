<template>
  <div class="header-operate">
    <el-tooltip class="item" content="放大" effect="dark" placement="top">
      <el-icon :size="24" style="cursor: pointer"><ZoomIn /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="缩小" effect="dark" placement="top">
      <el-icon :size="20" style="cursor: pointer"><ZoomOut /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="撤销" effect="dark" placement="top">
      <el-icon :size="20" style="cursor: pointer"><RefreshLeft /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="重做" effect="dark" placement="top">
      <el-icon :size="20" style="cursor: pointer"><RefreshRight /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="全屏" effect="dark" placement="top">
      <el-icon :size="20" style="cursor: pointer"><FullScreen /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="下载" effect="dark" placement="top">
      <el-icon :size="20" style="cursor: pointer"><SoldOut /></el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { 
  ZoomIn, 
  ZoomOut,
  RefreshLeft,
  RefreshRight,
  FullScreen,
  SoldOut,
} from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.header-operate {
  display: flex;
  justify-content: left;
  align-items: center;
  background-color: #fff;
  border-radius: 10px 10px 0 0;
  gap: 10px;
  padding-left: 5px;
  margin:0;
  height: 35px;
  width: 100%;
}</style>