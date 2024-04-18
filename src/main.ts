import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/dist/index.css';
//引入uno.css
import 'virtual:uno.css';
// 本地SVG图标
import 'virtual:svg-icons-register'

//引入pinia
import pinia from "./store";

//引入i18n
import i18n from "./locales";

//导入路由
import router from "./router";
createApp(App).use(router).use(i18n).use(pinia).mount('#app');