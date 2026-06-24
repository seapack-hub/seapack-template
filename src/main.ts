import { createApp } from 'vue';
import App from './App.vue';
//引入uno.css
import 'virtual:uno.css';
// @ts-expect-error: side-effect import
import 'element-plus/es/components/message/style/css'
// @ts-expect-error: side-effect import
import 'element-plus/es/components/message-box/style/css'
//引入全局样式
import './styles/index.scss';
// 本地SVG图标
// @ts-expect-error: virtual module
import 'virtual:svg-icons-register';
//引入pinia
import pinia from './store';
//引入i18n
import i18n from './locales';
import './permission.ts';
import vTableShadow from './directives/tableBottomShadow'
import { setupPermissionDirective } from './directives/permission'
//导入路由
import router, { initAllRoutes } from './router';

// 启动时全量加载所有模块路由，确保导航不因路由未注册而失败
initAllRoutes();

const app = createApp(App);
// 注册全局 v-permission 权限指令
setupPermissionDirective(app);
app.use(router)
.use(i18n)
.use(pinia)
.directive('table-shadow', vTableShadow)

// 收集模块路由列表供侧边栏渲染
import { usePermissionStore } from '@/store/modules/permission'
const permissionStore = usePermissionStore()
permissionStore.collectRoutes()

app.mount('#app');
