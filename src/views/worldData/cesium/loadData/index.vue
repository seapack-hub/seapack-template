<template>
  <div class="load-data">
    <!--设置地图-->
    <div id="cesium-load-data-container"></div>
    <router-view />
  </div>
</template>

<script setup>
import {onMounted,ref,markRaw} from "vue"
import InitView from "@/views/worldData/cesium/utils/map3d/initView.ts";
import {useCesiumStore} from "@/store/modules/cesium";

const cesiumStore = useCesiumStore();
const init = ()=>{
  const {viewer} = new InitView("cesium-load-data-container");
  // 显示帧率
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  //将 viewer 标记为非响应式
  const rawViewer = markRaw(viewer);
  //将 rawViewer 存入数据加载地图
  cesiumStore.setLoadDataViewer(rawViewer);
}
onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.load-data{
  position: relative;
  width: 100%;
  height: 100%;
  #cesium-load-data-container{
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
.app{
  display: flex;
  justify-content: center;
}
</style>