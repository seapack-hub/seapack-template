import { RouterView, type RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};
const worldDataLayout = () => import('@/layout/worldData/index.vue');

const gis3dRoute: Array<RouterObject> = [
  {
    path: '/gis3d',
    name: 'gis3d',
    component: worldDataLayout,
    redirect: { name: 'baseCesium' },
    meta: {
      title: 'gis3d',
      description: '三维GIS',
      icon: 'three-d-layers',
      permKey: 'gis3d',
    },
    children: [
      {
        path: 'baseCesium',
        name: 'baseCesium',
        component: () => import('@/views/gis3d/cesium/components/baseCesium.vue'),
        meta: {
          title: 'baseCesium',
          description: '3D基础',
          icon: 'cesium',
          permKey: 'baseCesium',
        }
      },
      {
        path: 'camera',
        name: 'camera',
        component: RouterView,
        redirect: { name: 'cameraFly' },
        meta: {
          title: 'camera',
          description: '相机操作',
          icon: 'camera',
          permKey: 'camera',
        },
        children: [
          {
            path: 'fly',
            name: 'cameraFly',
            component: () => import('@/views/gis3d/cesium/camera/components/cameraFly.vue'),
            meta: {
              title: 'cameraFly',
              description: '飞行动作',
              icon: 'fly',
              permKey: 'cameraFly',
            }
          },
          {
            path: 'move',
            name: 'cameraMove',
            component: () => import('@/views/gis3d/cesium/camera/components/cameraMove.vue'),
            meta: {
              title: 'cameraMove',
              description: '移动动作',
              icon: 'move',
              permKey: 'cameraMove',
            }
          }
        ]
      },
      {
        path: 'entities',
        name: 'entities',
        component: RouterView,
        redirect: { name: 'airModel' },
        meta: {
          title: 'entities',
          description: '实体相关',
          icon: 'entities',
          permKey: 'entities',
        },
        children: [
          {
            path: 'airModel',
            name: 'airModel',
            component: () => import('@/views/gis3d/cesium/entities/components/airModel.vue'),
            meta: {
              title: 'airModel',
              description: '飞机模型',
              icon: 'air',
              permKey: 'airModel',
            }
          },
          {
            path: 'scan',
            name: 'scan',
            component: () => import('@/views/gis3d/cesium/entities/components/scan.vue'),
            meta: {
              title: 'scan',
              description: '扫描',
              icon: 'scan',
              permKey: 'scan',
            }
          }
        ]
      },
      {
        path: 'particleEffect',
        name: 'particleEffect',
        component: RouterView,
        redirect: { name: 'snow' },
        meta: {
          title: 'particleEffect',
          description: '粒子特效',
          icon: 'particle-effects',
          permKey: 'particleEffect',
        },
        children: [
          {
            path: 'snow',
            name: 'snow',
            component: () => import('@/views/gis3d/cesium/particleEffects/components/snow.vue'),
            meta: {
              title: 'snow',
              description: '雪花',
              icon: 'snow',
              permKey: 'snow',
            }
          },
          {
            path: 'rain',
            name: 'rain',
            component: () => import('@/views/gis3d/cesium/particleEffects/components/rain.vue'),
            meta: {
              title: 'rain',
              description: '雨水',
              icon: 'rain',
              permKey: 'rain',
            }
          }
        ]
      },
      {
        path: 'loadData',
        name: 'loadData',
        component: RouterView,
        redirect: { name: 'loadGeoJSON' },
        meta: {
          title: 'loadData',
          description: '数据加载',
          icon: 'load',
          permKey: 'loadData',
        },
        children: [
          {
            path: 'loadGeoJSON',
            name: 'loadGeoJSON',
            component: () => import('@/views/gis3d/cesium/loadData/components/loadGeoJSON.vue'),
            meta: {
              title: 'loadGeoJSON',
              description: 'JSON数据',
              icon: 'geojson',
              permKey: 'loadGeoJSON',
            }
          },
          {
            path: 'flightTrajectory',
            name: 'flightTrajectory',
            component: () => import('@/views/gis3d/cesium/loadData/components/flightTrajectory.vue'),
            meta: {
              title: 'flightTrajectory',
              description: '飞机轨迹',
              icon: 'flight-trajectory',
              permKey: 'flightTrajectory',
            }
          }
        ]
      }
    ]
  }
];

export default gis3dRoute;
