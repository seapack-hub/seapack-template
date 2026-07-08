/**
 * 权限管理 - 类型定义
 */

/** 权限/菜单节点实体 */
export interface Permission {
  id: number
  /** 权限名称 */
  name: string
  /** 权限标识符（如 sys:user:edit） */
  permKey?: string
  /** 资源类型（1目录 2菜单 3按钮） */
  type: number
  /** 父级权限ID（0表示顶级） */
  parentId: number
  /** 前端路由路径 */
  path?: string
  /** 前端组件路径 */
  component?: string
  /** 显示排序 */
  sortOrder?: number
  /** 状态（1正常 0停用） */
  status?: number
  children?: Permission[]
}

/** 权限树节点（children 必填，用作 el-tree 数据源） */
export interface PermissionTree extends Permission {
  children: PermissionTree[]
}
