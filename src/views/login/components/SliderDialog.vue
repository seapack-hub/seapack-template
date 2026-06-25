<template>
  <el-dialog
    v-model="visible"
    width="370px"
    custom-class="slider-dialog"
    style="padding:0;border-radius:5px"
    :show-close="false"
    append-to-body
    :modal="loading"
    :modal-append-to-body="true"
  >
    <SlideVerify
      ref="childRef"
      @success="onCaptchaSuccess"
    />
  </el-dialog>
</template>
<script lang="ts" setup>
import { type LoginRequestData } from '@/api/login/types/login.ts';
import {loginVerify,getPublicKey} from "@/api/login/index.ts";
import { RsaUtil } from "@/utils/jsencrypt.ts";
import { UserAPI } from "@/api/system/user";
import { useUserStore } from '@/store/modules/user';
import { usePermissionStore } from '@/store/modules/permission'

const router = useRouter();
const props = defineProps<{
  loginForm: LoginRequestData,
}>()
const visible = defineModel('modelValue', {
  type: Boolean,
  required: true,
  default: false
});
const rsaUtil = new RsaUtil();
const loading = ref(true);
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const onCaptchaSuccess = async ()=>{
  //密码加密
  const encryptedPassword = rsaUtil.encrypt(props.loginForm.password);
  if (!encryptedPassword) {
    ElMessage.error('密码加密失败');
    return;
  }
  const params = {
    username:props.loginForm.username,
    password:encryptedPassword
  };

  try {
    // 调用后端登录接口，返回 { token, userId, username, nickName, email, mobile }
    const loginRes = await loginVerify(params);

    if (!loginRes || !loginRes.token) {
      ElMessage.error('登录失败：未获取到 Token');
      visible.value = false;
      return;
    }
    // 1. 保存 Token 到 Store 和 localStorage
    userStore.setToken(loginRes.token);
    // 2. 根据用户ID查询用户详情信息并保存
    const userInfo = await UserAPI.getUserInfo(String(loginRes.userId))
    userStore.setUserInfo(userInfo);

    // 3. 调用接口，获取用户权限信息并赋值
    userStore.fetchAuthPerms(String(loginRes.userId))
    
    // 路由已在启动时全量加载，只需收集列表供侧边栏使用
    permissionStore.collectRoutes()

    ElMessage.success('登录成功');
    visible.value = false;
    // 跳转到工作台模块选择页
    router.replace({ path: '/menuTab' });

  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('登录失败:', error);
    ElMessage.error(error?.message || '登录失败，请稍后重试');
    visible.value = false;
  }
};

//获取公钥
const searchPublicKey = async ()=>{
  const res = await getPublicKey();
  if(res.publicKey){
    rsaUtil.setPublicKey(res.publicKey);
  }
}

onMounted(()=>{
  searchPublicKey();
})
</script>
<style scoped>
</style>
