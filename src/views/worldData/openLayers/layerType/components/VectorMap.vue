<template>
  <div class="vector-map">
    <!-- -->
    <div id="vector-map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted} from 'vue';
//引入地图样式
import 'ol/ol.css';
import {GeoJSON } from 'ol/format';
import Map from 'ol/Map.js';
import { Vector as VectorSource,} from 'ol/source';
import View from 'ol/View.js';
import { Vector } from 'ol/layer';

import data from '@/views/worldData/GeoJSON/China.json';

// 数据源
const source = new VectorSource({
  // 特征
  features: new GeoJSON().readFeatures(data)
});

// 设置图层
const vector = new Vector({ source });

function initMap() {
  new Map({
    target: 'vector-map',
    layers: [vector],
    view: new View({
      center: [108.4, 35.75],
      zoom: 5,
      projection: 'EPSG:4326'
    })
  });
}
onMounted(() => {
  initMap();
});
</script>

<style lang="scss" scoped>
.vector-map {
  height: 100%;
  width: 100%;

  #vector-map {
    height: 100%;
    width: 100%;
  }
}
</style>
