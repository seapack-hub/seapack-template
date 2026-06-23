<template>
  <div class="vector-map">
    <div id="vector-map"></div>
  </div>
</template>

<script setup lang="ts">
import { GeoJSON } from 'ol/format';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import chinaData from '@/views/worldData/GeoJSON/China.json';

const map = ref<Map | null>(null);

const source = new VectorSource({
  features: new GeoJSON().readFeatures(chinaData),
});
const vector = new VectorLayer({ source });

function initMap() {
  map.value = new Map({
    target: 'vector-map',
    layers: [vector],
    view: new View({ center: [108.4, 35.75], zoom: 5, projection: 'EPSG:4326' }),
  });
}

onMounted(initMap);

onUnmounted(() => {
  map.value?.setTarget(undefined);
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