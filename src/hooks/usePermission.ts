/**
 * usePermission —— 脚本级权限/角色判断组合式函数
 *
 * 基于 userStore 中的 perms（权限标识符集合）和 roles（角色编码列表），
 * 在 setup 中提供细粒度的权限判断能力，适用于：
 *   - 动态控制组件的显隐（与 v-permission 指令互补）
 *   - 控制逻辑分支（如按钮点击前先校验权限）
 *   - 角色级别的功能开关
 *
 * 数据来源：登录成功后由 SliderDialog 调用 AuthAPI.getUserInfo() 写入 userStore
 */

import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  // 获取用户状态 store 实例，从中读取 perms 和 roles
  const userStore = useUserStore()

  /**
   * 校验当前用户是否拥有某个（或某组）权限标识
   *
   * 逻辑：
   *   - 不传参 → 默认有权限（true）
   *   - 传入字符串 → 单权限校验，perms 中包含即通过
   *   - 传入字符串数组 → 多权限校验，满足任意一个即通过（OR 逻辑）
   *
   * @param perm 权限标识（字符串）或权限标识数组
   * @returns 有权限返回 true，否则 false
   */
  function hasPermission(perm?: string | string[]): boolean {
    // 从 userStore 中读取当前用户的权限标识集合，默认空数组避免解构报错
    const perms = userStore.perms ?? []
    // 未传入 perm 时视为不需要权限，直接放行
    if (!perm) return true
    // 字符串模式：精确匹配
    if (typeof perm === 'string') return perms.includes(perm)
    // 数组模式：存在任意一个匹配即可（OR 逻辑）
    if (Array.isArray(perm)) return perm.some(p => perms.includes(p))
    // 兜底：类型不匹配时视为无权限
    return false
  }

  /**
   * 校验当前用户是否拥有某个（或某组）角色编码
   *
   * @param role 角色编码（字符串）或角色编码数组
   * @returns 拥有角色返回 true，否则 false
   */
  function hasRole(role: string | string[]): boolean {
    // 从 userStore 中读取当前用户的角色列表
    const roles = userStore.roles ?? []
    // 字符串模式：精确匹配角色编码
    if (typeof role === 'string') return roles.includes(role)
    // 数组模式：存在任意一个角色即通过（OR 逻辑）
    if (Array.isArray(role)) return role.some(r => roles.includes(r))
    return false
  }

  /**
   * 校验当前用户是否同时拥有所有指定的权限标识
   *
   * 与 hasPermission 的区别：
   *   hasPermission 是 OR 逻辑（有一个就行）
   *   hasAllPerms   是 AND 逻辑（必须全部拥有）
   *
   * @param perms 权限标识数组
   * @returns 全部拥有返回 true，缺失任一返回 false
   */
  function hasAllPerms(perms: string[]): boolean {
    const userPerms = userStore.perms ?? []
    // 使用 every 确保数组中的每一个 permKey 都在用户权限集合中
    return perms.every(p => userPerms.includes(p))
  }

  // 导出三个判断方法
  return { hasPermission, hasRole, hasAllPerms }
}
