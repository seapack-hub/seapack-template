// 补充导入缺失的 Vue Router 类型
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { RouterPlugin, RouterPluginContext } from './types'

class RouterPluginManager {
  
  private plugins: RouterPlugin[] = []

  /**
   * 注册路由插件，并按优先级自动排序
   * @param plugin 路由插件实例
   */
  register(plugin: RouterPlugin) {
    this.plugins.push(plugin)
    // 按优先级升序排序，数字越小优先级越高，未设置优先级的默认为 99
    this.plugins.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
  }

  /**
   * 统一执行前置守卫逻辑
   * @param context 包含 to, from, next 的上下文对象
   */
  async runBeforeEach(context: RouterPluginContext) {
    for (const plugin of this.plugins) {
      if (plugin.beforeEach) {
        const result = await plugin.beforeEach(context)

        // 只要有任何插件返回了拦截指令，立即停止后续插件执行并返回给 Router
        if (result !== undefined) {
          // eslint-disable-next-line no-console
          console.log(`[Router Plugin: ${plugin.name}] 拦截导航，返回值:`, result)
          return result
        }
      }
    }
    // 所有插件都未拦截，返回 undefined 放行
    return undefined
  }

  /**
   * 统一执行后置守卫逻辑
   * @param to 目标路由
   * @param from 来源路由
   */
  runAfterEach(to: RouteLocationNormalizedLoaded, from: RouteLocationNormalizedLoaded) {
    for (const plugin of this.plugins) {
      // 可选链调用，防止插件没有定义 afterEach 方法
      plugin.afterEach?.(to, from)
    }
  }
}

// 导出一个单例对象，确保全局使用的是同一个管理器实例
export const routerPluginManager = new RouterPluginManager()