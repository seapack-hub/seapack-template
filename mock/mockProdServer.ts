// src/mockProdServer.ts
import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer.js';
import deptMock from './dept.mock'; // 导入 Mock 数据文件
import loginMock from "./login.mock";
import userMock from "./user.mock";

export function setupProdMockServer() {
  createProdMockServer([...deptMock,...loginMock,...userMock]); // 注册所有 Mock 接口
}
