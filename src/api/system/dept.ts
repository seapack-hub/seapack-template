import { request } from "@/utils/axios.ts";

const DEPT_BASE_URL = "/api/dept";

/** 部门实体，对应后端 Department */
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

export const DeptAPI = {
  /** 分页查询部门列表 */
  getPage(query: DeptPageQuery) {
    return request<any, PageResult<DeptVO[]>>({
      url: `${DEPT_BASE_URL}/page/list`,
      method: "get",
      params: query,
    })
  },

  /** 获取完整部门树 */
  getDeptTree() {
    return request<any, DeptVO[]>({ url: `${DEPT_BASE_URL}/tree`, method: "get" })
  },

  /** 获取指定部门的子树 */
  getSubTree(deptId: number) {
    return request<any, DeptVO>({ url: `${DEPT_BASE_URL}/subtree/${deptId}`, method: "get" })
  },

  /** 查询单个部门 */
  getById(deptId: number) {
    return request<any, DeptVO>({ url: `${DEPT_BASE_URL}/${deptId}`, method: "get" })
  },

  /** 新增部门 */
  insert(data: DeptForm) {
    return request<any, DeptVO>({ url: `${DEPT_BASE_URL}/insert`, method: "post", data })
  },

  /** 修改部门 */
  update(data: DeptForm) {
    return request<any, DeptVO>({ url: `${DEPT_BASE_URL}/update`, method: "put", data })
  },

  /** 删除部门 */
  delete(deptId: number) {
    return request<any, void>({ url: `${DEPT_BASE_URL}/delete/${deptId}`, method: "delete" })
  },
}
