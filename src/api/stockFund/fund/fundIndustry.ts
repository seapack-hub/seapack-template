import { request } from "@/utils/axios.ts";
import type { DimIndustryTree } from "./types/fundIndustry";

export type { DimIndustryTree }

const USER_BASE_URL = "/api/industry";

export const industryApi = {
  /** 查询所有行业数据 */
  getAllDimIndustry() {
    return request<any, DimIndustryTree>({
      url: USER_BASE_URL + "/tree",
      method: "get",
    });
  },

  /** 根据行业Code查询行业子树 */
  getDimIndustryByCode(industryCode: string) {
    return request<any, DimIndustryTree>({
      url: `${USER_BASE_URL}/tree/${industryCode}`,
      method: "get",
    });
  },

  /** 根据行业名称和Code查询行业 */
  getDimIndustryByKeyword(params: { keyword?: string }) {
    return request<any, DimIndustryTree>({
      url: `${USER_BASE_URL}/search`,
      method: "get",
      params,
    });
  },

  /** 查询行业总数 */
  getDimIndustryTotal() {
    return request<any, DimIndustryTree>({
      url: `${USER_BASE_URL}/stats`,
      method: "get",
    });
  }
}
