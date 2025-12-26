import { request } from "@/utils/axios";
const USER_BASE_URL = "/api/fundBaseInfo";
const FundBaseInfoAPI = {
  getFundBaseInfoList(queryParams:FundPageQuery){
    return request<any,FundBaseInfo>({
      url: `${USER_BASE_URL}/page`,
      method: "get",
      params:queryParams
    });
  }
};
export default FundBaseInfoAPI;

export interface FundPageQuery extends PageQuery{
  //关键字搜索
  keywords?:string,
  //用户状态
  status?:string,
  //开始时间
  startTime?:string,
  //结束时间
  endTime?:string
 }

export interface FundBaseInfo {
  /** 基金编码 */
  fundCode?:string,
  /** 基金简称 */
  fundName?:string,
  /** 基金全称 */
  fundFullName?:string,
  /** 基金类型 */
  fundTypeName?:string,
  /** 基金管理公司 */
  managementCompany?:string,
  /** 基金托管人 */
  custodian?:string,
  /** 成立日期 */
  inceptDate?:string,
  /** 成立规模 */
  issueShare?:number,
  /** 管理费率 */
  mfee?:number,
  /** 托管费率 */
  cfee?:number,
  /** 销售服务费率 */
  sfee?:number,
  /** 基金状态 */
  status?:string,
  [property: string]: any
};