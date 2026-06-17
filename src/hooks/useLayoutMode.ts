import { computed } from 'vue';
import { useSettingsStore } from '@/store/modules/settings';
import { LayoutModeEnum } from '@/constants/app-key';

/**
 * useLayoutMode —— 布局模式状态判断与切换
 *
 * 提供三个计算属性分别判断当前是否为某种布局模式，
 * 以及一个设置方法用于动态切换布局。
 *
 * 布局模式说明：
 *   - Left：   左侧菜单 + 顶部通栏
 *   - Top：    顶部菜单 + 页面主体
 *   - LeftTop：左侧菜单 + 顶部菜单（混合布局）
 */

// 获取 settings store 实例（模块顶层引用，无需在函数内重复获取）
const settingsStore = useSettingsStore();

// 当前是否为左侧菜单布局
const isLeft = computed(() => settingsStore.layoutMode === LayoutModeEnum.Left);

// 当前是否为顶部菜单布局
const isTop = computed(() => settingsStore.layoutMode === LayoutModeEnum.Top);

// 当前是否为混合布局（左侧 + 顶部）
const isLeftTop = computed(() => settingsStore.layoutMode === LayoutModeEnum.LeftTop);

/**
 * 切换布局模式
 * @param mode 目标布局模式（LayoutModeEnum.Left / Top / LeftTop）
 */
const setLayoutMode = (mode: LayoutModeEnum) => {
  settingsStore.layoutMode = mode;
};

/**
 * useLayoutMode 组合式函数
 * @returns { isLeft, isTop, isLeftTop, setLayoutMode }
 */
export function useLayoutMode() {
  return { isLeft, isTop, isLeftTop, setLayoutMode };
}
