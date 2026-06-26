import { RouterView, type RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};
const worldDataLayout = () => import('@/layout/worldData/index.vue');

const gis2dRoute: Array<RouterObject> = [
  {
    path: '/gis2d',
    name: 'gis2d',
    component: worldDataLayout,
    redirect: { name: 'baseMap' },
    meta: {
      title: 'gis2d',
      description: '二维地图',
      icon: '2D-layers',
      permKey: 'gis2d',
    },
    children: [
      {
        path: 'baseMap',
        name: 'baseMap',
        component: () => import('@/views/gis2d/openLayers/baseMap/baseMap.vue'),
        meta: {
          title: 'baseMap',
          description: '基础地图',
          icon: 'base-map',
          permKey: 'baseMap',
        }
      },
      {
        path: 'openLayers',
        name: 'openLayers',
        component: RouterView,
        redirect: { name: 'layerType' },
        meta: {
          title: 'openLayers',
          description: 'openLayers地图',
          icon: 'openlayers',
          permKey: 'openLayers',
        },
        children: [
          {
            path: 'layerType',
            name: 'layerType',
            component: RouterView,
            redirect: { name: 'heatMap' },
            meta: {
              title: 'layerType',
              description: '图层类型',
              icon: 'layer-type',
              permKey: 'layerType',
            },
            children: [
              {
                path: 'heatMap',
                name: 'heatMap',
                component: () => import('@/views/gis2d/openLayers/layerType/components/HeatMap.vue'),
                meta: {
                  title: 'heatMap',
                  description: '热力图层',
                  icon: 'hot-map',
                  permKey: 'heatMap',
                }
              },
              {
                path: 'vectorMap',
                name: 'vectorMap',
                component: () => import('@/views/gis2d/openLayers/layerType/components/VectorMap.vue'),
                meta: {
                  title: 'vectorMap',
                  description: '矢量图层',
                  icon: 'vector-map',
                  permKey: 'vectorMap',
                }
              },
              {
                path: 'sliceMap',
                name: 'sliceMap',
                component: () => import('@/views/gis2d/openLayers/layerType/components/SliceMap.vue'),
                meta: {
                  title: 'sliceMap',
                  description: '切片图层',
                  icon: 'slice-map',
                  permKey: 'sliceMap',
                }
              }
            ]
          },
          {
            path: 'basicOperation',
            name: 'marking',
            component: () => import('@/views/gis2d/openLayers/basicOperations/marking.vue'),
            meta: {
              title: 'marking',
              description: '标注',
              icon: 'openlayers',
              permKey: 'marking',
            }
          },
          {
            path: 'ceshi',
            name: 'ceshi',
            component: () => import('@/views/gis2d/openLayers/components/ceshi.vue'),
            meta: {
              title: 'openLayers',
              description: '测试',
              icon: 'openlayers',
              permKey: 'ceshi',
            }
          }
        ]
      },
    ]
  }
];

export default gis2dRoute;
