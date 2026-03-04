import { request } from "@/utils/axios";
const USER_BASE_URL = "/api/industry";

const industryApi = {
  //查询所有行业数据
  getAllDimIndustry(){
    return request<any,DimIndustryTree>({
      url: USER_BASE_URL + "/tree",
      method: "get",
    });
  },
  //根据行业Code查询行业子树
  getDimIndustryByCode(industryCode: string){
    return request<any,DimIndustryTree>({
      url: `${USER_BASE_URL}/tree/${industryCode}`,
      method: "get",
    });
  },
  //根据行业名称和Code查询行业
  getDimIndustryByKeyword(params:{keyword?:string}){
    return request<any,DimIndustryTree>({
      url: `${USER_BASE_URL}/search`,
      method: "get",
      params,
    });
  },
  //查询行业总数
  getDimIndustryTotal(){
    return request<any,DimIndustryTree>({
      url: `${USER_BASE_URL}/stats`,
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