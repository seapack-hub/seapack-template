/**
 * 用户管理 - 类型定义
 */

/** 用户对象 */
export interface User {
  id: number
  userName?: string
  email?: string
  mobile?: string
  nickName?: string
  gender?: number
  status?: number
  deptId?: string
  deptName?: string
  createTime?: Date
  [key: string]: any
}

/** 用户分页查询参数 */
export interface UserPageQuery extends PageQuery {
  keywords?: string
  status?: string
  deptId?: number
  startTime?: string
  endTime?: string
}
