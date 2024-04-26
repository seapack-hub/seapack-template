/*
 * @Author: 曾海峰 zenghf@tsingyun.net
 * @Date: 2024-04-24 09:27:48
 * @LastEditors: 曾海峰 zenghf@tsingyun.net
 * @LastEditTime: 2024-04-26 18:10:06
 * @FilePath: \seapack-template\src\store\modules\user.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {defineStore} from "pinia";

//引入User类型
import {User} from "@/api/types/user.ts";

export const useUserStore = defineStore("user",{
    state:()=>({
        userInfo:<User>{}
    }),
    actions:{
        getUserInfo(userInfo:User){
            this.userInfo = userInfo;
        }
    }
})
