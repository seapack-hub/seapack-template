//引入vue-i18n
import {createI18n} from 'vue-i18n';

import en from "./lang/en.json";
import zh_CN from "./lang/zh-CN.json";
import zh_TW from "./lang/zh-TW.json";

const messages = {
    'zh-CN':{
        ...zh_CN
    },
    'zh-TW':{
        ...zh_TW
    },
    'en':{
        ...en
    }
};

const i18n = createI18n({
    legacy:false, // 设置为 false，启用 composition API 模式
    messages,
    locale:'en'
});

export default i18n;
