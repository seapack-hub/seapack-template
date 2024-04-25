<template>
  <h3>OpenLayer地图</h3>
  <div>
    <el-button @click="toggleLayer">显示与隐藏</el-button>
  </div>
  <div id="map" class="map-x">

  </div>
</template>

<script setup lang="ts">
import {onMounted,ref} from "vue";
//引入样式
import 'ol/ol.css';
import 'ol/obj'
/**
 * 地图实例函数-Map
 * 地图视图-View
 * 图斑-Feature
 */
import {Map,View,Feature,} from 'ol';
import {Tile,Vector} from 'ol/layer';
import {OSM,XYZ,TileWMS,Vector as VectorS} from "ol/source";
/**
 * 点-Point,
 * 线-LineString
 * 面-Polygon
 */
import {Point,LineString,Polygon} from 'ol/geom'
/**
 * 样式容器-Style,
 * 填充色-Fill
 * 边线颜色-Stroke
 * 形状-Circle
 */
import {Style,Fill,Stroke,Circle} from 'ol/style'
/**
 * 比例尺-ScaleLine
 * 全屏-FullScreen
 * 鹰眼小地图-OverviewMap
 * 导览组件-ZoomToExtent
 * 缩放组件-ZoomSlider
 */
import {ScaleLine,FullScreen,OverviewMap,ZoomToExtent,ZoomSlider} from 'ol/control';
import {defaults} from 'ol/control/defaults'

//初始化一个地图对象
let map = ref(null);
// 需要一个vector的layer来放置点
let layer = new Vector({
  source:new VectorS()
});
/**
 * 显示与隐藏
 */
function toggleLayer(){
  //获取图层组
  let layers = map.value.getLayers();
  const list = [layers.item(0),layers.item(1)];
  list.forEach(item=>{
    item.setVisible(!item.getVisible());
  });
}

/**
 * 创建点
 */
function createPoint(){
  const point = new Feature({
    //点的位置
    geometry:new Point([114.064839, 22.548857])
  });
  //设置点的样式信息
  const styleConfig = {
    //填充色
    // fill:new Fill({
    //   color: 'rgb(180,1,1)'
    // }),
    // //边线颜色
    // stroke:new Stroke({
    //   color: '#b40110',
    //   width: 2,
    // }),
    //形状
    image:new Circle({
      radius:10,
      fill:new Fill({
        color: '#b40101'
      })
    })
  }
  point.setStyle(new Style(styleConfig));
  //将点添加至layer中
  layer.getSource()?.addFeature(point)
}

function createLine(){
  const line = new Feature({
    geometry:new LineString([[117.2, 35.8], [117.48, 36.8]])
  })
}

//设置配置
const options = {
  //绑定html元素
  target:"map",
  //图层
  layers:[
    new Tile({
      source:new XYZ({
        url:'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      }), // 图层数据源（OSM可以在练习时使用，千万别用在真实项目！！！）
      visible:true,  //初始化是否展示图层
      opacity: 1 // 设置图层不透明度
    }),
    new Tile({
      source:new XYZ({
        url:'https://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
      }), // 图层数据源（OSM可以在练习时使用，千万别用在真实项目！！！）
      visible:true,
      opacity: 1 // 设置图层不透明度
    }),
      layer
    // new Tile({
    //   source:new XYZ({
    //     url:'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
    //   }), // 图层数据源（OSM可以在练习时使用，千万别用在真实项目！！！）
    //   visible:false,
    // }),
  ],
  //地图视图
  view:new View({
    projection:"EPSG:4326", // 坐标系，有EPSG:4326和EPSG:3857
    center:[114.064839, 22.548857], //深圳坐标
    zoom:10, //// 地图缩放级别（打开页面时默认级别）
    maxZoom: 18, // 最大缩放等级
    minZoom: 1, // 最小缩放等级
    // rotation: Math.PI/ 180*45, //地图旋转45度
  }),
  //控制器
  controls:defaults().extend([
    new ScaleLine(),
    new FullScreen(),
    new OverviewMap({
      layers:[
        new Tile({
          source:new XYZ({
            url:'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
          })
        })
      ],
      //默认小地图打开
      collapsed: false
    }),
    new ZoomToExtent({
      //定义要展示区域的4个角的坐标
      extent:[114,25,156,40]
    }),
    new ZoomSlider()
  ])
}

onMounted(()=>{
  createPoint()
  map.value = new Map(options)
})
</script>

<style scoped lang="scss">
.map-x{
  height: 600px;
  width: 600px;
  margin-left: 10px;
}
</style>