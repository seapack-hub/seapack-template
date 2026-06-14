import { request } from '@/utils/axios.ts'

const USER_BASE_URL = '/api'

/** 系统字典 */
export interface Dict {
  id: number
  dictType: string
  dictCode: string
  dictName: string
  orderNum: number
  status: string // 1启用 0停用
  remark?: string
  gmtCreate?: string
  gmtModified?: string
}

/** 字典分页查询参数 */
export interface DictQuery {
  pageNum?: number
  pageSize?: number
  dictType?: string
  keyword?: string
  status?: string
}

export const DictAPI = {
  /** 分页查询字典列表 */
  getList(params?: DictQuery) {
    return request<any, PageResult<Dict[]>>({
      url: `${USER_BASE_URL}/dict/list`, method: 'get', params,
    })
  },
  /** 根据主键ID查询详情 */
  getDetail(id: number) {
    return request<any, Dict>({
      url: `${USER_BASE_URL}/dict/${id}`, method: 'get',
    })
  },
  /** 新增字典 */
  insert(data: Partial<Dict>) {
    const { id, ...rest } = data as any
    return request<any, any>({ url: `${USER_BASE_URL}/dict/insert`, method: 'post', data: rest })
  },
  /** 更新字典 */
  update(data: Dict) {
    return request<any, any>({ url: `${USER_BASE_URL}/dict/update`, method: 'post', data })
  },
  /** 删除字典 */
  delete(id: number) {
    return request<any, any>({ url: `${USER_BASE_URL}/dict/delete/${id}`, method: 'delete' })
  },
}

/** 按类型查询字典列表（提取自分页结果，pageSize 设大值获取全部） */
export const getDictByType = (dictType: string) =>
  DictAPI.getList({ dictType, pageSize: 9999 }).then(res => res.list || [])