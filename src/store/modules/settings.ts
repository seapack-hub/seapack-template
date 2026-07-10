import { type Ref, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { type LayoutSetting, layoutSettings } from '@/config/layouts.ts';
import { getSettingsCache, setSettingsCache } from '@/utils/cache/local-storage';

/**
 * SettingsStore 类型
 *
 * 使用映射类型将 LayoutSetting 的每个键映射为一个 Ref<T>，
 * 使得 store 的每个属性都是响应式的，且保留原始类型信息。
 *
 * 例如：LayoutSetting = { showWatermark: boolean, cacheTagsView: boolean, ... }
 *       → SettingsStore = { showWatermark: Ref<boolean>, cacheTagsView: Ref<boolean>, ... }
 */
type SettingsStore = {
  [Key in keyof LayoutSetting]: Ref<LayoutSetting[Key]>;
};

export const useSettingsStore = defineStore('settings', () => {
  // 用于存放所有响应式配置项的空对象，后续通过遍历动态填充
  const state = {} as SettingsStore;

  // 从 localStorage 恢复已持久化的设置
  const cached = getSettingsCache();

  /**
   * 遍历 layoutSettings 配置对象的每个键值对，
   * 为每个配置项创建一个独立的 ref 响应式变量，
   * 并挂载到 state 对象上，最终作为 store 的导出属性。
   *
   * 这样做的好处：
   *   - 当 config/layouts.ts 新增配置项时，这里自动生效，无需手动维护
   *   - 每个配置项各自独立响应，避免修改一个配置导致整个对象重新渲染
   */
  for (const [key, value] of Object.entries(layoutSettings)) {
    // 优先使用缓存值，否则使用默认值
    const initial = cached?.[key] ?? value;
    // 将配置项的原始值包装为 Vue ref，使其具备响应式能力
    const refValue = ref(initial);
    // state 的类型是 SettingsStore（映射类型），
    // 动态索引赋值时 TypeScript 无法推断具体类型，故使用 @ts-ignore 绕过
    // @ts-expect-error dynamic index on mapped type SettingsStore
    state[key] = refValue;

    /**
     * 监听每个配置项的变化
     * 当配置项被修改时，自动将最新值持久化到 localStorage，
     * 实现配置的跨会话记忆功能。
     */
    watch(refValue, () => {
      const snapshot: Record<string, unknown> = {};
      for (const k of Object.keys(layoutSettings)) {
        // @ts-expect-error dynamic index on mapped type SettingsStore
        snapshot[k] = state[k]?.value;
      }
      setSettingsCache(snapshot);
    });
  }

  // 将 state 对象作为 store 的导出值
  // 外部可这样使用：settingsStore.showWatermark / settingsStore.cacheTagsView
  return state;
});
