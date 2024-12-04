<template>
  <div id="scan-model">
    
  </div>
</template>

<script setup>
import * as Cesium from 'cesium';
import { onMounted } from 'vue';

// 根据两个点 开始角度、夹角度 求取立面的扇形
function computeCirclularFlight(x1, y1, x2, y2, fx, angle) {
  let positionArr = [];
  positionArr.push(x1);
  positionArr.push(y1);
  positionArr.push(0);

  let radius = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(x1, y1), Cesium.Cartesian3.fromDegrees(x2, y2));

  for (let i = fx; i <= fx + angle; i++) {
    let h = radius * Math.sin(i * Math.PI / 180.0);
    let r = Math.cos(i * Math.PI / 180.0);
    let x = (x2 - x1) * r + x1;
    let y = (y2 - y1) * r + y1;
    positionArr.push(x);
    positionArr.push(y);
    positionArr.push(h);
  }

  return positionArr;
}

// 根据第一个点 偏移距离 角度 求取第二个点的坐标
/**
 * x1:经度
 * y1:纬度
 * radius：半径
 * heading：高度
 **/
function calcPoints(x1, y1, radius, heading){
  //
  let m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1));

  let rx = radius * Math.cos(heading * Math.PI / 180.0);
  let ry = radius * Math.sin(heading * Math.PI / 180.0);

  let translation = Cesium.Cartesian3.fromElements(rx, ry, 0);

  let d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3());

  let c = Cesium.Cartographic.fromCartesian(d);

  let x2 = Cesium.Math.toDegrees(c.longitude);
  let y2 = Cesium.Math.toDegrees(c.latitude);
  return computeCirclularFlight(x1, y1, x2, y2, 0, 90);
}

function initCesium() {
  //viewer是所有Api的开始,
  //设置token
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTA5YzcyZC03OTdlLTRjYTMtYjJhZC1lYzQwODhlODliNTIiLCJpZCI6MjUyOTU2LCJpYXQiOjE3MzA3OTMzNjd9.NSkZaVBGMb4WwS0jz0_zTq1ivn-5MYee_gmGDChsNys'

  //绑定容器
  const viewer = new Cesium.Viewer('scan-model', {
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
  viewer.scene.globe.depthTestAgainstTerrain = true;
  let tdtImageryProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'http://{s}.tianditu.com/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=d845a99528ce08b31543c602207e873f',
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    maximumLevel: 18,
    minimumLevel: 1,
    credit: 'Tianditu'
  });
  viewer.imageryLayers.addImageryProvider(tdtImageryProvider);
  let heading = 0;

  let positionArr = calcPoints(114, 30, 100, heading);
  //添加围墙
  viewer.entities.add({
    wall: {
      //一个属性，它指定定义墙顶的 Cartesian3 位置的数组。
      positions: new Cesium.CallbackProperty(() => { return Cesium.Cartesian3.fromDegreesArrayHeights(positionArr) }, false),
      material: Cesium.Color.AQUAMARINE.withAlpha(0.5)
    }
  });
  //添加椭圆
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(114, 30),
    //椭圆
    ellipsoid: {
      //一个 Cartesian3 属性，该属性指定椭球的半径。
      radii: new Cesium.Cartesian3(100, 100, 100),
      //指定椭圆体的最大时钟角。
      maximumCone: Cesium.Math.toRadians(90),
      material: Cesium.Color.AQUAMARINE.withAlpha(0.3),
      //一个布尔属性，指定是否勾勒出椭球。
      outline: true,
      //一个属性，指定轮廓的 颜色 
      outlineColor: Cesium.Color.AQUAMARINE.withAlpha(0.5),
      //一个数字属性，指定轮廓的宽度。
      outlineWidth: 1
    }
  });
  viewer.zoomTo(viewer.entities);
  // 执行动画效果
  viewer.clock.onTick.addEventListener(() => {
    heading += 0.5;
    positionArr = calcPoints(114, 30, 100, heading);
  });
}

onMounted(() => {
  initCesium()
})
</script>

<style lang="scss" scoped>
#scan-model{
  width: calc(100vw - 300px);
  height: calc(100vh - 200px);
}
::v-deep(.cesium-viewer-bottom) {
  display: none;
}
</style>