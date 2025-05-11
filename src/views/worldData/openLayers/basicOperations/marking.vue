<template>
  <!--标注-->
  <div class="marking">
    <!-- -->
    <div id="marking"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted} from 'vue';
//引入地图样式
import 'ol/ol.css';
//引入地图-Map，视图-View . 特征-Feature
import { Map, View, Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style,Fill, Stroke, Circle } from 'ol/style';
//引入图层
import {  Vector as VectorLayer } from 'ol/layer';
//引入 XYZ方法 加载瓦片地图资源数据
import { Vector as VectorSource } from 'ol/source';
// 获取地图基本配置
import { useOlMapConfig } from '@/views/worldData/hooks/useOlMapConfig.ts';
const { tileMap, x, y} = useOlMapConfig();
/** 初始化地图 */
function initMap() {
  //创建一个视图
  const view = new View({
    // 采用经纬度坐标系
    projection: 'EPSG:4326',
    // 设置中心点
    center: [x, y],
    // 设置缩放级别
    zoom: 8
  });

  //实例化矢量点要素
  const iconFeature = new Feature({
    //形状元素：点
    geometry: new Point([108.4, 35.75]),
    name: '北京市',
    population: 2115
  });

  //设置样式
  const style = new Style({
    image: new Circle({
      radius: 10,
      fill: new Fill({
        color: '#ff2d52'
      }),
      stroke: new Stroke({
        color: '#333',
        width: 2
      })
    })
    // image: new Icon({
    //   anchor: [0.5, 60], //锚点
    //   anchorOrigin: 'top-right', //锚点源
    //   anchorXUnits: 'fraction', //锚点X值单位
    //   anchorYUnits: 'pixels', //锚点Y值单位
    //   offsetOrigin: 'top-right', //偏移原点
    //   opacity: 1,
    //   src: '../image/marking.png', //图标的URL
    //   width:20,
    //   height:20
    // }),
    // text: new Text({
    //   textAlign: 'center', //位置
    //   textBaseline: 'middle', //基准线
    //   font: 'normal 14px 微软雅黑', //文字样式
    //   text: "武汉市", //文本内容
    //   fill: new Fill({
    //     //文本填充样式（即文字颜色)
    //     color: '#000',
    //   }),
    //   stroke: new Stroke({
    //     color: '#F00',
    //     width: 2,
    //   }),
    // }),
  });
  //矢量标注 添加样式
  iconFeature.setStyle(style);

  //矢量数据源
  const vectorSource = new VectorSource({
    features: [iconFeature]
  });
  //将数据源添加到矢量图层
  const vectorLayer = new VectorLayer({
    source: vectorSource
  });
  //map.addLayer(vectorLayer);

  //创建一个地图并初始化
  const map = new Map({
    //地图挂载目标元素
    target: 'marking',
    layers: [tileMap],
    view: view
  });
  map.addLayer(vectorLayer);
}

onMounted(() => {
  initMap();
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
