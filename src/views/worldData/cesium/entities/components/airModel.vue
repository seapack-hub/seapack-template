<template>
  <div id="air-model">

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as Cesium from 'cesium';
// 设置cesium默认视角
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
  // 西边的经度
  89.5,
  // 南边维度
  20.4,
  // 东边经度
  110.4,
  // 北边维度
  61.2
)
function initCesium() {
  //viewer是所有Api的开始,
  //设置token
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTA5YzcyZC03OTdlLTRjYTMtYjJhZC1lYzQwODhlODliNTIiLCJpZCI6MjUyOTU2LCJpYXQiOjE3MzA3OTMzNjd9.NSkZaVBGMb4WwS0jz0_zTq1ivn-5MYee_gmGDChsNys'

  //绑定容器
  const viewer = new Cesium.Viewer('air-model', {
    timeline: false, //时间轴控件
    animation: false, //动画控件
    geocoder: false, //搜索按钮
    homeButton: false, //主页按钮
    sceneModePicker: false, //投影方式按钮
    baseLayerPicker: false, //图层选择按钮
    navigationHelpButton: false, //帮助手势按钮
    fullscreenButton: false, //全屏按钮
    infoBox: false, //是否显示信息窗口
    selectionIndicator: false,
    terrain: Cesium.Terrain.fromWorldTerrain(), // 地形数据
  })

  // 添加3D模型
  const airplane = viewer.entities.add({
    name: "Airplane",
    position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 1500),
    model: {
      uri: new URL("@p/model/Cesium_Air.glb",import.meta.url).href,
      // 设置飞机的最小像素
      minimumPixelSize: 128,
      // 设置飞机的轮廓
      silhouetteSize: 2,
      // 设置轮廓的颜色
      silhouetteColor: Cesium.Color.WHITE,
      // 设置相机距离模型多远的距离显示
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200000),
    },
  });
  viewer.flyTo(airplane);
}

onMounted(() => {
  initCesium()
})
</script>

<style lang="scss" scoped>
#air-model {
  width: calc(100vw - 300px);
  height: calc(100vh - 200px);
}
::v-deep(.cesium-viewer-bottom) {
  display: none;
}
</style>