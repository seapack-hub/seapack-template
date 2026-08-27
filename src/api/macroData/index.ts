/**
 * 宏观数据 API 层
 * 对接后端统一查询接口 /macro/query、/macro/meta、/macro/import
 */
import { request } from '@/utils/axios'
import type {
  MacroPivotResult,
  MacroIndicatorMeta,
  MacroDataItem,
} from './types'

export type { MacroIndicatorMeta, MacroDataItem }

const BASE_URL = '/api/macro'

export const MacroDataAPI = {
  // ==================== 查询接口 ====================

  /** 统一 pivot 查询（核心接口） */
  queryPivot(
    frequency: string,
    indicators: string[],
    startDate?: string,
    endDate?: string,
    dataVersion?: number,
  ) {
    const params: Record<string, any> = { frequency, indicators: indicators.join(',') }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (dataVersion != null) params.dataVersion = dataVersion
    return request<any, MacroPivotResult>({
      url: `${BASE_URL}/query`,
      method: 'get',
      params,
    })
  },

  /** 查询指标元数据 */
  getMeta(frequency?: string) {
    const params: Record<string, any> = {}
    if (frequency) params.frequency = frequency
    return request<any, MacroIndicatorMeta[]>({
      url: `${BASE_URL}/meta`,
      method: 'get',
      params,
    })
  },

  /** 查询已使用的指标编码 */
  getIndicators(frequency: string = 'monthly') {
    return request<any, string[]>({
      url: `${BASE_URL}/indicators`,
      method: 'get',
      params: { frequency },
    })
  },

  // ==================== 写入接口 ====================

  /** 保存单条记录（upsert：存在则更新，不存在则插入） */
  save(frequency: string, item: MacroDataItem) {
    return request<any, number>({
      url: `${BASE_URL}/save`,
      method: 'post',
      data: item,
      params: { frequency },
    })
  },

  /** 批量导入宏观数据 */
  import(frequency: string, items: MacroDataItem[]) {
    return request<any, { imported: number }>({
      url: `${BASE_URL}/import`,
      method: 'post',
      data: items,
      params: { frequency },
    })
  },

  /** 删除单条记录 */
  delete(frequency: string, statDate: string, indicatorCode: string) {
    return request<any, number>({
      url: `${BASE_URL}/delete`,
      method: 'post',
      params: { frequency, statDate, indicatorCode },
    })
  },

  // ==================== 分页查询（管理页面用） ====================

  /** 月频分页查询 */
  queryMonthlyPage(
    pageNum: number,
    pageSize: number,
    indicatorCode: string,
    startDate?: string,
    endDate?: string,
  ) {
    const params: Record<string, any> = { pageNum, pageSize, indicatorCode }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request<any, PageResult<any>>({
      url: `${BASE_URL}/monthly/page`,
      method: 'get',
      params,
    })
  },

  /** 日频分页查询 */
  queryDailyPage(
    pageNum: number,
    pageSize: number,
    indicatorCode: string,
    startDate?: string,
    endDate?: string,
  ) {
    const params: Record<string, any> = { pageNum, pageSize, indicatorCode }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request<any, PageResult<any>>({
      url: `${BASE_URL}/daily/page`,
      method: 'get',
      params,
    })
  },

  /** 周频分页查询 */
  queryWeeklyPage(
    pageNum: number,
    pageSize: number,
    indicatorCode: string,
    startDate?: string,
    endDate?: string,
  ) {
    const params: Record<string, any> = { pageNum, pageSize, indicatorCode }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request<any, PageResult<any>>({
      url: `${BASE_URL}/weekly/page`,
      method: 'get',
      params,
    })
  },

}
