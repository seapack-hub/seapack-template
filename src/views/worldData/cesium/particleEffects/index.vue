<template>
  <div class="particleEffects">
    <!--设置地图-->
    <div id="cesiumContainer"></div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, markRaw } from 'vue';
import InitView from '@/views/worldData/cesium/utils/map3d/initView.ts';
import { useCesiumStore } from '@/store/modules/cesium';

const cesiumStore = useCesiumStore();
const init = () => {
  const { viewer } = new InitView('cesiumContainer');
  // 显示帧率
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  //将 viewer 标记为非响应式
  const rawViewer = markRaw(viewer);
  //将 rawViewer 存入store
  cesiumStore.setCesiumViewer(rawViewer);
};
onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.particleEffects {
  position: relative;
  width: 100%;
  height: 100%;
  #cesiumContainer {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
::v-deep(.cesium-viewer-bottom) {
  display: none;
}
</style>
