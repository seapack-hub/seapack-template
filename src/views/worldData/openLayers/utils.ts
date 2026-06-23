import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

/** 常用瓦片地图 URL 集合 */
export const TILE_URLS = {
  /** 高德矢量图 */
  GAODE_VEC: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
  /** 高德影像图 */
  GAODE_IMG: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
  /** 天地图矢量 */
  TIANDITU_VEC: 'http://t4.tianditu.com/DataServer?T=vec_w&tk=d845a99528ce08b31543c602207e873f&x={x}&y={y}&l={z}',
  /** 天地图标注 */
  TIANDITU_CVA: 'http://t4.tianditu.com/DataServer?T=cva_w&tk=d845a99528ce08b31543c602207e873f&x={x}&y={y}&l={z}',
} as const;

export type TileUrlKey = keyof typeof TILE_URLS;

/** 创建瓦片图层 */
export function createTileLayer(url: string = TILE_URLS.GAODE_VEC, visible = true, opacity = 1): TileLayer<XYZ> {
  return new TileLayer({
    source: new XYZ({ url }),
    visible,
    opacity,
  });
}

/** 创建高德矢量 + 标注双图层（覆盖全国范围） */
export function createGaodeBaseLayers(): TileLayer<XYZ>[] {
  return [
    createTileLayer(TILE_URLS.GAODE_VEC),
    createTileLayer(TILE_URLS.GAODE_IMG),
  ];
}
