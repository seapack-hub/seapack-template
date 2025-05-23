/**
 * useNavigatorLanguage 获取浏览器默认的语言 zh-CN,en
 * return Navigator对象
 */
import { useNavigatorLanguage } from '@vueuse/core';

const { language } = useNavigatorLanguage();
//全局设置变量
const appConfig = {
  //使用language对象的value属性获取当前语言
  language: language.value
};
export default appConfig;
