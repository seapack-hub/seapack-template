/**
 * 认证授权 - 类型定义
 */

/** 用户信息+权限响应 */
export interface UserAuthInfo {
  userId: number
  username: string
  nickname?: string
  avatar?: string
  /** 角色编码列表 */
  roles: string[]
  /** 权限标识符集合（permKey） */
  perms: string[]
}

/** 动态菜单树节点 */
export interface MenuTree {
  id: number
  name: string
  path: string
  permKey: string
  component: string
  icon?: string
  /** 节点类型（1目录 2菜单） */
  type: number
  parentId?: number | null
  sortOrder?: number
  status?: number
  children?: MenuTree[]
}
