<template>
  <div class="gis-container relative h-100vh w-100% bg-[#0a0e17]">
    <!-- Cesium渲染容器 -->
    <div class="cesiumContainer h-100% w-100%" ref="cesiumContainerRef"></div>

  </div>
</template>

<script setup lang="ts">
//import Head from "./components/head.vue";
//import Left from "./components/Left.vue";
import * as Cesium from 'cesium';
import { loadJsonData } from "./utils/loadData.ts"

const cesiumContainerRef = ref<HTMLElement | null>(null);
const viewer = ref<Cesium.Viewer | null>(null);
const currentLocation = ref<{ lon: number; lat: number; district?: string } | null>(null)
// ========== 武汉精准坐标（基于武汉市人民政府位置微调） ==========
const WUHAN_CENTER = {
  lon: 114.2986, // 东经
  lat: 30.5838,  // 北纬
  height: 8000   // 初始视角高度（米），8000米可清晰看到主城区
}

const initCesium = async () => {
  if(!cesiumContainerRef.value) return;
  await nextTick();
  try{
    // 创建Viewer（禁用非必要控件，大屏更简洁）
    viewer.value = new Cesium.Viewer(cesiumContainerRef.value, {
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      infoBox: true,
      selectionIndicator: true,
      shadows: true, // 启用阴影增强立体感
      //terrainProvider: Cesium.createWorldTerrain({ requestWaterMask: true, requestVertexNormals: true })
    });

    const tiandituToken = 'd845a99528ce08b31543c602207e873f';
    const imagery = new Cesium.WebMapTileServiceImageryProvider({
      url: `http://t0.tianditu.gov.cn/img_w/wmts?tk=${tiandituToken}`,
      layer: 'img',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'w',
      maximumLevel: 18,
      credit: new Cesium.Credit('天地图')
    })
    viewer.value.imageryLayers.removeAll()
    viewer.value.imageryLayers.addImageryProvider(imagery)

    // 初始定位武汉
    await flyToWuhan();
    //加载武汉区域数据
    await loadJsonData('/geojson/wuhan_districts.geojson',viewer.value)
    
    // 监听相机移动更新坐标显示
    viewer.value.camera.moveEnd.addEventListener(() => {
      const cartographic = viewer.value?.scene.globe.ellipsoid.cartesianToCartographic(
        viewer.value?.camera.position
      )
      if (cartographic) {
        currentLocation.value = {
          lon: Cesium.Math.toDegrees(cartographic.longitude),
          lat: Cesium.Math.toDegrees(cartographic.latitude)
        }
      }
    })
  }catch(err){
  }
}

// ========== 定位到武汉 ==========
const flyToWuhan = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!viewer.value) return resolve()
    
    viewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        WUHAN_CENTER.lon,
        WUHAN_CENTER.lat,
        WUHAN_CENTER.height
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),   // 方向角
        pitch: Cesium.Math.toRadians(-60),   // 俯仰角（-90为垂直向下，-60有立体感）
        roll: 0.0
      },
      duration: 2.5,
      complete: () => {
        currentLocation.value = { 
          lon: WUHAN_CENTER.lon, 
          lat: WUHAN_CENTER.lat,
          district: '江岸区（市中心）' 
        }
        resolve()
      }
    })
  })
}


onMounted(()=>{
  initCesium();

  // 监听窗口大小变化（大屏适配）
  window.addEventListener('resize', () => {
    viewer.value?.scene.requestRender()
  })
})

onUnmounted(() => {
  // 彻底销毁避免内存泄漏（大屏长时间运行关键！）
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
  window.removeEventListener('resize', () => {})
})

</script>

<style lang="scss">
@import './css/comon.scss';  /* 引入外部局部CSS文件 */
</style>

<style lang="scss" scoped>
.universal-templates{
  color:#666;
  font-size: 10px;
  background-color: rgba(0, 0, 0, 0);
  overflow: hidden;
  .main-box{
    width:100%;
    height: calc(100% - 105px);
    display:flex;
    justify-content: space-between;
    align-items: center;
    gap:10px;
    padding:15px 20px;
    &-left{
      height:100%;
      width:calc(30% - 10px);
    }
    &-center{
      height:100%;
      width:calc(40% - 10px);
    }
    &-right{
      height:100%;
      width:calc(30% - 10px);
    }
  }
}
</style>