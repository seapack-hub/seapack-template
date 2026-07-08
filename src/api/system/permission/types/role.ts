/**
 * 角色管理 - 类型定义
 */

/** 角色实体 */
export interface Role {
  id?: number
  /** 角色名称 */
  roleName: string
  /** 角色编码 */
  roleCode: string
  /** 角色描述 */
  description?: string
  /** 状态（1正常 0停用） */
  status?: number
  createTime?: string
}

/** 角色分页查询参数 */
export interface RoleQuery {
  pageNum: number
  pageSize: number
  /** 角色名称模糊搜索 */
  roleName?: string
  /** 状态筛选（1正常 0停用） */
  status?: number
}
