<template>
  <div id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import * as Cesium from 'cesium';

function initCesium(){
  //viewer是所有Api的开始,
  //绑定容器
  new Cesium.Viewer('cesiumContainer', {});
}

onMounted(() => {
  initCesium();
});

</script>

<style scoped lang="scss">
#cesiumContainer{
  width: 1400px;
  height: 1200px;
}
</style>