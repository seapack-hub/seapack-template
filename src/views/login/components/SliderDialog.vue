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
import { AuthAPI } from '@/api/system/permission/auth';
import { useUserStore } from '@/store/modules/user';
import { usePermissionStore } from '@/store/modules/permission';

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
  const encryptedPassword = rsaUtil.encrypt(props.loginForm.password);
  if (!encryptedPassword) {
    ElMessage.error('密码加密失败');
    return;
  }
  const params = {
    username:props.loginForm.username,
    password:encryptedPassword
  };
  const res = await loginVerify(params);
  if(res === "登录成功"){
    ElMessage.success('登录成功');
    visible.value = false;
    // 登录成功后拉取权限数据并存入 Pinia
    // getUserInfo 返回 { roles: string[], perms: string[] }
    // 供 v-permission 指令和 usePermission 组合式函数使用
    try {
      const userId = userStore.userInfo.id;
      const authInfo = await AuthAPI.getUserInfo(userId);
      userStore.setAuthInfo({ roles: authInfo.roles, perms: authInfo.perms });
      // 重置动态菜单标记，让路由守卫重新拉取后端菜单
      permissionStore.setDynamicLoaded(false);
    } catch {
      // 后端未部署时降级：赋予管理员全部权限（*:*:*），不阻塞登录
      ElMessage.warning('获取权限信息失败，使用默认权限');
      userStore.setAuthInfo({ roles: ['admin'], perms: ['*:*:*'] });
    }
    setTimeout(() => {
      router.push({ path: '/systemManagement' });
    }, 1000);
  }else{
    ElMessage.error(res);
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
