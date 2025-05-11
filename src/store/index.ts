import { createPinia } from 'pinia';

//Pinia状态持久化,配置持久化的数据会存到 localStore里。
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
export default pinia;
