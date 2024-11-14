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
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
function initCesium() {
  //viewer是所有Api的开始,
  //设置token
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTA5YzcyZC03OTdlLTRjYTMtYjJhZC1lYzQwODhlODliNTIiLCJpZCI6MjUyOTU2LCJpYXQiOjE3MzA3OTMzNjd9.NSkZaVBGMb4WwS0jz0_zTq1ivn-5MYee_gmGDChsNys'

  //绑定容器
  const viewer = new Cesium.Viewer('base-cesium', {
    //imageryProvider:esri, //影像图层
    //设置地形图层 terrain
    // terrain: Cesium.Terrain.fromWorldTerrain({
    //   requestWaterMask:true, // 水面特效
    // }), // 地形数据
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
    // imageryProvider: new Cesium.OpenStreetMapImageryProvider({
    //   url: 'https://a.tile.openstreetmap.org/'
    // })
    // terrainProvider: new Cesium.CesiumTerrainProvider({
    //   url: "./terrains/gz",
    // }),
  })

  var tdtImageryProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'http://{s}.tianditu.com/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=d845a99528ce08b31543c602207e873f',
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    maximumLevel: 18,
    minimumLevel: 1,
    credit: 'Tianditu',
  })

  let webMap = new Cesium.WebMapTileServiceImageryProvider({
    url:
      'http://{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0' +
      '&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
      '&style=default&format=tiles&tk=d845a99528ce08b31543c602207e873f',
    layer: 'tdtCva',
    style: 'default',
    format: 'tiles',
    tileMatrixSetID: 'c',
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    tilingScheme: new Cesium.GeographicTilingScheme(),
    tileMatrixLabels: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
    ],
    maximumLevel: 18,
  })
  let vectorMap = new Cesium.WebMapTileServiceImageryProvider({
    url:
      'http://{s}.tianditu.gov.cn/vec_c/wmts?service=wmts&request=GetTile&version=1.0.0' +
      '&LAYER=vec&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
      '&style=default&format=tiles&tk=d845a99528ce08b31543c602207e873f',
    layer: 'tdtCva',
    style: 'default',
    format: 'tiles',
    tileMatrixSetID: 'c',
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    tilingScheme: new Cesium.GeographicTilingScheme(),
    tileMatrixLabels: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
    ],
    maximumLevel: 18,
  })

  let biaojiMap = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0" +
      "&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
      "&style=default&format=tiles&tk=d845a99528ce08b31543c602207e873f",
    layer: "tdtCva",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "c",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    tilingScheme: new Cesium.GeographicTilingScheme(),
    tileMatrixLabels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    maximumLevel: 18
  })

  let shangeMap = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://{s}.tianditu.gov.cn/ter_c/wmts?service=wmts&request=GetTile&version=1.0.0" +
      "&LAYER=ter&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
      "&style=default&format=tiles&tk=d845a99528ce08b31543c602207e873f",
    layer: "tdtCva",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "c",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    tilingScheme: new Cesium.GeographicTilingScheme(),
    tileMatrixLabels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    maximumLevel: 18
  })
  let tdtLayer = new Cesium.UrlTemplateImageryProvider({
			url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
			minimumLevel: 3,
			maximumLevel: 18
		})
  viewer.imageryLayers.addImageryProvider(tdtLayer)
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
}
</style>
