<template>
  <div class="open-layers">
    <!--地图-->
    <div id="map" class="map-x"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
//引入地图样式
import 'ol/ol.css'
//引入地图-Map，视图-View
import { Map, View } from 'ol'
//引入图层
import TileLayer from 'ol/layer/Tile'
//引入 XYZ方法 加载瓦片地图资源数据
import XYZ from 'ol/source/XYZ'
// 引入 GeoJSON 方法加载地图对应的JSON格式数据
import GeoJSON from 'ol/format/GeoJSON'
// 填充和设置样式
import Fill from 'ol/style/Fill'
import Style from 'ol/style/Style'
import {
  ScaleLine,
  ZoomToExtent,
  ZoomSlider,
  FullScreen,
  OverviewMap,
  defaults,
} from 'ol/control'

// 获取地图基本配置
import { useOlMapConfig } from '@/views/worldData/hooks/useOlMapConfig.ts'
const { tileMap, x, y, zoom } = useOlMapConfig()

/** 初始化地图 */
function initMap() {
  //创建一个视图
  const view = new View({
    // 采用经纬度坐标系
    projection: 'EPSG:4326',
    // 设置中心点
    center: [x, y],
    // 设置缩放级别
    zoom: zoom,
  })

  //创建一个地图并初始化
  const map = new Map({
    //地图挂载目标元素
    target: 'map',
    layers: [tileMap],
    view: view,
  })

  /** 添加各类控制器*/
  // 视图跳转控件
  map.addControl(
    new ZoomToExtent({
      // 定义要展示区域的4个角的坐标 设置跳转中心点为武汉
      extent: [110, 30, 120, 30],
    })
  )
  // 放大缩小控件
  map.addControl(new ZoomSlider())
  // 添加全屏控件
  map.addControl(new FullScreen())
  // 添加鹰眼控件
  map.addControl(
    new OverviewMap({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
          }),
        }),
      ],
      //默认小地图打开
      collapsed: false,
      // view:new View({
      //   //和主图使用同样的坐标系系统
      //   projection: 'EPSG:4326'
      // })
    })
  )
  const scaleLineControl = new ScaleLine({
      //单位
      units: 'degrees'
    });
  // 添加比例尺
  map.addControl(scaleLineControl)
  scaleLineControl.setUnits('metric');
}

onMounted(() => {
  initMap()
})
</script>

<style scoped lang="scss">
.open-layers {
  width: 100%;
  height: 100%;
  .map-x {
    height: 100%;
    //width: calc(100% - 50px);
    width: 100%;
  }
}

::v-deep(.ol-zoomslider) {
  top: 9em;
}
::v-deep(.ol-scale-line){
  left:180px;
}
</style>
