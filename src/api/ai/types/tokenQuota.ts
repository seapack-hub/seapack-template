/**
 * 用户 Token 额度管理 - 类型定义
 *
 * 后端接口：/api/ai/user-quota/*
 */

/** 配额类型 */
export type QuotaType = 'daily' | 'monthly' | 'total'

/** 配额状态 */
export type QuotaStatus = 'normal' | 'exceeded' | 'disabled'

/** 用户 Token 额度配置 */
export interface UserTokenQuota {
  id: number
  userId: number
  userName?: string
  quotaType: QuotaType
  quotaLimit: number
  alertThreshold: number
  isEnabled: boolean
  status: QuotaStatus
  startDate: string
  endDate?: string
  createdAt?: string
  updatedAt?: string
  // 实时数据（后端计算）
  usedTokens?: number
  remainingTokens?: number
}

/** 用户每日使用量 */
export interface UserTokenUsage {
  id: number
  userId: number
  userName?: string
  usageDate: string
  tokensUsed: number
  callCount: number
  createdAt?: string
  updatedAt?: string
}

/** 额度配置表单 */
export interface QuotaFormData {
  userId?: number
  userName?: string
  quotaType: QuotaType
  quotaLimit: number
  alertThreshold: number
  isEnabled: boolean
}

/** 额度列表查询参数 */
export interface QuotaListQuery {
  pageNum: number
  pageSize: number
  userId?: number
  userName?: string
  quotaType?: QuotaType
  status?: QuotaStatus
  isEnabled?: boolean
}

/** 用户使用明细查询参数 */
export interface UsageDetailQuery {
  userId: number
  startDate: string
  endDate: string
}

/** 额度概览（当前用户） */
export interface QuotaOverview {
  dailyLimit: number
  dailyUsed: number
  dailyRemaining: number
  monthlyLimit: number
  monthlyUsed: number
  monthlyRemaining: number
  totalLimit: number
  totalUsed: number
  totalRemaining: number
}

/** 额度统计（管理员视图） */
export interface QuotaStats {
  totalUsers: number
  enabledCount: number
  exceededCount: number
  disabledCount: number
}
