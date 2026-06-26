<template>
  <div class="slice-map">
    <div class="control-bar">
      <el-radio-group v-model="currentLayer" @change="switchLayer">
        <el-radio value="vec">矢量底图</el-radio>
        <el-radio value="img">影像底图</el-radio>
      </el-radio-group>
    </div>
    <div id="slice-map"></div>
  </div>
</template>

<script setup lang="ts">
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { TILE_URLS } from '../../utils';

const map = ref<Map | null>(null);
const currentLayer = ref('vec');
const vecLayer = new TileLayer({ source: new XYZ({ url: TILE_URLS.GAODE_VEC }) });
const imgLayer = new TileLayer({ source: new XYZ({ url: TILE_URLS.GAODE_IMG }), visible: false });

function initMap() {
  map.value = new Map({
    target: 'slice-map',
    layers: [vecLayer, imgLayer],
    view: new View({ projection: 'EPSG:4326', center: [108.4, 35.75], zoom: 5 }),
  });
}

onMounted(initMap);

onUnmounted(() => {
  map.value?.setTarget(undefined);
});

/** 切换底图图层（矢量 / 影像） */
function switchLayer(val: string | number | boolean | undefined) {
  const v = val != null ? String(val) : 'vec';
  vecLayer.setVisible(v === 'vec');
  imgLayer.setVisible(v === 'img');
}
</script>

<style lang="scss" scoped>
.slice-map {
  width: 100%;
  height: 100%;
}
.control-bar {
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}
#slice-map {
  height: calc(100% - 44px);
  width: 100%;
}
</style>