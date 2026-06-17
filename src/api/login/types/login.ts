/*
 * @Author: 曾海峰 zenghf@tsingyun.net
 * @Date: 2024-09-12 14:47:40
 * @LastEditors: 曾海峰 7753230+zenghaifenga@user.noreply.gitee.com
 * @LastEditTime: 2025-05-11 13:47:47
 * @FilePath: \tsingyun-worke:\个人项目\seapackTemplate\seapack-template\src\api\login\types\login.ts
 * @Description: 登录相关类型定义
 */

/** 登录请求参数 */
export interface LoginRequestData {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
}

/** 登录响应数据 */
export interface LoginResponse {
  /** 登录凭证 Token */
  token: string;
  /** 用户ID */
  userId: number;
  /** 用户名 */
  username: string;
  /** 用户昵称 */
  nickName: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  mobile: string;
}
