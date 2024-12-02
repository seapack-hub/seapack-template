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

  // let material = new Cesium.ColorMaterialProperty(
  //   new Cesium.Color(1.0, 1.0, 1.0, 1.0)
  // );
  // 棋盘纹理
  // let material = new Cesium.CheckerboardMaterialProperty({
  //   evenColor: Cesium.Color.GRAY,
  //   oddColor: Cesium.Color.YELLOW,
  //   repeat: new Cesium.Cartesian2(8, 8),
  // });
  //条纹纹理
  // let material = new Cesium.StripeMaterialProperty({
  //   evenColor: Cesium.Color.WHITE,
  //   oddColor: Cesium.Color.BLACK,
  //   repeat: 8,
  // });
  // 网格纹理
  // let material = new Cesium.GridMaterialProperty({
  //   color: Cesium.Color.YELLOW,
  //   cellAlpha: 0.1,
  //   lineCount: new Cesium.Cartesian2(4, 4),
  //   lineThickness: new Cesium.Cartesian2(2.0, 2.0),
  // });
  let material = new Cesium.Material({
    fabric: {
      type: 'Color',
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
      },
    },
  })
  //创建一个实体
  // const rectangle = new Cesium.Entity({
  //   id:"rectangleId002",
  //   rectangle: {
  //      coordinates: Cesium.Rectangle.fromDegrees(90,20,110,30),
  //    },
  // });

  // rectangle.material = material
  // viewer.entities.add(rectangle)

  //创建一个多边形几何体
  let polygon = new Cesium.PolygonGeometry({
    polygonHierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        -72.0, 40.0, -70.0, 35.0, -75.0, 30.0, -70.0, 30.0, -68.0, 40.0,
      ])
    ),
    height: 1000,
  })

  //创建实体entity
  let entity = new Cesium.Entity({
    polygon: polygon,
    // material:material
  })

  //添加实体
  viewer.entities.add(entity)
  // viewer.camera.zoomIn(polygon)

  // 使用entity创建矩形
  // let rectangle = viewer.entities.add({
  //   id:"rectangleId001",
  //    rectangle: {
  //      coordinates: Cesium.Rectangle.fromDegrees(90,20,110,30),
  //      material: material,
  //    },
  //   });
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
