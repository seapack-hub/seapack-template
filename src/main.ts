import { createApp } from 'vue';
import App from './App.vue';
//引入uno.css
// @ts-ignore
import 'virtual:uno.css';
// @ts-ignore
import 'element-plus/es/components/message/style/css'
// @ts-ignore
import 'element-plus/es/components/message-box/style/css'
//引入全局样式
// @ts-ignore
import './styles/index.scss';
// 本地SVG图标
// @ts-ignore 本地SVG图标
import 'virtual:svg-icons-register';
//引入pinia
import pinia from './store';
//引入i18n
import i18n from './locales';
import './permission.ts';
import vTableShadow from './directives/tableBottomShadow'
import { setupPermissionDirective } from './directives/permission'
// 如果您正在使用CDN引入，请删除下面一行。
//导入路由
import router from './router';
// import {setupProdMockServer} from "../mock/mockProdServer.ts";
// setupProdMockServer();
const app = createApp(App);
// 注册全局 v-permission 权限指令
setupPermissionDirective(app);
app.use(router)
.use(i18n)
.use(pinia)
.directive('table-shadow', vTableShadow)
.mount('#app');
