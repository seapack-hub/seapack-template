import {request} from "@/utils/axios";

const USER_BASE_URL = "/api";

export const agentApi = {
  // 调用智能体
  callAgent:(params:{task:string})=>{
    return request<string>(`${USER_BASE_URL}/agent/run-agent`,{
      method:'get',
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
}