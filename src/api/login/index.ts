import {request} from "@/utils/axios";
import type * as Login from "./types/login";
const USER_BASE_URL = "/api/login";
/** 获取登录验证码*/
export const getLoginCodeApi = ()=>{
  return request<Login.LoginRequestData>({
    url:`${USER_BASE_URL}/code`,
    method:"get"
  });
};