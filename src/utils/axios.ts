/**
 * axios —— 全局 HTTP 请求封装
 *
 * 基于 axios 创建统一的请求实例，配置 baseURL 和超时时间，
 * 通过请求/响应拦截器实现：
 *   - 自动剥离响应数据的 data 层
 *   - 统一处理业务状态码（200/401/其他）
 *   - 二进制数据（blob/arraybuffer）透传
 *   - HTTP 错误码中文提示
 *   - 非本系统接口识别
 */

import axios, { type AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
// import { getToken } from './cache/cookies';  // Token 注入功能暂未启用

/**
 * 创建并配置 axios 请求实例
 *
 * @returns 配置好的 AxiosInstance
 */
function createAxios() {
  // 创建 axios 实例，设置基础 URL 和超时时间
  const Axios = axios.create({
    // 从 Vite 环境变量读取后端 API 基础路径，如 '/api'
    baseURL: import.meta.env.VITE_BASE_API,
    // 请求超时时间 30 秒
    timeout: 30000,
  });

  // ==================== 请求拦截器 ====================
  // 在请求发送之前执行，用于注入 Token、添加请求头等
  Axios.interceptors.request.use(
    (config) => {
      // TODO: 在此处注入 Token，例如：
      // const token = getToken()
      // if (token) config.headers.Authorization = `Bearer ${token}`
      return config;
    },
    // 请求发送失败（如网络断开），直接透传错误
    (error) => Promise.reject(error)
  );

  // ==================== 响应拦截器 ====================
  // 在收到响应后执行，用于统一处理状态码和数据格式
  Axios.interceptors.response.use(
    (response: AxiosResponse) => {
      // 1. 统一剥离外层 data：后端返回格式为 { code, message, data }
      const apiData = response.data;

      // 2. 二进制数据（blob / arraybuffer）直接返回，不做 JSON 解析
      //    适用场景：文件下载、导出 Excel、验证码图片等
      const responseType = response.request?.responseType;
      if (responseType === 'blob' || responseType === 'arraybuffer') {
        return apiData;
      }

      // 3. 提取业务状态码（后端约定的 code 字段）
      const code = apiData.code;

      // 4. 如果 code 不存在，说明不是本系统标准接口，拒绝处理
      if (code === undefined) {
        ElMessage.error('非本系统的接口');
        return Promise.reject(new Error('非本系统的接口'));
      }

      // 5. 根据业务状态码分流处理
      switch (code) {
        case 200:
          // 业务成功：直接返回 data 字段，调用方无需再解构
          // 例如：{ code: 200, data: { id: 1, name: 'xxx' } } → 直接得到 { id: 1, name: 'xxx' }
          return apiData.data;

        case 401:
          // Token 过期或未登录：跳转登录页并清除本地凭据
          // TODO: 调用 logout() 并重定向到 /login
          return Promise.reject(new Error('登录状态已过期'));

        default:
          // 其他业务错误（如参数校验失败）：弹出错误提示并 reject
          const errorMsg = apiData.message || '业务逻辑错误';
          ElMessage.error(errorMsg);
          return Promise.reject(new Error(errorMsg));
      }
    },
    // ==================== HTTP 错误处理 ====================
    // 响应状态码不在 2xx 范围内时触发（如 404、500 等）
    (error) => {
      // 获取 HTTP 状态码，默认 500
      const status = error.response?.status || 500;
      let message = '请求异常';

      console.log('--err--', error);

      // 根据 HTTP 状态码给出对应的中文提示
      switch (status) {
        case 400:
          message = '请求错误';
          break;
        case 401:
          // 401 时从响应体中提取详细错误信息
          message = error.response.data.data;
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求地址出错';
          break;
        case 408:
          message = '请求超时';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 501:
          message = '服务未实现';
          break;
        case 502:
          message = '网关错误';
          break;
        case 503:
          message = '服务不可用';
          break;
        case 504:
          message = '网关超时';
          break;
        case 505:
          message = 'HTTP 版本不受支持';
          break;
        default:
          break;
      }

      // 弹出错误消息提示
      ElMessage.error(message);
      // 继续 reject，让调用方 catch 也能感知到错误
      return Promise.reject(error);
    }
  );

  return Axios;
}

/** 导出的请求方法，项目中统一通过此实例发起 HTTP 请求 */
export const request = createAxios();
