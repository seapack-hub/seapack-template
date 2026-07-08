/**
 * 基金基础信息 - 类型定义
 */

export interface FundPageQuery extends PageQuery {
  keywords?: string
  status?: string
  startTime?: string
  endTime?: string
}

export interface FundBaseInfo {
  /** 基金编码 */
  fundCode?: string
  /** 基金简称 */
  fundName?: string
  /** 基金全称 */
  fundFullName?: string
  /** 基金类型 */
  fundTypeName?: string
  /** 基金管理公司 */
  managementCompany?: string
  /** 基金托管人 */
  custodian?: string
  /** 成立日期 */
  inceptDate?: string
  /** 成立规模 */
  issueShare?: number
  /** 管理费率 */
  mfee?: number
  /** 托管费率 */
  cfee?: number
  /** 销售服务费率 */
  sfee?: number
  /** 基金状态 */
  status?: string
  [property: string]: any
}
