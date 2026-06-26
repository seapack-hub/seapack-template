<template>
  <div class="open-layers">
    <div ref="mapContainer" class="map-x">
      <div class="search-box">
        <el-input v-model="searchKeyword" type="text" placeholder="请输入地名或地址" @keyup.enter="handleSearch" />
        <el-button @click="handleSearch">搜索</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import { ScaleLine, ZoomToExtent, ZoomSlider, FullScreen, OverviewMap } from 'ol/control';
import { fromLonLat, toLonLat } from 'ol/proj';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { easeOut } from 'ol/easing';
import { ElMessage } from 'element-plus';
import { TILE_URLS } from '../utils';

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<Map | null>(null);
const searchKeyword = ref('');
const selectedLocation = ref<{ address: string; lng: number; lat: number } | null>(null);

const GAODE_API_KEY = '3683614052132ea3dcefc22459dadcf1';

// 标记图层（全局共享，便于增删标记）
const markerSource = new VectorSource();
const markerLayer = new VectorLayer({
  source: markerSource,
  style: new Style({
    image: new Icon({
      src: 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.9.0/build/ol/ext/marker.png',
      scale: 0.8,
      anchor: [0.5, 1],
    }),
  }),
});

/** 初始化地图 */
function initMap() {
  if (!mapContainer.value) return;

  map.value = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new XYZ({ url: TILE_URLS.GAODE_VEC }),
      }),
      markerLayer,
    ],
    view: new View({
      center: fromLonLat([114.323359, 30.472036]),
      zoom: 10,
    }),
  });

  // 点击地图获取地址
  map.value.on('click', (event) => {
    const lonLat = toLonLat(event.coordinate);
    reverseGeocode(lonLat[0], lonLat[1]);
  });

  // 控件
  map.value.addControl(new ZoomToExtent({ extent: [110, 30, 120, 30] }));
  map.value.addControl(new ZoomSlider());
  map.value.addControl(new FullScreen());
  map.value.addControl(
    new OverviewMap({
      layers: [new TileLayer({ source: new XYZ({ url: TILE_URLS.GAODE_IMG }) })],
      collapsed: false,
    })
  );
  const scaleLine = new ScaleLine({ units: 'degrees' });
  map.value.addControl(scaleLine);
  scaleLine.setUnits('metric');
}

onMounted(initMap);

onUnmounted(() => {
  map.value?.setTarget(undefined);
});

/** 搜索地名并定位 */
async function handleSearch() {
  if (!searchKeyword.value.trim()) return;
  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(searchKeyword.value)}&output=JSON&key=${GAODE_API_KEY}`
    );
    const data = await res.json();
    if (data.status === '1' && data.geocodes?.length > 0) {
      const first = data.geocodes[0];
      const [lng, lat] = first.location.split(',').map(Number);
      map.value?.getView().animate({ center: fromLonLat([lng, lat]), zoom: 10, duration: 2000, easing: easeOut });
      addMarker(lng, lat, first.formatted_address);
      selectedLocation.value = { address: first.formatted_address, lng, lat };
    } else {
      ElMessage.warning('未找到相关地点');
    }
  } catch {
    ElMessage.error('搜索失败，请稍后重试');
  }
}

/** 添加标记点 */
function addMarker(lng: number, lat: number, title: string) {
  markerSource.clear();
  const marker = new Feature({ geometry: new Point(fromLonLat([lng, lat])), name: title });
  markerSource.addFeature(marker);
}

/** 逆地理编码（点击地图回调查地址） */
async function reverseGeocode(lng: number, lat: number) {
  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?output=JSON&location=${lng},${lat}&key=${GAODE_API_KEY}&radius=1000&extensions=base`
    );
    const data = await res.json();
    if (data.status === '1' && data.regeocode) {
      selectedLocation.value = { address: data.regeocode.formatted_address, lng, lat };
      addMarker(lng, lat, data.regeocode.formatted_address);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('逆地理编码失败:', error);
  }
}
</script>

<style scoped lang="scss">
.open-layers {
  width: 100%;
  height: 100%;
}
.map-x {
  height: 100%;
  width: 100%;
  position: relative;
}
.search-box {
  position: absolute;
  top: 10px;
  right: 50px;
  z-index: 100;
  display: flex;
  gap: 10px;
}
::v-deep(.ol-zoomslider) { top: 9em; }
::v-deep(.ol-scale-line) { left: 180px; }
</style>