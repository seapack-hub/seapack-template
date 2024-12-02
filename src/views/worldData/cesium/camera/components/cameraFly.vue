<template>
  <div class="camera-fly">
    <!-- -->
    <div id="cesium-camera-fly"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as Cesium from 'cesium'
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
  const viewer = new Cesium.Viewer('cesium-camera-fly', {
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
  })
  //设置相机位置
  const position = Cesium.Cartesian3.fromDegrees(110,30,20000);
  viewer.camera.flyTo({
    //目的地
    destination:position,
    //取向
    orientation:{
      // 指定相机的朝向,偏航角
      heading:Cesium.Math.toRadians(0),
      // 指定相机的俯仰角,0度是竖直向上,-90度是向下
      pitch:Cesium.Math.toRadians(-90),
      // 指定相机的滚转角,翻滚角
      roll:Cesium.Math.toRadians(0)
    },
    //飞行时限
    duration:5
  })
}

onMounted(() => {
  initCesium()
})
</script>

<style lang="scss" scoped>
.camera-fly{
  width:100%;
  height:100%;
  #cesium-camera-fly{
    width: calc(100vw - 300px);
    height: calc(100vh - 200px);
  }
}
::v-deep(.cesium-viewer-bottom) {
  display: none;
}
</style>