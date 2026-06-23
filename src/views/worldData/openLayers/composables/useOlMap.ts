import { onUnmounted, shallowRef } from 'vue';
import { Map, View } from 'ol';
import type Layer from 'ol/layer/Layer';
import type Control from 'ol/control/Control';

export interface UseOlMapOptions {
  /** DOM 元素 id 或 target 元素 */
  target: string | HTMLElement;
  /** 瓦片图层列表 */
  layers?: Layer[];
  /** 视图中心点（EPSG:4326） */
  center?: [number, number];
  /** 缩放级别 */
  zoom?: number;
  /** 额外控件 */
  controls?: Control[];
}

/**
 * OpenLayers 地图生命周期管理
 *
 * 提供创建、销毁地图的标准流程，组件卸载时自动清理避免内存泄漏。
 */
export function useOlMap(options: UseOlMapOptions) {
  const { target, layers = [], center = [108.4, 35.75], zoom = 5, controls } = options;

  const map = shallowRef<Map | null>(null);

  function initMap() {
    const view = new View({
      projection: 'EPSG:4326',
      center,
      zoom,
    });

    map.value = new Map({
      target,
      layers,
      view,
      controls,
    });
  }

  function destroyMap() {
    if (map.value) {
      map.value.setTarget(undefined);
      map.value = null;
    }
  }

  onUnmounted(destroyMap);

  return { map, initMap, destroyMap };
}
