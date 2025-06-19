<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="4">
        <DeptTree />
      </el-col>
      <el-col :span="20">
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import DeptTree from "./components/DeptTree.vue";
</script>

<style lang="scss" scoped></style>
