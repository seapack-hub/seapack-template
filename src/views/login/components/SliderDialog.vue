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
//import { AuthAPI } from '@/api/system/permission/auth';
import { useUserStore } from '@/store/modules/user';
//import { usePermissionStore } from '@/store/modules/permission';
import { User } from '@/api/types/user.ts';

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
//const permissionStore = usePermissionStore();

const onCaptchaSuccess = async ()=>{
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
    console.log('loginRes', loginRes);

    if (!loginRes || !loginRes.token) {
      ElMessage.error('登录失败：未获取到 Token');
      visible.value = false;
      return;
    }

    // 1. 保存 Token 到 Store 和 localStorage
    userStore.setToken(loginRes.token);

    // 2. 保存用户信息（后端返回的用户基本信息）
    userStore.setUserInfo({
      id: String(loginRes.userId),
      username: loginRes.username,
      nickName: loginRes.nickName,
      email: loginRes.email,
      mobile: loginRes.mobile,
    } as User);

    ElMessage.success('登录成功');
    visible.value = false;

    // 3. 跳转到首页（路由守卫会自动处理后续流程：获取权限、生成菜单等）
    // 使用 replace: true 避免浏览器历史记录中留下登录页
    router.replace({ path: '/systemManagement' });

  } catch (error: any) {
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
