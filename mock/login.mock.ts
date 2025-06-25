 import { defineMock } from './base';
 export default defineMock([
  {
    url: 'login/code',
    method: ['GET'],
    body: {
      code: 0,
      data: "http://dummyimage.com/100x40/dcdfe6/000000.png&text=V3Admin",
      msg: '一切ok'
    }
  },
 ]);