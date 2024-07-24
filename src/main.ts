import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css';
//引入全局样式
import './styles/index.scss'
//引入uno.css
import 'virtual:uno.css';
// 本地SVG图标
import 'virtual:svg-icons-register'
//引入pinia
import pinia from "./store";
//引入i18n
import i18n from "./locales";
import './permission.ts';
// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
//导入路由
import router from "./router";
const app = createApp(App);
//注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router).use(i18n).use(pinia).mount('#app');