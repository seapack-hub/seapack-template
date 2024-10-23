<template>
  <div class="heat-map">
    <!-- -->
    <div class="operate-control">
      <div class="slider-demo-block">
        <span class="demonstration">半径</span>
        <el-slider v-model="radius" />
      </div>
      <div class="slider-demo-block">
        <span class="demonstration">模糊度</span>
        <el-slider v-model="blur" />
      </div>
    </div>
    <div id="heat-map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
//引入地图样式
import 'ol/ol.css'
import KML from 'ol/format/KML.js'
import Map from 'ol/Map.js'
import StadiaMaps from 'ol/source/StadiaMaps.js'
import VectorSource from 'ol/source/Vector.js'
//引入 XYZ方法 加载瓦片地图资源数据
import XYZ from 'ol/source/XYZ'
import View from 'ol/View.js'
import {Geometry, Point} from "ol/geom"
//引入地图-Map，视图-View
import { Heatmap as HeatmapLayer, Tile as TileLayer } from 'ol/layer.js'

const radius = ref(15)
const blur = ref(25)
const vector = new HeatmapLayer({
  source: new VectorSource({
    url: 'data/kml/2012_Earthquakes_Mag5.kml',
    format: new KML({
      extractStyles: true,
    }),
  }),
  blur: parseInt('' + blur.value, 10),
  radius: parseInt('' + radius.value, 10),
  weight: function (feature) {
    const name = feature.get('name')
    const magnitude = parseFloat(name.substr(2))
    return magnitude - 5
  },
  gradient: ['#2200FF', '#16D9CC', '#4DEE12', '#E8D225', '#EF1616'],
})
const raster = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
})

let features = [];
function setFeatures() {
  for (let i = 0; i < 1100; i++) {
    let point = [
      130 + 30 * Math.random() - 40 * Math.random(),
      262 * Math.random() - 2 * Math.random(),
    ]
    features.push({
      geometry:new Point(point)
    })
  }
}

/** 初始化地图 */
function initMap() {
  // setFeatures();
  // const heatMapSource = new VectorSource({features:features});
  // const heatMap = new HeatmapLayer({
  //   source:heatMapSource
  // })
  new Map({
    layers: [raster,vector],
    target: 'heat-map',
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  })


}

onMounted(() => {
  initMap()
})
watch(radius, (New, Old) => {
  vector.setRadius(New)
})
watch(blur, (New) => {
  vector.setBlur(New)
})
</script>

<style lang="scss" scoped>
.heat-map {
  width: 100%;
  height: 100%;
  .operate-control {
    display: flex;
    justify-content: left;
    .slider-demo-block {
      width: 200px;
      display: flex;
      align-items: center;
      margin-left: 30px;
      gap: 5px;
      align-items: center;
      .demonstration {
        display: inline-block;
        width: 80px;
      }
    }
  }
  #heat-map {
    margin-top: 10px;
    height: calc(100% - 50px);
    //width: calc(100% - 50px);
    width: 100%;
  }
}
</style>
