import axios from 'axios';
import { ElMessage } from 'element-plus';
import { get} from 'lodash-es';
import { getToken } from './cache/cookies';

const token = getToken();

/**创建请求实例 */
function createAxios() {
  // 创建一个axios实例
  const Axios = axios.create({
    baseURL: import.meta.env.VITE_BASE_API,
    headers: {
      // 携带 Token
      Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': 'application/json'
    },
    timeout: 5000,
    data: {}
  });

  // 请求拦截
  Axios.interceptors.request.use(
    (config) => config,
    // 发送失败
    (error) => Promise.reject(error)
  );
  // 响应拦截
  Axios.interceptors.response.use(
    (response) => {
      // apiData 是 api 返回的数据
      const apiData = response.data;
      // 二进制数据则直接返回
      const responseType = response.request?.responseType;
      if (responseType === 'blob' || responseType === 'arraybuffer') return apiData;
      // 这个 code 是和后端约定的业务 code
      const code = apiData.code;
      // 如果没有 code, 代表这不是项目后端开发的 api
      if (code === undefined) {
        ElMessage.error('非本系统的接口');
        return Promise.reject(new Error('非本系统的接口'));
      }
      switch (code) {
        case 0:
          // 本系统采用 code === 0 来表示没有业务错误
          return apiData.data;
        case 401:
          // Token 过期时
          // return logout()
          //todo
          return;
        default:
          // 不是正确的 code
          ElMessage.error(apiData.message || 'Error');
          return Promise.reject(new Error('Error'));
      }
    },
    (error) => {
      // status 是 HTTP 状态码
      const status = get(error, 'response.status');
      switch (status) {
        case 400:
          error.message = '请求错误';
          break;
        case 401:
          // Token 过期时
          // logout()
          break;
        case 403:
          error.message = '拒绝访问';
          break;
        case 404:
          error.message = '请求地址出错';
          break;
        case 408:
          error.message = '请求超时';
          break;
        case 500:
          error.message = '服务器内部错误';
          break;
        case 501:
          error.message = '服务未实现';
          break;
        case 502:
          error.message = '网关错误';
          break;
        case 503:
          error.message = '服务不可用';
          break;
        case 504:
          error.message = '网关超时';
          break;
        case 505:
          error.message = 'HTTP 版本不受支持';
          break;
        default:
          break;
      }
      ElMessage.error(error.message);
      return Promise.reject(error);
    }
  );

  return Axios;
}
/** 用于网络请求的方法*/
export const request = createAxios();;
