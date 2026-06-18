import type { RouterPlugin } from './types'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
/**
 * 白名单页面：不需要登录即可访问
 */
const WHITE_LIST = ['/login', '/blogs', '/errorPage/404', '/errorPage/403', '/errorPage/500'];

//权限验证插件
export const permissionPlugin: RouterPlugin = {
  name: 'PermissionPlugin',

  priority: 1, // 权限校验通常优先级最高

  async beforeEach({to,next}){
    
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    // 1. 白名单直接放行
    if (WHITE_LIST.includes(to.path)) {
      return next()
    }
    //2 如果内存中没有 Token，尝试从 localStorage 恢复
    //浏览器刷新会导致 Pinia 状态重置，但 localStorage 是持久化的
    if (!userStore.token) {
      const isRestored = userStore.restoreLoginState()
      // 如果恢复后依然没有 Token，说明用户确实未登录
      if (!isRestored) {
        return next(`/login?redirect=${to.path}`)
      }
    }

    //3 有 Token，检查动态路由是否已经生成
    if(permissionStore.isDynamicLoaded){
      // 路由已生成，直接放行
      return next()
    }else{
      try{
        // 3. 调用接口，获取用户权限信息并赋值
        userStore.fetchAuthPerms(String(userStore.userId));
        //admin用户获取静态路由，其余用户获取动态路由
        if(userStore.username){
          permissionStore.fetchStaticRoute()
        }else{
          //获取后端配置的动态路由
          permissionStore.fetchBackendRoute(String(userStore.userId))
        }
        //继续跳转
        next({ ...to, replace: true })
      }catch(err){
        // 获取菜单失败（可能是 Token 过期或后端报错），强制登出并跳转登录页
        await userStore.logout(false) // false 表示不调用后端登出接口
        next(`/login?redirect=${to.path}`)
      }
    }

  }
}