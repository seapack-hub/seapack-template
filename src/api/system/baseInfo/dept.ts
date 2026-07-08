import { request } from "@/utils/axios.ts";
import type { DeptVO, DeptForm, DeptPageQuery } from "./types/dept";

export type { DeptVO, DeptForm, DeptPageQuery }

const DEPT_BASE_URL = "/api/dept";

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
