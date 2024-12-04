<template>
  <div id="base-cesium"></div>
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
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0
function initCesium() {
  //viewer是所有Api的开始,
  //设置token
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTA5YzcyZC03OTdlLTRjYTMtYjJhZC1lYzQwODhlODliNTIiLCJpZCI6MjUyOTU2LCJpYXQiOjE3MzA3OTMzNjd9.NSkZaVBGMb4WwS0jz0_zTq1ivn-5MYee_gmGDChsNys'

  //绑定容器
  const viewer = new Cesium.Viewer('base-cesium', {
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

  //1.创建几何体
  let rectGeometry = new Cesium.RectangleGeometry({
    rectangle:Cesium.Rectangle.fromDegrees(115,20,135,30),
    height:0,
    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
  });

  //2.创建几何实例
  let instance = new Cesium.GeometryInstance({
    id:"rect001",
    geometry:rectGeometry,
    attributes:{
      color:Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED.withAlpha(0.5))
    }
  });

  //设置材质
  //颜色
  // let materail = new Cesium.Material.fromType("Color",{
  //   color: Cesium.Color.AQUA.withAlpha(0.5),
  // })
  //图片
  // let material = new Cesium.Material.fromType("Image",{
  //   image:new URL("@/views/worldData/cesium/images/cattle.png",import.meta.url).href,
  //   repeat:new Cesium.Cartesian2(2.0,1.0)
  // })
  // let material = new Cesium.Material.fromType("DiffuseMap",{
  //   image:new URL("@/views/worldData/cesium/images/cattle.png",import.meta.url).href,
  // })
  // let material = new Cesium.Material.fromType("Grid", {
  //   color: Cesium.Color.AQUA.withAlpha(0.5),
  //   cellAlpha: 0.2,
  //   lineCount: new Cesium.Cartesian2(4, 4),
  //   lineThickness: new Cesium.Cartesian2(2.0, 2.0),
  // });
  let material = new Cesium.Material.fromType("Water", {
    baseWaterColor: Cesium.Color.AQUA.withAlpha(0.5),
    distortion: 0.25,
    normalMap: new URL("@/views/worldData/cesium/images/waterNormals.jpg",import.meta.url).href
  });
  //3设置外观
  // let appearance = new Cesium.MaterialAppearance({
  //   material:materail
  // });
  let appearance = new Cesium.EllipsoidSurfaceAppearance({
    material: material,
    aboveGround: false,
    translucent: true,
  })
  //4 图元
  let primitive = new Cesium.Primitive({
    geometryInstances:instance,
    appearance:appearance
  });

  //5 将图元添加到viewer
  viewer.scene.primitives.add(primitive);
}

onMounted(() => {
  initCesium()
})
</script>

<style lang="scss" scoped>
#base-cesium {
  width: calc(100vw - 300px);
  height: calc(100vh - 200px);
}
::v-deep(.cesium-viewer-bottom) {
  display: none;
}
* {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
}
</style>
