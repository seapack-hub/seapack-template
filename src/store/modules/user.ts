import {defineStore} from "pinia";

//引入User类型
import {User} from "@/api/types/user.ts";

export const useUserStore = defineStore("user",{
    state:()=>({
        userInfo:<User>{}
    }),
    actions:{
        getUserInfo(userInfo:object){
            this.userInfo = userInfo;
        }
    }
})
