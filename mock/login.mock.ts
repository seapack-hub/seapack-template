import { MockMethod } from 'vite-plugin-mock';
export default [
  {
    url:'/api/login/code',
    method:'GET',
    response: () => {
      return {
        code: 0,
        data: 'http://dummyimage.com/100x40/dcdfe6/000000.png&text=V3Admin',
        msg: '一切ok'
      };
    }
  }
] as MockMethod[];
