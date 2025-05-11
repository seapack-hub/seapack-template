<template>
  <div class="layout-logo-container">
    <transition name="layout-logo-fade">
      <el-image :src="imgUrl" :style="{ height: height + 'px' }"></el-image>
    </transition>
  </div>
</template>

<script setup lang="ts">
//引入Logo
import seaPack from '@/assets/images/logo/sea-pack.png';
import { computed } from 'vue';

//获取 props
defineProps({
  height: {
    type: Number,
    default: 60
  },
  size: {
    type: String,
    default: 'big'
  }
});

//计算属性
const imgUrl = computed(() => {
  return seaPack;
});
</script>

<style scoped lang="scss">
.layout-logo-container {
  position: relative;
  width: 100%;
  text-align: center;
  overflow: hidden;
}
</style>
