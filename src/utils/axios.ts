import axios ,{ type AxiosResponse} from 'axios';
import { ElMessage } from 'element-plus';
//import { getToken } from './cache/cookies';



/**创建请求实例 */
function createAxios() {
  // 创建一个axios实例
  const Axios = axios.create({
    baseURL: import.meta.env.VITE_BASE_API,
    timeout: 30000,
  });

  // 请求拦截
  Axios.interceptors.request.use(
    (config) => {
      console.log('--,,config--',config);
      return config;
    },
    // 发送失败
    (error) => Promise.reject(error)
  );
  // 响应拦截
  Axios.interceptors.response.use(
    (response:AxiosResponse) => {
      // 1. 统一剥离 data 层 ✅
      const apiData = response.data;
      // 2. 特殊类型处理（二进制数据直接返回）
      const responseType = response.request?.responseType;
      if (responseType === 'blob' || responseType === 'arraybuffer') {
        return apiData; // 直接返回二进制数据[1](@ref)
      }
      // 3. 业务状态码统一处理（与后端约定）
      const code = apiData.code;
      // 4. 非系统接口识别
      if (code === undefined) {
        ElMessage.error('非本系统的接口');
        return Promise.reject(new Error('非本系统的接口'));
      }
      // 5. 业务状态码路由[5](@ref)
      switch (code) {
        case 200:
          // 本系统采用 code === 0 来表示没有业务错误
          return apiData.data;
        case 401:
          // Token 过期时
          // return logout()
          return Promise.reject(new Error('登录状态已过期'));;
        default:
          const errorMsg = apiData.message || '业务逻辑错误';
          ElMessage.error(errorMsg);
          return Promise.reject(new Error(errorMsg));
      }
    },
    (error) => {
      // 6. HTTP 状态码错误处理[8](@ref)
      const status = error.response?.status || 500;
      let message = '请求异常';
      console.log('--err--',error);
      // status 是 HTTP 状态码
      //const status = get(error, 'response.status');
      switch (status) {
        case 400:message = '请求错误';
          break;
        case 401:
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
      ElMessage.error(message);
      return Promise.reject(error);
    }
  );

  return Axios;
}
/** 用于网络请求的方法*/
export const request = createAxios();;
