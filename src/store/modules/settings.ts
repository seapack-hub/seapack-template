import { type Ref, ref, watch } from "vue";
import {defineStore} from "pinia";
import {type LayoutSetting,layoutSettings} from "@/config/layouts.ts";

type SettingsStore = {
    //使用映射类型来遍历layout 对象的键值
    [Key in keyof LayoutSetting]:Ref<LayoutSetting[Key]>
}

type SettingsStoreKey = keyof SettingsStore;

export const useSettingsStore = defineStore("settings",()=>{

    /** 状态对象 */
    const state = {} as SettingsStore;

    /**遍历 layoutSettings 对象的键值对*/
    //Object.entries() 方法返回一个给定对象自身可枚举属性的键值对数组
    for(const [key,value] of Object.entries(layoutSettings)){
        // 使用类型断言来指定 key 的类型，将 value 包装在 ref 函数中，创建一个响应式变量
        const refValue = ref(value);
        state[key] = refValue;
        //监听每个响应式变量
        watch(refValue,()=>{
            //将响应式对象 转换为普通对象
            const settings = _getCatchData();
            //todo 将转换后的变量存入localStorage中，即将响应式对象
        })
    }

    /**
     * 获取要缓存的数据：将 state 对象转化为 settings 对象
     */
    const _getCatchData = ()=>{
        const settings = {} as LayoutSetting;
        for(const [key,value] of Object.entries(state)){
            settings[key] = value.value;
        }
        return settings;
    }

    return state;
})