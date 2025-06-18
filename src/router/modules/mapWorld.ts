interface RouterObject {
  [key: string]: any;
}
const worldData = () => import('@/layout/worldData/index.vue');
const mapWorldRoute:Array<RouterObject> = [
  //地图世界
   {
    path: "/worldData",
    name: "worldData",
    component: worldData,
    //component:"Layout",
    redirect: "/worldData/openLayers",
    show: true,
    meta: {
      title: "home",
      description: "数据世界"
    },
    children: [
      //openLayers地图
      {
        path: "/worldData/openLayers",
        name: "openLayers",
        //component: "worldData/openLayers/index",
        component: () => import('@/views/worldData/openLayers/index.vue'),
        meta: {
          title: "openLayers",
          description: "openLayers地图",
          icon: "openlayers"
        },
        children: [
          //基础控件
          {
            path: "/worldData/openLayers/baseMap",
            name: "baseMap",
            // component: "worldData/openLayers/baseMap/baseMap",
            component: () => import('@/views/worldData/openLayers/baseMap/baseMap.vue'),
            meta: {
              title: "baseMap",
              description: "基础控件",
              icon: "base-map"
            }
          },
          //图层类型
          {
            path: "/worldData/openLayers/layerType/heatMap",
            name: "layerType",
            //component: "worldData/openLayers/layerType/index",
            component: () => import('@/views/worldData/openLayers/layerType/index.vue'),
            meta: {
              title: "layerType",
              description: "图层类型",
              icon: "layer-type"
            },
            children: [
              //热力图层
              {
                path: "/worldData/openLayers/layerType/components/HeatMap",
                name: "heatMap",
                //component: "worldData/openLayers/layerType/components/HeatMap",
                component: () => import('@/views/worldData/openLayers/layerType/components/HeatMap.vue'),
                meta: {
                  title: "heatMap",
                  description: "热力图层",
                  icon: "hot-map"
                }
              },
              //矢量图层
              {
                path: "/worldData/openLayers/layerType/components/VectorMap",
                name: "vectorMap",
                //component: "worldData/openLayers/layerType/components/VectorMap",
                component: () => import('@/views/worldData/openLayers/layerType/components/VectorMap.vue'),
                meta: {
                  title: "vectorMap",
                  description: "矢量图层",
                  icon: "vector-map"
                }
              },
              //切片图层
              {
                path: "/worldData/openLayers/layerType/components/SliceMap",
                name: "sliceMap",
                //component: "worldData/openLayers/layerType/components/SliceMap",
                component: () => import('@/views/worldData/openLayers/layerType/components/SliceMap.vue'),
                meta: {
                  title: "sliceMap",
                  description: "切片图层",
                  icon: "slice-map"
                }
              }
            ]
          },
          //标注
          {
            path: "/worldData/openLayers/basicOperation",
            name: "marking",
            //component: "worldData/openLayers/basicOperations/marking",
            component: () => import('@/views/worldData/openLayers/basicOperations/marking.vue'),
            meta: {
              title: "marking",
              description: "标注",
              icon: "openlayers"
            }
          },
          //测试
          {
            path: "/worldData/openLayers/components/ceshi",
            name: "ceshi",
            //component: "worldData/openLayers/components/ceshi",
            component: () => import('@/views/worldData/openLayers/components/ceshi.vue'),
            meta: {
              title: "openLayers",
              description: "测试",
              icon: "openlayers"
            }
          }
        ]
      },
      //3D地图
      {
        path: "/worldData/cesium",
        name: "cesium",
        //component: "worldData/cesium/index",
        component: () => import('@/views/worldData/cesium/index.vue'),
        meta: {
          title: "cesium",
          description: "3D地图",
          icon: "cesium"
        },
        children: [
          //基础地图
          {
            path: "/worldData/cesium/baseCesium",
            name: "baseCesium",
            //component: "worldData/cesium/components/baseCesium",
            component: () => import('@/views/worldData/cesium/components/baseCesium.vue'),
            meta: {
              title: "baseCesium",
              description: "基础地图",
              icon: "cesium"
            }
          },
          //相机
          {
            path: "/worldData/cesium/camera",
            name: "camera",
            //component: "worldData/cesium/camera/index",
            component: () => import('@/views/worldData/cesium/camera/index.vue'),
            meta: {
              title: "camera",
              description: "相机操作",
              icon: "camera"
            },
            children: [
              //飞行动作
              {
                path: "/worldData/cesium/camera/fly",
                name: "cameraFly",
                //component: "worldData/cesium/camera/components/cameraFly",
                component: () => import('@/views/worldData/cesium/camera/components/cameraFly.vue'),
                meta: {
                  title: "cameraFly",
                  description: "飞行动作",
                  icon: "fly"
                }
              },
              //移动动作
              {
                path: "/worldData/cesium/camera/move",
                name: "cameraMove",
                //component: "worldData/cesium/camera/components/cameraMove",
                component: () => import('@/views/worldData/cesium/camera/components/cameraMove.vue'),
                meta: {
                  title: "cameraMove",
                  description: "移动动作",
                  icon: "move"
                }
              }
            ]
          },
          //实体相关
          {
            path: "/worldData/cesium/entities",
            name: "entities",
            //component: "worldData/cesium/entities/index",
            component: () => import('@/views/worldData/cesium/entities/index.vue'),
            meta: {
              title: "entities",
              description: "实体相关",
              icon: "entities"
            },
            children: [
              //飞机模型
              {
                path: "/worldData/cesium/entities/airModel",
                name: "airModel",
                //component: "worldData/cesium/entities/components/airModel",
                component: () => import('@/views/worldData/cesium/entities/components/airModel.vue'),
                meta: {
                  title: "airModel",
                  description: "飞机模型",
                  icon: "air"
                }
              },
              //扫描
              {
                path: "/worldData/cesium/entities/scan",
                name: "scan",
                //component: "worldData/cesium/entities/components/scan",
                component: () => import('@/views/worldData/cesium/entities/components/scan.vue'),
                meta: {
                  title: "scan",
                  description: "扫描",
                  icon: "scan"
                }
              }
            ]
          },
          //粒子特效
          {
            path: "/worldData/cesium/particleEffect",
            name: "particleEffect",
            //component: "worldData/cesium/particleEffects/index",
            component: () => import('@/views/worldData/cesium/particleEffects/index.vue'),
            meta: {
              title: "particleEffect",
              description: "粒子特效",
              icon: "particle-effects"
            },
            children: [
              //雪花
              {
                path: "/worldData/cesium/particleEffect/snow",
                name: "snow",
                //component: "worldData/cesium/particleEffects/components/snow",
                component: () => import('@/views/worldData/cesium/particleEffects/components/snow.vue'),
                meta: {
                  title: "snow",
                  description: "雪花",
                  icon: "snow"
                }
              },
              //雨水
              {
                path: "/worldData/cesium/particleEffect/rain",
                name: "rain",
                //component: "worldData/cesium/particleEffects/components/rain",
                component: () => import('@/views/worldData/cesium/particleEffects/components/rain.vue'),
                meta: {
                  title: "rain",
                  description: "雨水",
                  icon: "rain"
                }
              }
            ]
          },
          //数据加载
          {
            path: "/worldData/cesium/loadData",
            name: "loadData",
            //component: "worldData/cesium/loadData/index",
            component: () => import('@/views/worldData/cesium/loadData/index.vue'),
            meta: {
              title: "loadData",
              description: "数据加载",
              icon: "load"
            },
            children: [
              //JSON数据
              {
                path: "/worldData/cesium/loadData/loadGeoJSON",
                name: "loadGeoJSON",
                //component: "worldData/cesium/loadData/components/loadGeoJSON",
                component: () => import('@/views/worldData/cesium/loadData/components/loadGeoJSON.vue'),
                meta: {
                  title: "loadGeoJSON",
                  description: "JSON数据",
                  icon: "geojson"
                }
              },
              //飞机轨迹
              {
                path: "/worldData/cesium/loadData/flightTrajectory",
                name: "flightTrajectory",
                //component: "worldData/cesium/loadData/components/flightTrajectory",
                component: () => import('@/views/worldData/cesium/loadData/components/flightTrajectory.vue'),
                meta: {
                  title: "flightTrajectory",
                  description: "飞机轨迹",
                  icon: "flightTrajectory"
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