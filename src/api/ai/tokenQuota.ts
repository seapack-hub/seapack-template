/**
 * 用户 Token 额度管理 API
 *
 * 后端接口前缀：/api/ai/user-quota
 */
import { request } from '@/utils/axios'
import type {
  UserTokenQuota,
  UserTokenUsage,
  QuotaFormData,
  QuotaListQuery,
  UsageDetailQuery,
  QuotaOverview,
  QuotaStats,
} from './types/tokenQuota'

export type {
  UserTokenQuota,
  UserTokenUsage,
  QuotaFormData,
  QuotaListQuery,
  UsageDetailQuery,
  QuotaOverview,
  QuotaStats,
}

const BASE_URL = '/api/ai/user-quota'

export const UserQuotaAPI = {
  /** 查询额度列表（分页） */
  getList(query: QuotaListQuery) {
    return request<any, { list: UserTokenQuota[]; total: number }>({
      url: `${BASE_URL}/list`,
      method: 'post',
      data: query,
    })
  },

  /** 新增额度配置 */
  save(data: QuotaFormData) {
    return request<any, void>({
      url: `${BASE_URL}/save`,
      method: 'post',
      data,
    })
  },

  /** 删除额度配置 */
  delete(id: number) {
    return request<any, void>({
      url: `${BASE_URL}/delete`,
      method: 'post',
      data: { id },
    })
  },

  /** 启用/禁用额度控制 */
  toggle(id: number, enable: boolean) {
    return request<any, void>({
      url: `${BASE_URL}/toggle`,
      method: 'post',
      params: { id, enable },
    })
  },

  /** 查询当前用户的额度和使用情况 */
  getMyOverview() {
    return request<any, QuotaOverview>({
      url: `${BASE_URL}/my`,
      method: 'get',
    })
  },

  /** 查询额度统计（管理员视图） */
  getStats() {
    return request<any, QuotaStats>({
      url: `${BASE_URL}/stats`,
      method: 'post',
    })
  },

  /** 查询用户使用明细（按日汇总） */
  getUsageDetail(query: UsageDetailQuery) {
    return request<any, UserTokenUsage[]>({
      url: `${BASE_URL}/my-usage`,
      method: 'get',
      params: query,
    })
  },

  /** 重置用户额度（手动清零） */
  reset(userId: number, quotaType: string) {
    return request<any, void>({
      url: `${BASE_URL}/reset`,
      method: 'post',
      data: { userId, quotaType },
    })
  },
}
