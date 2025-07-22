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
    @opened="handleDialogOpened"
  >
    <SliderCaptcha
      ref="childRef"
      @success="onCaptchaSuccess"
    />
  </el-dialog>
</template>
<script lang="ts" setup>
import { type LoginRequestData } from '@/api/login/types/login.ts';
import {loginVerify} from "@/api/login/index.ts";

const router = useRouter();
const props = defineProps<{
  loginForm: LoginRequestData,
}>()
const visible = defineModel('modelValue', {
  type: Boolean,
  required: true,
  default: false
});

const loading = ref(true);

const childRef = ref();
const onCaptchaSuccess = async (info:any)=>{
  //获取登录参数
  const params = {
    token:info.token,
    sliderX:info.sliderX,
    username:props.loginForm.username,
    password:props.loginForm.password
  };
  const res = await loginVerify(params);
  if(res === "登录成功"){
    await childRef.value?.lastSet(true);
    setTimeout(() => {
      //跳转主页面
      router.push({ path: '/menuTab' });
    }, 1000);
  }else{
    childRef.value?.lastSet(false);
  }
};
// 对话框完全打开后执行
const handleDialogOpened = async () => {
  //开启遮罩
  loading.value = true;
  //初始化
  await childRef.value?.initCaptcha();
  loading.value = false;

};
</script>
<style scoped>
</style>
