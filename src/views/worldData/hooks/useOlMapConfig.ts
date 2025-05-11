/** 设置地图的基础配置 */
// 引入图层
import TileLayer from 'ol/layer/Tile';
//引入 XYZ方法 加载瓦片地图资源数据
import XYZ from 'ol/source/XYZ';

//0表示部署的离线瓦片地图，1表示OSM,2表示使用Arcgis在线午夜蓝地图服务
//let maptype: number = 2;

/**
 * 可暂时使用的地图地址
 * http://t4.tianditu.gov.cn/DataServer?tk=5730f1a9e7de7c8f39c7e45725b863da&T=vec_c&x={x}&y={y}&l={z}
 * https://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}
 * https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}
 * http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}
 * http://t${Math.floor(Math.random()*7 + 1)}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=5730f1a9e7de7c8f39c7e45725b863da
 * http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}
 */

export function useOlMapConfig() {
  const tileMap = new TileLayer({
    source: new XYZ({
      url: `http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}`
    })
  });

  //中心点经度和纬度
  const x = 108.4,
    y = 35.75;
  //缩放级别
  const zoom: number = 12;

  return { x, y, zoom, tileMap };
}
