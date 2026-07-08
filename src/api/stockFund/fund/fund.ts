import { request } from "@/utils/axios.ts";
import type { FundPageQuery, FundBaseInfo } from "./types/fund";

export type { FundPageQuery, FundBaseInfo }

const USER_BASE_URL = "/api/fundBaseInfo";

export const FundBaseInfoAPI = {
  /** 分页查询基金列表 */
  getFundBaseInfoList(queryParams: FundPageQuery) {
    const { pageNum, pageSize, ...fundBaseInfo } = queryParams;
    return request<any, FundBaseInfo>({
      url: `${USER_BASE_URL}/page`,
      method: "post",
      params: { pageNum, pageSize },
      data: fundBaseInfo,
    });
  },

  /** 插入 */
  insertFundBaseInfo(fundInfo: FundBaseInfo) {
    return request<any, any>({
      url: `${USER_BASE_URL}/insert`,
      method: "post",
      data: fundInfo
    })
  },

  /** 删除 */
  deleteFundBaseInfo(fundCode: string) {
    return request<any, any>({
      url: `${USER_BASE_URL}/delete/${fundCode}`,
      method: "delete",
    })
  },

  /** 详情 */
  getFundBaseInfoDetail(fundCode: string) {
    return request<any, FundBaseInfo>({
      url: `${USER_BASE_URL}/detail/${fundCode}`,
      method: "get"
    })
  },

  /** 更新 */
  updateFundBaseInfo(fundInfo: FundBaseInfo) {
    return request<any, any>({
      url: `${USER_BASE_URL}/update`,
      method: "post",
      data: fundInfo
    })
  },
};
