/*
 * @Author: 曾海峰 zenghf@tsingyun.net
 * @Date: 2024-09-12 14:47:40
 * @LastEditors: 曾海峰 7753230+zenghaifenga@user.noreply.gitee.com
 * @LastEditTime: 2025-05-11 13:47:47
 * @FilePath: \tsingyun-worke:\个人项目\seapackTemplate\seapack-template\src\api\login\types\login.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface LoginRequestData {
  /**用户名 */
  username: 'admin' | 'editor';
  /**密码 */
  password: string;
  /** 验证码 */
  code: string;

  data?:string;
}
