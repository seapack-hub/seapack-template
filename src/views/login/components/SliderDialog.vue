<template>
  <el-dialog
    v-model="visible"
    width="370px"
    custom-class="slider-dialog"
    style="padding:0;border-radius:5px"
    :show-close="false"
    append-to-body
  >
    <SliderCaptcha
      @success="onCaptchaSuccess"
    />
  </el-dialog>
</template>
<script lang="ts" setup>
import { type LoginRequestData } from '@/api/login/types/login.ts';
import {loginVerify} from "@/api/login/index.ts";
const props = defineProps<{
  loginForm: LoginRequestData,
}>()
const visible = defineModel('modelValue', {
  type: Boolean,
  required: true,
  default: false
});
const onCaptchaSuccess = async (info:any)=>{
  //获取登录参数
  const params = {
    token:info.token,
    sliderX:info.sliderX,
    username:props.loginForm.username,
    password:props.loginForm.password
  };
  const res = await loginVerify(params)
  console.log('--登录接口校验--',res)
};
</script>
<style scoped>
</style>
