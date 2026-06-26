<template>
  <div ref="container" class="marking">
    <div id="marking"></div>
  </div>
</template>

<script setup lang="ts">
import { Map, View, Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { createTileLayer } from '../utils';

//const container = ref<HTMLElement | null>(null);
const map = ref<Map | null>(null);

/** 初始化地图 + 矢量标注点 */
function initMap() {
  const view = new View({ projection: 'EPSG:4326', center: [108.4, 35.75], zoom: 5 });

  // 标注要素
  const marker = new Feature({
    geometry: new Point([108.4, 35.75]),
    name: '北京市',
    population: 2115,
  });
  marker.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: '#ff2d52' }),
        stroke: new Stroke({ color: '#333', width: 2 }),
      }),
    })
  );

  const vectorSource = new VectorSource({ features: [marker] });
  const vectorLayer = new VectorLayer({ source: vectorSource });

  map.value = new Map({
    target: 'marking',
    layers: [createTileLayer(), vectorLayer],
    view,
  });
}

onMounted(initMap);

onUnmounted(() => {
  map.value?.setTarget(undefined);
});
</script>

<style lang="scss" scoped>
.marking {
  width: 100%;
  height: 100%;
  #marking {
    width: 100%;
    height: 100%;
  }
}
</style>