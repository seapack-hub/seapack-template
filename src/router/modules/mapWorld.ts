import { RouterView, type RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  show?: boolean;
  children?: RouterObject[];
};
const worldData = () => import('@/layout/worldData/index.vue');
const mapWorldRoute:Array<RouterObject> = [
  //地图世界
   {
    path: "/worldData",
    name: "worldData",
    component: worldData,
    redirect: { name: 'baseMap' },
    show: true,
    meta: {
      title: "home",
      description: "数据世界",
      icon: "gis"
    },
    children: [
      {
        path: "baseMap",
        name: "baseMap",
        component: () => import('@/views/worldData/openLayers/baseMap/baseMap.vue'),
        meta: {
          title: "baseMap",
          description: "基础地图",
          icon: "base-map",
          permKey: 'world:basemap:view',
        }
      },
      //openLayers地图
      {
        path: "openLayers",
        name: "openLayers",
        component: RouterView,
        redirect: { name: 'layerType' },
        meta: {
          title: "openLayers",
          description: "openLayers地图",
          icon: "openlayers"
        },
        children: [
          //图层类型
          {
            path: "layerType",
            name: "layerType",
            component: RouterView,
            redirect: { name: 'heatMap' },
            meta: {
              title: "layerType",
              description: "图层类型",
              icon: "layer-type"
            },
            children: [
              //热力图层
              {
                path: "heatMap",
                name: "heatMap",
                component: () => import('@/views/worldData/openLayers/layerType/components/HeatMap.vue'),
                meta: {
                  title: "heatMap",
                  description: "热力图层",
                  icon: "hot-map",
                  permKey: 'world:openlayers:heatmap:view',
                }
              },
              //矢量图层
              {
                path: "vectorMap",
                name: "vectorMap",
                component: () => import('@/views/worldData/openLayers/layerType/components/VectorMap.vue'),
                meta: {
                  title: "vectorMap",
                  description: "矢量图层",
                  icon: "vector-map",
                  permKey: 'world:openlayers:vectormap:view',
                }
              },
              //切片图层
              {
                path: "sliceMap",
                name: "sliceMap",
                component: () => import('@/views/worldData/openLayers/layerType/components/SliceMap.vue'),
                meta: {
                  title: "sliceMap",
                  description: "切片图层",
                  icon: "slice-map",
                  permKey: 'world:openlayers:slicemap:view',
                }
              }
            ]
          },
          //标注
          {
            path: "basicOperation",
            name: "marking",
            component: () => import('@/views/worldData/openLayers/basicOperations/marking.vue'),
            meta: {
              title: "marking",
              description: "标注",
              icon: "openlayers",
              permKey: 'world:openlayers:marking:view',
            }
          },
          //测试
          {
            path: "ceshi",
            name: "ceshi",
            component: () => import('@/views/worldData/openLayers/components/ceshi.vue'),
            meta: {
              title: "openLayers",
              description: "测试",
              icon: "openlayers",
              permKey: 'world:openlayers:ceshi:view',
            }
          }
        ]
      },
      //3D地图
      {
        path: "cesium",
        name: "cesium",
        component: RouterView,
        redirect: { name: 'baseCesium' },
        meta: {
          title: "cesium",
          description: "3D地图",
          icon: "cesium"
        },
        children: [
          //基础地图
          {
            path: "baseCesium",
            name: "baseCesium",
            component: () => import('@/views/worldData/cesium/components/baseCesium.vue'),
            meta: {
              title: "baseCesium",
              description: "3D基础",
              icon: "cesium",
              permKey: 'world:cesium:basecesium:view',
            }
          },
          //相机
          {
            path: "camera",
            name: "camera",
            component: RouterView,
            redirect: { name: 'cameraFly' },
            meta: {
              title: "camera",
              description: "相机操作",
              icon: "camera"
            },
            children: [
              //飞行动作
              {
                path: "fly",
                name: "cameraFly",
                component: () => import('@/views/worldData/cesium/camera/components/cameraFly.vue'),
                meta: {
                  title: "cameraFly",
                  description: "飞行动作",
                  icon: "fly",
                  permKey: 'world:cesium:camerafly:view',
                }
              },
              //移动动作
              {
                path: "move",
                name: "cameraMove",
                component: () => import('@/views/worldData/cesium/camera/components/cameraMove.vue'),
                meta: {
                  title: "cameraMove",
                  description: "移动动作",
                  icon: "move",
                  permKey: 'world:cesium:cameramove:view',
                }
              }
            ]
          },
          //实体相关
          {
            path: "entities",
            name: "entities",
            component: RouterView,
            redirect: { name: 'airModel' },
            meta: {
              title: "entities",
              description: "实体相关",
              icon: "entities"
            },
            children: [
              //飞机模型
              {
                path: "airModel",
                name: "airModel",
                component: () => import('@/views/worldData/cesium/entities/components/airModel.vue'),
                meta: {
                  title: "airModel",
                  description: "飞机模型",
                  icon: "air",
                  permKey: 'world:cesium:airmodel:view',
                }
              },
              //扫描
              {
                path: "scan",
                name: "scan",
                component: () => import('@/views/worldData/cesium/entities/components/scan.vue'),
                meta: {
                  title: "scan",
                  description: "扫描",
                  icon: "scan",
                  permKey: 'world:cesium:scan:view',
                }
              }
            ]
          },
          //粒子特效
          {
            path: "particleEffect",
            name: "particleEffect",
            component: RouterView,
            redirect: { name: 'snow' },
            meta: {
              title: "particleEffect",
              description: "粒子特效",
              icon: "particle-effects"
            },
            children: [
              //雪花
              {
                path: "snow",
                name: "snow",
                component: () => import('@/views/worldData/cesium/particleEffects/components/snow.vue'),
                meta: {
                  title: "snow",
                  description: "雪花",
                  icon: "snow",
                  permKey: 'world:cesium:snow:view',
                }
              },
              //雨水
              {
                path: "rain",
                name: "rain",
                component: () => import('@/views/worldData/cesium/particleEffects/components/rain.vue'),
                meta: {
                  title: "rain",
                  description: "雨水",
                  icon: "rain",
                  permKey: 'world:cesium:rain:view',
                }
              }
            ]
          },
          //数据加载
          {
            path: "loadData",
            name: "loadData",
            component: RouterView,
            redirect: { name: 'loadGeoJSON' },
            meta: {
              title: "loadData",
              description: "数据加载",
              icon: "load"
            },
            children: [
              //JSON数据
              {
                path: "loadGeoJSON",
                name: "loadGeoJSON",
                component: () => import('@/views/worldData/cesium/loadData/components/loadGeoJSON.vue'),
                meta: {
                  title: "loadGeoJSON",
                  description: "JSON数据",
                  icon: "geojson",
                  permKey: 'world:cesium:loadgeojson:view',
                }
              },
              //飞机轨迹
              {
                path: "flightTrajectory",
                name: "flightTrajectory",
                component: () => import('@/views/worldData/cesium/loadData/components/flightTrajectory.vue'),
                meta: {
                  title: "flightTrajectory",
                  description: "飞机轨迹",
                  icon: "flightTrajectory",
                  permKey: 'world:cesium:flighttrajectory:view',
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

export default mapWorldRoute;
