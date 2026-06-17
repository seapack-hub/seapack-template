/**
 * useSystemTypeMode —— 系统类型模式状态判断与切换
 *
 * 提供四个计算属性分别判断当前系统是否为某种类型，
 * 以及一个设置方法用于动态切换系统类型。
 *
 * 系统类型说明：
 *   - ManageSystem：          后台管理系统（默认）
 *   - BlogSystem：            博客系统
 *   - TwoDimensionalMapSystem：  二维地图系统（OpenLayers）
 *   - ThreeDimensionalMapSystem：三维地图系统（Cesium）
 *
 * 不同类型的系统会切换不同的 UI 布局和主题风格。
 */

import { computed } from 'vue';
import { useSettingsStore } from '@/store/modules/settings';
import { SystemTypeEnum } from '@/constants/app-key';

// 获取 settings store 实例（模块顶层引用，避免在函数内重复获取）
const settingStore = useSettingsStore();

// 当前是否为后台管理系统
const isManageSystem = computed(() => settingStore.systemType === SystemTypeEnum.ManageSystem);

// 当前是否为博客系统
const isBlogSystem = computed(() => settingStore.systemType === SystemTypeEnum.BlogSystem);

// 当前是否为二维地图系统
const isTwoDimensionalMapSystem = computed(
  () => settingStore.systemType === SystemTypeEnum.TwoDimensionalMapSystem
);

// 当前是否为三维地图系统
const isThreeDimensionalMapSystem = computed(
  () => settingStore.systemType === SystemTypeEnum.ThreeDimensionalMapSystem
);

/**
 * 切换系统类型
 * @param type 目标系统类型（SystemTypeEnum 枚举值）
 */
const setSystemType = (type: SystemTypeEnum) => {
  settingStore.systemType = type;
};

/**
 * useSystemTypeMode 组合式函数
 * @returns { isManageSystem, isBlogSystem, isTwoDimensionalMapSystem, isThreeDimensionalMapSystem, setSystemType }
 */
export function useSystemTypeMode() {
  return {
    isManageSystem,
    isBlogSystem,
    isTwoDimensionalMapSystem,
    isThreeDimensionalMapSystem,
    setSystemType,
  };
}
