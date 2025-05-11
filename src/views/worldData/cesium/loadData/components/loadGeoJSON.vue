<template>
  <div class="load-GeoJson">
    <div class="container">
      <el-select v-model="dataType" placeholder="请选择数据类型" @change="changeType">
        <el-option v-for="item in dataTypeOption" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { useCesiumStore } from '@/store/modules/cesium';
const cesiumStore = useCesiumStore();
import * as Cesium from 'cesium';

let dataTypeOption = ref([]);
dataTypeOption.value = [
  { label: 'GeoJSON数据', value: 'GeoJSON' },
  { label: 'KML数据', value: 'KML' },
  { label: 'KMZ数据', value: 'KMZ' },
  { label: 'CZML数据', value: 'CZML' }
];
let dataType = ref('');

function changeType(val) {
  switch (val) {
    case 'GeoJSON':
      loadGeoJSON();
      break;
    case 'KML':
      loadKML();
      break;
    case 'KMZ':
      loadKMZ();
      break;
    case 'CZML':
      loadCMZL();
      break;
    default:
      break;
  }
}

/** 加载GeoJson 数据*/
function loadGeoJSON() {
  //删除其他数据源
  cesiumStore.$state.loadDataViewer.dataSources.removeAll();
  let dataGeo = Cesium.GeoJsonDataSource.load('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json', {
    //边界线颜色
    stroke: Cesium.Color.RED,
    //填充颜色
    fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
    //边界线宽度
    strokeWidth: 4
  });
  dataGeo.then((dataSource) => {
    cesiumStore.$state.loadDataViewer.dataSources.add(dataSource);
    let entities = dataSource.entities.values;
    entities.forEach((entity, i) => {
      //设置实体材质
      entity.polygon.material = new Cesium.ColorMaterialProperty(
        //设置随机颜色
        Cesium.Color.fromRandom({
          alpha: 0.6
        })
      );
      //去掉边线
      entity.polygon.outline = false;
    });
  });
}
/** 加载KML 数据*/
function loadKML() {
  //删除其他数据源
  cesiumStore.$state.loadDataViewer.dataSources.removeAll();
  //加载静态文件
  const KmlUrl = new URL('@p/files/facilities1.kml', import.meta.url).href;
  //加载数据
  let kmlData = Cesium.KmlDataSource.load(KmlUrl, {
    camera: cesiumStore.$state.loadDataViewer.scene.camera,
    canvas: cesiumStore.$state.loadDataViewer.scene.canvas,
    screenOverlayContainer: cesiumStore.$state.loadDataViewer.container
  });
  kmlData.then((dataScource) => {
    cesiumStore.$state.loadDataViewer.dataSources.add(dataScource);
  });
}

/** 加载KMZ文件数据*/
function loadKMZ() {
  //删除其他数据源
  cesiumStore.$state.loadDataViewer.dataSources.removeAll();
  //加载静态文件
  const KmzUrl = new URL('@p/files/gdpPerCapita2008.kmz', import.meta.url).href;
  //解析kmz文件数据
  let kmzDataPromise = Cesium.KmlDataSource.load(KmzUrl);
  //将文件数据加入数据源
  kmzDataPromise.then(function (dataSource) {
    cesiumStore.$state.loadDataViewer.dataSources.add(dataSource);
  });
}

function loadCMZL() {
  //删除其他数据源
  cesiumStore.$state.loadDataViewer.dataSources.removeAll();
  //设置cmzl数据
  const czml = [
    {
      id: 'document',
      name: 'CZML Point - Time Dynamic',
      version: '1.0'
    },
    {
      id: 'point',
      // 物体在什么时间范围可用
      availability: '2024-12-25T16:00:00Z/2024-12-25T17:05:00Z',
      position: {
        // 设置物体的起始时间
        epoch: '2024-12-25T16:00:00Z',
        // 设置了四个维度，1维是时间，2维是经度，3维是纬度，4维是高度
        cartographicDegrees: [0, 90, 30, 150000, 100, 92, 32, 150000, 200, 95, 36, 150000, 300, 100, 45, 150000]
      },
      point: {
        color: {
          rgba: [255, 255, 255, 128]
        },
        outlineColor: {
          rgba: [255, 0, 0, 128]
        },
        outlineWidth: 3,
        pixelSize: 15
      }
    }
  ];
  // 加载czml数据
  let promiseData = Cesium.CzmlDataSource.load(czml);
  promiseData.then((dataSource) => {
    cesiumStore.$state.loadDataViewer.dataSources.add(dataSource);
    // viewer.flyTo(dataSource);
  });
}
nextTick(() => {});
onMounted(async () => {
  await nextTick();
});
</script>

<style lang="scss" scoped>
.load-GeoJson {
  padding: 20px;
  position: absolute;
  z-index: 100;

  .container {
    .el-select {
      width: 200px;
    }
  }
}
</style>
