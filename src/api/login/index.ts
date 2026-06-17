import { request } from "@/utils/axios";
import type { LoginRequestData, LoginResponse } from "./types/login";

const USER_BASE_URL = "/api";

/** 获取登录验证码 */
export const getLoginCodeApi = () => {
  return request<LoginRequestData>({
    url: `${USER_BASE_URL}/code`,
    method: "get"
  });
};

/**
 * 登录验证
 * @param params 包含 username 和 password（RSA加密后）
 * @returns Promise<LoginResponse> 包含 token 和用户信息
 */
export const loginVerify = (params: { username: string; password: string|true }) => {
  return request<any, LoginResponse>({
    url: `${USER_BASE_URL}/auth/login`,
    method: "get",
    params
  });
};

/** 获取公钥 */
export const getPublicKey = () => {
  return request<any, { publicKey: string }>({
    url: `${USER_BASE_URL}/rsa/auth/publicKey`,
    method: "get"
  });
};

/** 获取滑动验证码图片 */
export const getSlideVerifyImg = () => {
  return request<CaptchaData>({
    url: `${USER_BASE_URL}/captcha/generate`,
    method: "get"
  });
};

/** 滑动验证码数据 */
export interface CaptchaData {
  bgImage: string;
  sliderImage: string;
  token: string;
  sliderX: number;
  sliderY: number;
}