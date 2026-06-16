import { request } from '@/utils/axios'

const BASE_URL = '/api/sys/permissions'

/** 权限/菜单节点实体（对应 sys_permission） */
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

export const PermissionAPI = {
  /** 获取权限树（GET /sys/permissions/tree，后端将扁平数据组装为嵌套树形JSON） */
  getTree() {
    return request<any, PermissionTree[]>({ url: `${BASE_URL}/tree`, method: 'get' })
  },
  /** 新增权限节点（POST /sys/permissions，需 parentId 确定层级） */
  insert(data: Partial<Permission>) {
    return request<any, any>({ url: BASE_URL, method: 'post', data })
  },
  /** 编辑权限节点（PUT /sys/permissions/{id}） */
  update(id: number, data: Partial<Permission>) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'put', data })
  },
  /** 删除权限节点（DELETE /sys/permissions/{id}，递归删子节点+清理关联） */
  delete(id: number) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'delete' })
  },
}
