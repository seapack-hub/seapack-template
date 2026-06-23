<template>
  <div class="heat-map">
    <div class="operate-control">
      <div class="slider-demo-block">
        <span class="demonstration">半径</span>
        <el-slider v-model="radius" :min="5" :max="50" />
      </div>
      <div class="slider-demo-block">
        <span class="demonstration">模糊度</span>
        <el-slider v-model="blur" :min="5" :max="50" />
      </div>
    </div>
    <div id="heat-map"></div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import { Heatmap as HeatmapLayer, Tile as TileLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import KML from 'ol/format/KML';
import StadiaMaps from 'ol/source/StadiaMaps';

const radius = ref(15);
const blur = ref(25);

const vector = new HeatmapLayer({
  source: new VectorSource({
    url: 'https://openlayers.org/data/kml/2012_Earthquakes_Mag5.kml',
    format: new KML({ extractStyles: false }),
  }),
  blur: blur.value,
  radius: radius.value,
  weight: (feature) => {
    const name = feature.get('name') as string;
    const magnitude = parseFloat(name.substring(2));
    return Math.max(0, Math.min(1, (magnitude - 5) / 5));
  },
  gradient: ['#2200FF', '#16D9CC', '#4DEE12', '#E8D225', '#EF1616'],
});

const raster = new TileLayer({
  source: new StadiaMaps({ layer: 'stamen_toner' }),
});

const map = ref<Map | null>(null);

function initMap() {
  map.value = new Map({
    layers: [raster, vector],
    target: 'heat-map',
    view: new View({ center: [0, 20], zoom: 2 }),
  });
}

onMounted(initMap);

onUnmounted(() => {
  map.value?.setTarget(undefined);
});

watch(radius, (val) => vector.setRadius(val));
watch(blur, (val) => vector.setBlur(val));
</script>

<style lang="scss" scoped>
.heat-map {
  width: 100%;
  height: 100%;
}
.operate-control {
  display: flex;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}
.slider-demo-block {
  width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 30px;
}
.demonstration {
  white-space: nowrap;
  width: 50px;
}
#heat-map {
  height: calc(100% - 50px);
  width: 100%;
}
</style>