/**
 * cookies —— Token 的 Cookie 读写工具
 *
 * 封装 js-cookie 库，统一管理登录令牌（token）的存取删操作。
 * 使用 CacheKey.TOKEN 作为键名，保证与应用其他模块的 key 一致。
 *
 * 使用方式：
 *   import { getToken, setToken, removeToken } from '@/utils/cache/cookies'
 *   setToken('xxx')       // 登录成功后写入
 *   const token = getToken()  // 请求拦截器中读取
 *   removeToken()         // 登出时清除
 */

import CacheKey from '@/constants/cache-key';
// @ts-expect-error js-cookie has no default export declaration
import Cookies from 'js-cookie';

/** 从 Cookie 中读取登录令牌 */
export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN);
};

/** 将登录令牌写入 Cookie（默认不设过期时间，随浏览器会话结束而清除） */
export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token, { secure: import.meta.env.PROD, sameSite: 'Strict' });
};

/** 从 Cookie 中移除登录令牌（登出时调用） */
export const removeToken = () => {
  Cookies.remove(CacheKey.TOKEN);
};
