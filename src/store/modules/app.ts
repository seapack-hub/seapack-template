import {defineStore} from 'pinia';

import {useStorage,useToggle} from "@vueuse/core";

//引入语言包
//英文包
import en from 'element-plus/es/locale/lang/en';
//中文简体
import zhCn from 'element-plus/es/locale/lang/zh-cn';
//中文繁体
import zhTw from 'element-plus/es/locale/lang/zh-tw';

/**
 * 导入全局设置文件
 */
import appConfig from "@/config/app.ts";

/**
 * 定义 storageLanguage 变量，使用 useStorage 方法来存储和获取 'storageLanguage' 的值和 appConfig.language 的值
 */
const storageLanguage = useStorage("storageLanguage",appConfig.language);

/**
 * 定义 useAppStore，使用 defineStore 方法来定义一个名为 'app' 的状态存储
 */
export const useAppStore = defineStore('app',{
    //设置为永久存储
    persist: true,

    state:()=>({
        ...appConfig
    }),

    getters:{
        /**
         * 根据当前语言返回对应的语言包
         * @param state 存储状态
         * return 语言包对象
         */
        locale:(state)=>{
            return state.language === "en-US"?en:state.language === "en-CN"?zhCn:zhTw;
        }
    },

    actions:{
        /**
         * 修改语言
         * @param language 语言
         */
        changeLanguage(language:string){
            console.log('--调用--',language);
            storageLanguage.value = language;
            this.language = language;
        }
    }

})