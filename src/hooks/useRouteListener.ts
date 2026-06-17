/**
 * useRouteListener —— 路由变化监听器
 *
 * 使用发布订阅（mitt）模式管理路由变化事件，
 * 避免每个组件单独通过 watch $route 监听造成的性能浪费。
 *
 * 工作流程：
 *   1. router.afterEach 中调用 setRouteChange(to) 发布路由变化事件
 *   2. 组件内通过 useRouteListener().listenerRouteChange(callback) 订阅
 *   3. 组件销毁时自动取消订阅，防止内存泄漏
 */
import { onBeforeUnmount } from 'vue';
import mitt, { type Handler } from 'mitt';
import { type RouteLocationNormalized } from 'vue-router';

/** 路由变化回调函数的类型签名 */
type Callback = (route: RouteLocationNormalized) => void;

// 创建 mitt 事件总线实例，用于跨组件/跨模块的事件通信
const emitter = mitt();

// 唯一事件键，防止与其他 mitt 事件冲突
const key = Symbol('ROUTE_CHANGE');

// 缓存最近一次的路由对象，供 immediate 模式使用
let latestRoute: RouteLocationNormalized;

/**
 * 发布路由变化事件
 * 由 router.afterEach 守卫在每次路由跳转完成后调用
 *
 * @param to 目标路由对象
 */
export const setRouteChange = (to: RouteLocationNormalized) => {
  // 触发路由变化事件，通知所有订阅者
  emitter.emit(key, to);
  // 缓存最新的路由信息，供新订阅者 immediate 时使用
  latestRoute = to;
};

/**
 * useRouteListener —— 在组件中订阅路由变化
 *
 * 在组件 setup 中调用，返回 listenerRouteChange 和 removeRouteListener 两个方法。
 * 组件销毁时会自动清理所有订阅，无需手动处理。
 *
 * @returns { listenerRouteChange, removeRouteListener }
 */
export function useRouteListener() {
  // 存储当前组件注册的所有回调函数，便于销毁时统一清理
  const callBackList: Callback[] = [];

  /**
   * 注册路由变化监听
   *
   * @param callback  路由变化时执行的回调函数，接收当前路由对象作为参数
   * @param immediate 是否立即执行一次回调（使用 latestRoute 缓存）
   *                  适用于需要在组件初始化时获取当前路由的场景
   */
  const listenerRouteChange = (callback: Callback, immediate = false) => {
    // 将回调加入列表，用于组件销毁时清理
    callBackList.push(callback);
    // 通过 mitt 订阅路由变化事件
    emitter.on(key, callback as Handler);
    // 如果 immediate 为 true 且缓存中有上次的路由信息，立即执行一次回调
    if (immediate && latestRoute) {
      callback(latestRoute);
    }
  };

  /**
   * 移除指定的路由变化监听器
   *
   * @param callback 要移除的回调函数（必须与注册时是同一个引用）
   */
  const removeRouteListener = (callback: Callback) => {
    emitter.off(key, callback as Handler);
  };

  /**
   * 组件销毁前自动清理所有已注册的监听器
   * 防止组件卸载后回调仍被触发导致的内存泄漏或异常
   */
  onBeforeUnmount(() => {
    for (let i = 0; i < callBackList.length; i++) {
      removeRouteListener(callBackList[i]);
    }
  });

  return { listenerRouteChange, removeRouteListener };
}
