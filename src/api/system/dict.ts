import { request } from "@/utils/axios";
const USER_BASE_URL = "/api";

export const getDictByType = (dictType:string)=>{
  return request<any,any>({
    url: `${USER_BASE_URL}/dict/list`,
    method: "get",
    params:{dictType}
  });
};