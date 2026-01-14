import { request } from "@/utils/axios";

export const getDictByType = (type:string)=>{
  return request<any,any>({
    url: `/xxx/page`,
    method: "post",
    params:{type},
    data:{},
  });
};