/**
 * 部门管理 - 类型定义
 */

/** 部门实体 */
export interface DeptVO {
  /** 部门 ID */
  deptId?: number
  /** 部门名称 */
  deptName?: string
  /** 父部门 ID */
  parentDeptId?: number | null
  /** 部门层级 */
  deptLevel?: string
  /** 部门路径 */
  deptPath?: string
  /** 排序号 */
  seq?: string
  /** 创建时间 */
  createTime?: string
  /** 修改时间 */
  updateTime?: string
  /** 子部门列表 */
  children?: DeptVO[]
}

/** 部门表单 */
export interface DeptForm {
  deptId?: number
  deptName: string
  parentDeptId?: number | null
  deptLevel: string
  seq?: string
}

/** 部门分页查询参数 */
export interface DeptPageQuery extends PageQuery {
  keyword?: string
  deptLevel?: string
  parentDeptId?: number
}
