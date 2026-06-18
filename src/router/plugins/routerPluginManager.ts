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
        // 执行当前插件的前置守卫
        await plugin.beforeEach(context)
        
        // 💡 核心拦截机制：
        // 如果某个插件调用了 next(false) 或 next('/login') 进行了拦截或重定向，
        // 后续的插件就不应该再执行了，直接跳出循环。
        // （注：在实际工程中，通常需要重写 next 函数来捕获它的调用状态，
        // 这里是一个简化的说明，实际使用时需配合状态标志位）
      }
    }
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