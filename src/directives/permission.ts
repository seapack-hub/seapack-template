/**
 * v-permission —— 前端按钮级权限指令
 *
 * 基于 userStore.perms（后端 /auth/user-info 返回的扁平权限标识符集合）
 * 实现声明式的按钮/DOM 元素显隐控制。
 *
 * 使用方式：
 *   <!-- 单个权限标识：用户必须拥有 'user:add' 才能看到此按钮 -->
 *   <el-button v-permission="'user:add'">新增用户</el-button>
 *
 *   <!-- 多个权限标识（OR 逻辑）：拥有任意一个即可 -->
 *   <el-button v-permission="['user:add', 'user:edit']">批量操作</el-button>
 *
 *   <!-- 不传值：始终显示（等价于无权限要求） -->
 *   <el-button>公开功能</el-button>
 *
 * 与 usePermission hook 的区别：
 *   - v-permission 指令：模板声明式，自动控制 DOM 显隐
 *   - usePermission hook：脚本式，用于 setup 中的逻辑分支判断
 */

import type { App } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * 核心权限校验函数
 *
 * @param perm 权限标识（字符串）或权限标识数组
 * @returns true=有权限 / false=无权限
 *
 * 逻辑说明：
 *   - 不传参（undefined）→ 返回 true，视为无权限要求
 *   - 字符串 → 精确匹配 userStore.perms 中是否包含该值
 *   - 数组 → 只要数组中任意一个值存在于 perms 中即通过（OR 逻辑）
 */
function checkPermission(perm?: string | string[]): boolean {
  // 从 Pinia 中获取当前用户的权限标识集合
  const userStore = useUserStore()
  // 兜底为空数组，避免调用 .includes 时报错
  const perms = userStore.perms ?? []

  // 未指定权限标识时默认放行
  if (!perm) return true

  // 字符串模式：精确查找
  if (typeof perm === 'string') return perms.includes(perm)

  // 数组模式：任意一个匹配即可
  if (Array.isArray(perm)) return perm.some(p => perms.includes(p))

  // 兜底：参数类型不匹配时视为无权限
  return false
}

/**
 * 全局注册 v-permission 指令
 *
 * 在 src/main.ts 中调用：
 *   import { setupPermissionDirective } from '@/directives/permission'
 *   setupPermissionDirective(app)
 *
 * @param app Vue 应用实例
 */
export function setupPermissionDirective(app: App) {
  app.directive('permission', {
    /**
     * mounted：元素首次挂载到 DOM 时触发
     * 如果用户无权限，直接将该元素从父节点移除
     */
    mounted(el, binding) {
      if (!checkPermission(binding.value)) {
        // binding.value 即 v-permission="" 中传入的值
        // 从父节点移除当前元素（而非隐藏），使审查元素也无法看到
        el.parentNode?.removeChild(el)
      }
    },

    /**
     * updated：指令所在组件的 VNode 更新时触发
     * 处理权限动态变化（如用户角色切换后重新渲染）
     */
    updated(el, binding) {
      if (!checkPermission(binding.value)) {
        // 在组件更新后再次检查，防止通过数据变更绕过权限
        el.parentNode?.removeChild(el)
      }
    },
  })
}

/**
 * 导出 checkPermission 供 usePermission hook 等脚本场景复用
 * 避免指令和组合式函数中重复实现同一套校验逻辑
 */
export { checkPermission }
