/**
 * bus —— 全局事件总线
 *
 * 基于 mitt 库创建的轻量级事件总线，用于跨组件/跨模块的通信。
 * 通过 TypeScript 类型约束事件名称和载荷，提供类型安全的事件发布订阅。
 *
 * 使用方式：
 *   import bus from '@/utils/bus'
 *
 *   组件 A：发布事件
 *   bus.emit('update-namespace', 'new-namespace')
 *
 *   组件 B：订阅事件
 *   bus.on('update-namespace', (name) => { console.log(name) })
 *
 *   组件销毁时取消订阅
 *   bus.off('update-namespace', handler)
 */

import mitt from 'mitt';

/**
 * 事件类型映射
 *
 * 键名为事件名称，键值为事件载荷的类型。
 * 在此处注册新的事件类型即可获得完整的 TS 类型提示。
 */
type Events = {
  // 更新命名空间事件，载荷为字符串类型的新命名空间值
  'update-namespace': string;
};

// 创建带类型约束的 mitt 事件总线实例
const emitter = mitt<Events>();

export default emitter;
