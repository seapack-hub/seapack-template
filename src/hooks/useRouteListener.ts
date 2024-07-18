/** 路由监听钩子函数 **/
import { onBeforeMount } from "vue";
import mitt,{type Handler} from "mitt";
import { type RouteLocationNormalized } from "vue-router";

/** 定义回调函数的类型 */
type Callback = (route:RouteLocationNormalized)=>void;

const emitter = mitt();
// 声明唯一键
const key = Symbol("ROUTE_CHANGE");
let latestRoute:RouteLocationNormalized;

export const setRouteChange= (to:RouteLocationNormalized)=>{
    //触发事件
    emitter.emit(key,to);
    //缓存最新的路由信息
    latestRoute = to;
}

/** 单独监听路由会浪费渲染性能，使用发布订阅模式去进行分发管理 */
export function useRouteListener(){
    // 回调函数集合
    const callBackList:Callback[] = [];

    /**
     * 监听路由变化
     * @param callback 回调函数
     * @param immediate 是否立即执行，默认为false
     */
    const listenerRouteChange = (callback:Callback,immediate=false)=>{
        //缓存回调函数
        callBackList.push(callback);
        //监听事件
        emitter.on(key,callback as Handler);
        // 可以选择 立即执行一次回调函数
        immediate && latestRoute && callback(latestRoute)
    }

    /**
     * 移除路由变化监听器
     * @param callback
     */
    const removeRouteListener = (callback:Callback)=>{
        emitter.off(key,callback as Handler);
    }

    /**
     *
     */
    onBeforeMount(()=>{
        for(let i=0;i<callBackList.length;i++){
            removeRouteListener(callBackList[i]);
        }
    });

    return { listenerRouteChange, removeRouteListener }
}


