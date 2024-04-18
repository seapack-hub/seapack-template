//引入vue-i18n
import {createI18n} from 'vue-i18n';

import {useStorage} from "@vueuse/core"

import appConfig from "@/config/app.ts";

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
    },
    'en-US': {
        ...en
    }
};
const storageLanguage = useStorage("storageLanguage",appConfig.language)
const i18n = createI18n({
    legacy:false, // 设置为 false，启用 composition API 模式
    messages,
    locale:storageLanguage.value,
    globalInjection: true
});

export default i18n;
