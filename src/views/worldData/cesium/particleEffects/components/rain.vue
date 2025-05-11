<template>
  <div class="rain">
    <div class="container">
      <el-button type="primary" @click="start">开始</el-button>
      <el-button type="primary" @click="hide">停止</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onUnmounted } from 'vue';
import RainEffect from '../../utils/rain';
import { useCesiumStore } from '@/store/modules/cesium';

const cesiumStore = useCesiumStore();

const rain = new RainEffect(cesiumStore.$state.cesiumViewer, {
  tiltAngle: -0.2, //倾斜角度
  rainSize: 1.0, // 雨大小
  rainSpeed: 120.0 // 雨速
});

const hide = () => {
  rain.show(false);
};
const start = () => {
  rain.show(true);
};
onUnmounted(() => {
  rain.destroy();
});
</script>

<style lang="scss" scoped>
.rain {
  padding: 20px;
  position: absolute;
  z-index: 100;
}
</style>
