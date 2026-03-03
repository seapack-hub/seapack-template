import { request } from "@/utils/axios";
const USER_BASE_URL = "/api/industry";

const industryApi = {
  getAllDimIndustry(){
    return request<any,DimIndustryTree>({
      url: USER_BASE_URL + "/tree",
      method: "get",
    });
  }
}
export default industryApi;

export type DimIndustryTree = {
  industryId: string,
  industryCode: string,
  industryName: string,
  parentCode: string,
  industryState: number,
  description: string,
  updateTime: string,
  children: DimIndustryTree[],
}