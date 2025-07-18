 import { request } from "@/utils/axios";
 const USER_BASE_URL = "/user";

 const UserAPI = {
  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
  getInfo() {
    return request<any, UserInfo>({
      url: `${USER_BASE_URL}/me`,
      method: "get",
    });
  },

  /**
   * 获取用户分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: UserPageQuery) {
    return request<any, PageResult<UserPageVO[]>>({
      url: `${USER_BASE_URL}/page/list`,
      method: "get",
      params: queryParams,
    });
  },

  // /**
  //  * 获取用户表单详情
  //  *
  //  * @param userId 用户ID
  //  * @returns 用户表单详情
  //  */
  // getFormData(userId: number) {
  //   return request<any, UserForm>({
  //     url: `${USER_BASE_URL}/${userId}/form`,
  //     method: "get",
  //   });
  // },

  // /**
  //  * 添加用户
  //  *
  //  * @param data 用户表单数据
  //  */
  // add(data: UserForm) {
  //   return request({
  //     url: `${USER_BASE_URL}`,
  //     method: "post",
  //     data: data,
  //   });
  // },

  // /**
  //  * 修改用户
  //  *
  //  * @param id 用户ID
  //  * @param data 用户表单数据
  //  */
  // update(id: number, data: UserForm) {
  //   return request({
  //     url: `${USER_BASE_URL}/${id}`,
  //     method: "put",
  //     data: data,
  //   });
  // },

  /**
   * 修改用户密码
   *
   * @param id 用户ID
   * @param password 新密码
   */
  resetPassword(id: number, password: string) {
    return request({
      url: `${USER_BASE_URL}/${id}/password/reset`,
      method: "put",
      params: { password: password },
    });
  },

  /**
   * 批量删除用户，多个以英文逗号(,)分割
   *
   * @param ids 用户ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  // /** 下载用户导入模板 */
  // downloadTemplate() {
  //   return request({
  //     url: `${USER_BASE_URL}/template`,
  //     method: "get",
  //     responseType: "blob",
  //   });
  // },

  // /**
  //  * 导出用户
  //  *
  //  * @param queryParams 查询参数
  //  */
  // export(queryParams: UserPageQuery) {
  //   return request({
  //     url: `${USER_BASE_URL}/export`,
  //     method: "get",
  //     params: queryParams,
  //     responseType: "blob",
  //   });
  // },

  // /**
  //  * 导入用户
  //  *
  //  * @param deptId 部门ID
  //  * @param file 导入文件
  //  */
  // import(deptId: number, file: File) {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   return request<any, ExcelResult>({
  //     url: `${USER_BASE_URL}/import`,
  //     method: "post",
  //     params: { deptId: deptId },
  //     data: formData,
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //     },
  //   });
  // },

  // /** 获取个人中心用户信息 */
  // getProfile() {
  //   return request<any, UserProfileVO>({
  //     url: `${USER_BASE_URL}/profile`,
  //     method: "get",
  //   });
  // },

  // /** 修改个人中心用户信息 */
  // updateProfile(data: UserProfileForm) {
  //   return request({
  //     url: `${USER_BASE_URL}/profile`,
  //     method: "put",
  //     data: data,
  //   });
  // },

  // /** 修改个人中心用户密码 */
  // changePassword(data: PasswordChangeForm) {
  //   return request({
  //     url: `${USER_BASE_URL}/password`,
  //     method: "put",
  //     data: data,
  //   });
  // },

  // /** 发送短信验证码（绑定或更换手机号）*/
  // sendMobileCode(mobile: string) {
  //   return request({
  //     url: `${USER_BASE_URL}/mobile/code`,
  //     method: "post",
  //     params: { mobile: mobile },
  //   });
  // },

  // /** 绑定或更换手机号 */
  // bindOrChangeMobile(data: MobileUpdateForm) {
  //   return request({
  //     url: `${USER_BASE_URL}/mobile`,
  //     method: "put",
  //     data: data,
  //   });
  // },

  // /** 发送邮箱验证码（绑定或更换邮箱）*/
  // sendEmailCode(email: string) {
  //   return request({
  //     url: `${USER_BASE_URL}/email/code`,
  //     method: "post",
  //     params: { email: email },
  //   });
  // },

  // /** 绑定或更换邮箱 */
  // bindOrChangeEmail(data: EmailUpdateForm) {
  //   return request({
  //     url: `${USER_BASE_URL}/email`,
  //     method: "put",
  //     data: data,
  //   });
  // },

  // /**
  //  *  获取用户下拉列表
  //  */
  // getOptions() {
  //   return request<any, OptionType[]>({
  //     url: `${USER_BASE_URL}/options`,
  //     method: "get",
  //   });
  // },
 };
 export default UserAPI;

 /** 登录用户信息 */
export interface UserInfo {
  /** 用户ID */
  userId?: number;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 角色 */
  roles: string[];

  /** 权限 */
  perms: string[];
}

/**
 * 用户分页查询对象
 */
 export interface UserPageQuery extends PageQuery{
  //关键字搜索
  keywords?:string,
  //用户状态
  status?:string,
  //部门ID
  deptId?:number,
  //开始时间
  startTime?:string,
  //结束时间
  endTime?:string
 }

 /** 用户分页对象 */
export interface UserPageVO {
  /** 用户ID */
  id: number;
  /** 用户头像URL */
  avatar?: string;
  /** 创建时间 */
  createTime?: Date;
  /** 部门名称 */
  deptName?: string;
  /** 用户邮箱 */
  email?: string;
  /** 性别 */
  gender?: number;
  /** 手机号 */
  mobile?: string;
  /** 用户昵称 */
  nickname?: string;
  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;
  /** 用户状态(1:启用;0:禁用) */
  status?: number;
  /** 用户名 */
  username?: string;
}