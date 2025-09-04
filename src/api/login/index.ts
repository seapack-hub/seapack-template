import {request} from "@/utils/axios";
import type * as Login from "./types/login";
const USER_BASE_URL = "";
/** 获取登录验证码*/
export const getLoginCodeApi = ()=>{
  return request<Login.LoginRequestData>({
    url:`${USER_BASE_URL}/code`,
    method:"get"
  });
};

/**
 * 登录验证
 */
export const loginVerify = (params:loginForm)=>{
  return request({
    url:`${USER_BASE_URL}/auth/login`,
    method:"get",
    params
  }) as Promise<string>;
};

export const getSlideVerifyImg = ()=>{
  return request({
    url:`${USER_BASE_URL}/captcha/generate`,
    method:"get"
  }) as Promise<CaptchaData>;
};

export interface CaptchaData {
  bgImage: string;
  sliderImage: string;
  token: string;
  sliderX:number;
  sliderY:number;
}

export interface loginForm {
  token:string,
  sliderX:number,
  username:string,
  password:string
}