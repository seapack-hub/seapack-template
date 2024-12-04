<template>
  <div class="particleEffects">
    <!--设置地图-->
    <div id="cesiumContainer"></div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted,markRaw} from "vue";
import InitView from "@ces/utils/map3d/initView.js";
import {useCesiumStore} from "@/store/modules/cesium";

const cesiumStore = useCesiumStore();
const init = ()=>{
  const {viewer} = new InitView("cesiumContainer");
  // 显示帧率
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  // 外天空盒
  // viewer.scene.skyBox = new Cesium.SkyBox({
  //   sources: {
  //     positiveX: "/images/Standard-Cube-Map/px1.png",
  //     negativeX: "/images/Standard-Cube-Map/nx1.png",
  //     positiveY: "/images/Standard-Cube-Map/pz.png",
  //     negativeY: "/images/Standard-Cube-Map/nz1.png",
  //     positiveZ: "/images/Standard-Cube-Map/py.png",
  //     negativeZ: "/images/Standard-Cube-Map/ny1.png",
  //   },
  // });
  //将 viewer 标记为非响应式
  const rawViewer = markRaw(viewer);
  //将 rawViewer 存入store
  cesiumStore.setCesiumViewer(rawViewer);
}
onMounted(() => {
  console.log('--三级路由--')
  init();
});

</script>

<style lang="scss" scoped>
.particleEffects{
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