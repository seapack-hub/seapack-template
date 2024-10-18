<template>
  <div class="open-layers">
    <!--按钮-->
    <div class="button-group">
      <el-button @click="toggleLayer" >显示与隐藏</el-button>
      <el-button @click="startLine" :disabled="isDraw">开始绘制</el-button>
      <el-button @click="clearLine">清除绘制</el-button>
    </div>
    <!--地图-->
    <div id="map" class="map-x">

    </div>
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
import {Tile,Vector as VectorLayer} from 'ol/layer';
import {OSM,XYZ,TileWMS,Vector as VectorSource} from "ol/source";
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
import {Draw} from 'ol/interaction'

//初始化一个地图对象
let map = ref(null);
//创建一个绘制实例
let draw = ref(null);
//初始化一个绘制变量
let isDraw = ref(false);
//定义绘制的线条数据
let lineData = ref([])

/**
 * 初始化地图
 */
function initMap(){
  //设置配置
  const options = {
    //绑定html元素
    target:"map",
    //图层
    layers:[
      new Tile({
        source:new XYZ({
          url:'http://t4.tianditu.com/DataServer?T=vec_w&tk=d845a99528ce08b31543c602207e873f&x={x}&y={y}&l={z}',
        }), // 图层数据源（OSM可以在练习时使用，千万别用在真实项目！！！）
        visible:true,  //初始化是否展示图层
        opacity: 1 // 设置图层不透明度
      }),
      new Tile({
        source:new XYZ({
          url:'http://t4.tianditu.com/DataServer?T=cva_w&tk=d845a99528ce08b31543c602207e873f&x={x}&y={y}&l={z}'
        }), // 图层数据源（OSM可以在练习时使用，千万别用在真实项目！！！）
        visible:true,
        opacity: 1 // 设置图层不透明度
      }),
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
      // new OverviewMap({
      //   layers:[
      //     new Tile({
      //       source:new XYZ({
      //         url:'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
      //       })
      //     })
      //   ],
      //   //默认小地图打开
      //   collapsed: false
      // }),
      new ZoomToExtent({
        //定义要展示区域的4个角的坐标
        extent:[114,25,156,40]
      }),
      new ZoomSlider()
    ])
  }
  map.value = new Map(options)
}
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
// function createPoint(){
//   // 创建一个点的图层，需要一个layer来放置点
//   let pointLayer = new VectorLayer({
//     source:new VectorSource()
//   });
//   const point = new Feature({
//     //点的位置
//     geometry:new Point([114.064839, 22.548857])
//   });
//   //设置点的样式信息
//   const styleConfig = {
//     //形状
//     image:new Circle({
//       radius:10,
//       fill:new Fill({
//         color: '#b40101'
//       })
//     })
//   }
//   point.setStyle(new Style(styleConfig));
//   //将点添加至layer中
//   pointLayer.getSource()?.addFeature(point);
//   map.value.addLayer(pointLayer)
// }

/**
 * 创建线
 */
function startLine(){
  isDraw.value = true;
  //创建矢量图层
  const source = new VectorSource({
    wrapX:false
  });
  const lineLayer = new VectorLayer({
    source:source,
    style: new Style({
      stroke: new Stroke({
        color: '#14ec0e',
        width: 2,
      }),
    }),
  })
  map.value.addLayer(lineLayer)
  //创建绘制交互实例
  draw.value = new Draw({
    source:source,
    type: 'LineString', // 默认绘制类型为点
    style: new Style({
      stroke: new Stroke({
        color: '#14ec0e',
        width: 2,
      }),
    }),
  });

  //drawstart-绘制开始时调用，单击鼠标触发
  //drawend-绘制结束时调用，双击鼠标触发
  draw.value.on("drawend",function(event){
    //将线条端点位置数据存储到数组中
    if(event.target.sketchCoords_.length>0){
      lineData.value.push(event.target.sketchCoords_)
    }
    //停止绘制
    removeInteraction()
  })
  map.value.addInteraction(draw.value);
}

/**
 * 清楚线
 */
function clearLine(){

}

/**
 * 停止绘画
 */
function removeInteraction(){
  map.value.removeInteraction(draw.value);
  //绘制结束
  isDraw.value = false;
}

onMounted(()=>{
  initMap();
})
</script>

<style scoped lang="scss">
.open-layers{
  width: 100%;
  height: 100%;
  //padding: 20px;
  .title{
    text-align: center;
  }
  .button-group{
    height: 50px;
    display: flex;
    align-items: center;
  }
}
.map-x{
  height: calc(100% - 50px);
  //width: calc(100% - 50px);
  width: 100%;
}
</style>