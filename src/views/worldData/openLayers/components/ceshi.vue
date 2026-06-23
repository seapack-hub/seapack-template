<template>
  <div class="open-layers">
    <div class="button-group">
      <el-button @click="toggleLayer">显示与隐藏</el-button>
      <el-button :disabled="isDrawing" @click="startLine">开始绘制</el-button>
      <el-button @click="clearLine">清除绘制</el-button>
    </div>
    <div id="map" class="map-x"></div>
  </div>
</template>

<script setup lang="ts">
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { Style, Stroke } from 'ol/style';
import { ScaleLine, FullScreen, ZoomToExtent, ZoomSlider } from 'ol/control';
import { defaults } from 'ol/control/defaults';
import { Draw } from 'ol/interaction';
import type Interaction from 'ol/interaction/Interaction';

const map = ref<Map | null>(null);
const draw = ref<Draw | null>(null);
const isDrawing = ref(false);

/** 初始化地图 */
function initMap() {
  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'http://t4.tianditu.com/DataServer?T=vec_w&tk=d845a99528ce08b31543c602207e873f&x={x}&y={y}&l={z}',
        }),
      }),
      new TileLayer({
        source: new XYZ({
          url: 'http://t4.tianditu.com/DataServer?T=cva_w&tk=d845a99528ce08b31543c602207e873f&x={x}&y={y}&l={z}',
        }),
      }),
    ],
    view: new View({
      projection: 'EPSG:4326',
      center: [114.064839, 22.548857],
      zoom: 10,
      maxZoom: 18,
      minZoom: 1,
    }),
    controls: defaults().extend([
      new ScaleLine(),
      new FullScreen(),
      new ZoomToExtent({ extent: [114, 25, 156, 40] }),
      new ZoomSlider(),
    ]),
  });
}

onMounted(initMap);

onUnmounted(() => {
  map.value?.setTarget(undefined);
});

/** 切换前两个图层的显隐 */
function toggleLayer() {
  const layers = map.value?.getLayers();
  if (!layers) return;
  [layers.item(0), layers.item(1)].forEach((layer) => {
    if (layer) layer.setVisible(!layer.getVisible());
  });
}

/** 开始绘制线 */
function startLine() {
  if (!map.value) return;
  isDrawing.value = true;

  const source = new VectorSource({ wrapX: false });
  const lineLayer = new VectorLayer({
    source,
    style: new Style({ stroke: new Stroke({ color: '#14ec0e', width: 2 }) }),
  });
  map.value.addLayer(lineLayer);

  draw.value = new Draw({
    source,
    type: 'LineString',
    style: new Style({ stroke: new Stroke({ color: '#14ec0e', width: 2 }) }),
  });

  draw.value.on('drawend', () => {
    removeInteraction();
  });

  map.value.addInteraction(draw.value as unknown as Interaction);
}

/** 清除所有绘制的线 */
function clearLine() {
  if (!map.value) return;
  removeInteraction();
  const layers = map.value.getLayers();
  // 移除最后添加的矢量图层（即绘制图层）
  for (let i = layers.getLength() - 1; i >= 0; i--) {
    const layer = layers.item(i);
    if (layer instanceof VectorLayer) {
      map.value.removeLayer(layer);
      break;
    }
  }
}

/** 移除绘制交互 */
function removeInteraction() {
  if (draw.value && map.value) {
    map.value.removeInteraction(draw.value as unknown as Interaction);
    draw.value = null;
  }
  isDrawing.value = false;
}
</script>

<style scoped lang="scss">
.open-layers {
  width: 100%;
  height: 100%;
}
.button-group {
  height: 50px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
}
.map-x {
  height: calc(100% - 50px);
  width: 100%;
}
</style>