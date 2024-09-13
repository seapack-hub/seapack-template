import {request} from "@/utils/axios";
import type * as Login from "./types/login";

/** 获取登录验证码*/
export const getLoginCodeApi = ()=>{
  return request<Login.LoginRequestData>({
    url:"login/code",
    method:"get"
  })
}