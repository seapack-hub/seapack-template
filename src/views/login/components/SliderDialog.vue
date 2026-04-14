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

const onCaptchaSuccess = async ()=>{
  //加密密码
  const encryptedPassword = rsaUtil.encrypt(props.loginForm.password);
  if (!encryptedPassword) {
    ElMessage.error('密码加密失败');
    return;
  }
  //获取登录参数
  const params = {
    username:props.loginForm.username,
    password:encryptedPassword
  };
  const res = await loginVerify(params);
  if(res === "登录成功"){
    ElMessage.success('登录成功');
    visible.value = false;
    setTimeout(() => {
      //跳转后端
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
