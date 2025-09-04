<template>
  <div class="open-layers">
    <!--地图-->
    <div
      id="map"
      ref="mapContainer"
      class="map-x"
    >
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          type="text"
          placeholder="请输入地名或地址"
          @keyup.enter="handleSearch"
        />
        <el-button @click="handleSearch">
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted} from 'vue';
//引入地图样式
import 'ol/ol.css';
//引入地图-Map，视图-View
import { Map, View } from 'ol';
//引入图层
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
//引入 XYZ方法 加载瓦片地图资源数据
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import { ScaleLine, ZoomToExtent, ZoomSlider, FullScreen, OverviewMap } from 'ol/control';
import { fromLonLat, toLonLat } from 'ol/proj';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import {easeOut} from 'ol/easing';

// 地图相关引用和状态
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<Map | null>(null);
const searchKeyword = ref<string>('');
const selectedLocation = ref<{ address: string; lng: number; lat: number } | null>(null);
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
// 高德地图API密钥（请替换为您自己的密钥）
const GAODE_API_KEY = '3683614052132ea3dcefc22459dadcf1';

/** 初始化地图 */
function initMap() {
  if (!mapContainer.value) return;

  //创建一个地图并初始化
  map.value = new Map({
    //地图挂载目标元素
    target: mapContainer.value,
    layers: [
      // 高德地图图层[1,4](@ref)
      new TileLayer({
        source: new XYZ({
          url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        }),
      }),
      markerLayer, // 标记点图层
    ],
    view: new View({
      // 设置初始中心点
      center: fromLonLat([114.323359, 30.472036]),
      // 设置缩放级别
      zoom: 10
    }),
  });
  // 添加点击地图事件[1](@ref)
  map.value.on('click', (event) => {
    const coordinate = event.coordinate;
    const lonLat = toLonLat(coordinate);
    reverseGeocode(lonLat[0], lonLat[1]);
  });
  
  /** 添加各类控制器*/
  // 视图跳转控件
  map.value.addControl(
    new ZoomToExtent({
      // 定义要展示区域的4个角的坐标 设置跳转中心点为武汉
      extent: [110, 30, 120, 30]
    })
  );
  // 放大缩小控件
  map.value.addControl(new ZoomSlider());
  // 添加全屏控件
  map.value.addControl(new FullScreen());
  // 添加鹰眼控件
  map.value.addControl(
    new OverviewMap({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
          })
        })
      ],
      //默认小地图打开
      collapsed: false
      // view:new View({
      //   //和主图使用同样的坐标系系统
      //   projection: 'EPSG:4326'
      // })
    })
  );
  const scaleLineControl = new ScaleLine({
    //单位
    units: 'degrees'
  });
  // 添加比例尺
  map.value.addControl(scaleLineControl);
  scaleLineControl.setUnits('metric');
}

//初始化
onMounted(() => {
  initMap();
});

// 组件卸载时清理资源
onUnmounted(() => {
  if (map.value) {
    map.value.setTarget(undefined);
  }
});

//处理搜索
const handleSearch = async (): Promise<void> => {
  if (!searchKeyword.value.trim()) return;
  try{
    // 调用高德地理编码 API[5](@ref)
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(searchKeyword.value)}&output=JSON&key=${GAODE_API_KEY}`
    );
    const data = await response.json();
    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const firstResult = data.geocodes[0];
      const location = firstResult.location.split(',').map(Number);
      const lng = location[0];
      const lat = location[1];

      // 移动地图视图到搜索到的位置
      map.value?.getView().animate({
        center: fromLonLat([lng, lat]),
        zoom: 10,
        duration: 2000,
        easing: easeOut // 添加缓动函数：快速开始，逐渐减速
      });

      // 添加标记
      addMarker(lng, lat, firstResult.formatted_address);

      // 更新选中位置信息
      selectedLocation.value = {
        address: firstResult.formatted_address,
        lng: lng,
        lat: lat,
      };
    } else {
      alert('未找到相关地点');
    }
  }catch(error){
    alert('搜索失败，请稍后重试');
  }
}
// 添加标记函数
const addMarker = (lng: number, lat: number, title: string): void => {
  // 清除现有标记
  markerSource.clear();

  // 创建新标记
  const marker = new Feature({
    geometry: new Point(fromLonLat([lng, lat])),
    name: title,
  });

  markerSource.addFeature(marker);
};

// 逆地理编码函数（点击地图时获取地址信息）
const reverseGeocode = async (lng: number, lat: number): Promise<void> => {
  try {
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?output=JSON&location=${lng},${lat}&key=${GAODE_API_KEY}&radius=1000&extensions=base`
    );
    const data = await response.json();

    if (data.status === '1' && data.regeocode) {
      selectedLocation.value = {
        address: data.regeocode.formatted_address,
        lng: lng,
        lat: lat,
      };
      // 添加标记
      addMarker(lng, lat, data.regeocode.formatted_address);
    }
  } catch (error) {
    console.error('逆地理编码失败:', error);
  }
};
</script>

<style scoped lang="scss">
.open-layers {
  width: 100%;
  height: 100%;
  .map-x {
    height: 100%;
    width: 100%;
    position: relative;
    .search-box{
      position:absolute;
      top:10px;
      right:50px;
      z-index:100;
      display: flex;
      gap:10px;
    }
  }
}

::v-deep(.ol-zoomslider) {
  top: 9em;
}
::v-deep(.ol-scale-line) {
  left: 180px;
}
</style>
