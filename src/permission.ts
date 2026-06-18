import router from './router';
import { routerPluginManager } from '@/router/plugins/routerPluginManager'
import { permissionPlugin } from '@/router/plugins/permissionPlugin'
import { progressPlugin } from '@/router/plugins/progressPlugin'

//注册插件
//权限控制
routerPluginManager.register(permissionPlugin)
//进度条
routerPluginManager.register(progressPlugin)

// 全局路由前置守卫
router.beforeEach(async (to, from, next) => {
  await routerPluginManager.runBeforeEach({to, from, next});
})
// 后置守卫
router.afterEach((to, from) => {
  routerPluginManager.runAfterEach(to, from)
});
