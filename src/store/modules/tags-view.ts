import {ref,watchEffect} from "vue";
import {defineStore} from "pinia";
import { type RouteLocationNormalized } from "vue-router";
import {useSettingsStore} from "@/store/modules/settings.ts";

export type TagsView = Partial<RouteLocationNormalized>
export const useTagsViewStore = defineStore("tags-view",()=>{
    const {cacheTagsView} = useSettingsStore();
    //已访问的标签页
    const visitedViews = ref<TagsView[]>([]);
    //缓存的标签页
    const cachedViews = ref<string[]>([]);

    /**
     * 添加新的标签页
     * @param view
     */
    const addVisitedView = (view:TagsView)=>{
        //检查是否存在相同的标签页
        const index = visitedViews.value.findIndex((v)=> v.path === view.path);
        if(index !== -1){
            //防止query 参数丢失,若新标签页路由和旧标签页不相等，则将新标签页路由替换旧标签页
            visitedViews.value[index].fullPath !== view.fullPath && (visitedViews.value[index] = {...view});
        }else{
            //添加新的路由
            visitedViews.value.push(view);
        }
    }

    /**
     * 删除标签页路由
     * @param view
     */
    const delVisitedView = (view:TagsView)=>{
        const index = visitedViews.value.findIndex((v)=>v.path === view.path);
        if(index !== -1) visitedViews.value.splice(index,1);
    }

    /**
     * 删除标签页路由(保留固定的路由)
     */
    const delAllVisitedView = ()=>{
        visitedViews.value = visitedViews.value.filter(tag=>tag.meta?.affix);
    }

    return {
        visitedViews,
        cachedViews,
        addVisitedView,
        delVisitedView,
        delAllVisitedView
    }

})
