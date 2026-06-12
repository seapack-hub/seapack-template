import { request } from '@/utils/axios.ts'

/** 行业分类节点 */
export interface IndustrySector {
  id: number
  code: string
  label: string
  parentId?: number | null
  parentLabel?: string
  nodeLevel: number // 1-一级行业 2-二级行业
  sortOrder: number
  createdAt?: string
  updatedAt?: string
  children?: IndustrySector[]
}

/** 分页查询参数 */
export interface IndustrySectorQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  nodeLevel?: number
  parentId?: number
}

/** 行业分类 API（后端路径 /industrySector） */
export const IndustrySectorAPI = {
  /** 分页查询行业节点列表（支持筛选） */
  getList(params?: IndustrySectorQuery) {
    return request<any, PageResult<IndustrySector[]>>({
      url: '/api/industrySector/list', method: 'get', params,
    })
  },
  /** 获取行业树形结构 */
  getTree() {
    return request<any, IndustrySector[]>({
      url: '/api/industrySector/tree', method: 'get',
    })
  },
  /** 根据ID查询节点详情 */
  getDetail(id: number) {
    return request<any, IndustrySector>({
      url: `/api/industrySector/${id}`, method: 'get',
    })
  },
  /** 查询指定父节点下的直接子节点 */
  getChildren(parentId: number) {
    return request<any, IndustrySector[]>({
      url: `/api/industrySector/children/${parentId}`, method: 'get',
    })
  },
  /** 新增行业节点（id 自增，无需传入） */
  insert(data: Partial<IndustrySector>) {
    const { id, ...rest } = data as any
    return request<any, any>({ url: '/api/industrySector/insert', method: 'post', data: rest })
  },
  /** 更新行业节点 */
  update(data: IndustrySector) {
    return request<any, any>({ url: '/api/industrySector/update', method: 'post', data })
  },
  /** 删除行业节点（有子节点时不允许删除） */
  delete(id: number) {
    return request<any, any>({ url: `/api/industrySector/delete/${id}`, method: 'delete' })
  },
}
