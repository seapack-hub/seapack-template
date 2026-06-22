// 引入 Vue Router 的标准类型，用于约束路由对象的格式
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

/**
 * 路由插件的执行上下文 (Context)
 * 将原生路由守卫的三个参数封装成一个对象，方便在插件中传递和使用
 */
export interface RouterPluginContext {
  /** 即将要进入的目标路由对象 */
  to: RouteLocationNormalized

  /** 当前导航正要离开的路由对象 */
  from: RouteLocationNormalizedLoaded
}

/**
 * 自定义路由插件接口
 * 用于规范每个路由插件的结构，使其能够被统一管理和执行
 */
export interface RouterPlugin {
  /** 插件的唯一名称，用于调试或日志记录 */
  name: string
  
  /** 
   * 插件的执行优先级（可选）
   * 数字越小优先级越高，越先被执行。
   * 例如：Token校验插件(优先级1) -> 动态路由生成插件(优先级2) -> 页面标题插件(优先级3)
   */
  priority?: number 
  
  /** 
   * 全局前置守卫逻辑
   * 在路由跳转前执行，通常用于权限校验、动态路由注入等
   */
  beforeEach?:  (context: RouterPluginContext) => RouteLocationRaw | boolean | void | Promise<RouteLocationRaw | boolean | void>
  
  /** 
   * 全局后置守卫逻辑
   * 在路由跳转完成后执行，通常用于修改页面标题、记录页面访问日志等
   */
  afterEach?: (to: RouteLocationNormalizedLoaded, from: RouteLocationNormalizedLoaded) => void
}