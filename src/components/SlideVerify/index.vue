<!-- components/SlideVerify.vue -->
<template>
  <div class="verify-container">
    <slide-verify
      ref="slideVerifyRef"
      :imgs="imgs"
      :slider-text="'向右滑动'"
      :accuracy="2"
      @success="onSuccess"
      @fail="onFail"
      @refresh="onRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import SlideVerify, { type SlideVerifyInstance } from 'vue3-slide-verify';
import 'vue3-slide-verify/dist/style.css'; // 记得引入样式

const slideVerifyRef = ref<SlideVerifyInstance>();
const emit = defineEmits(['success'])
const imgsModels = import.meta.glob('@/assets/images/login/verify/**', { eager: true })
const imgs = Object.values(imgsModels).map((img: any) => img.default)

// 验证成功回调
const onSuccess = () => {
  // 这里可以触发登录接口
  emit('success'); 
};

// 验证失败回调
const onFail = () => {
  ElMessage.error('验证失败，请重试')
  slideVerifyRef?.value?.refresh()
};

// 刷新回调
const onRefresh = () => {
  slideVerifyRef?.value?.refresh()
};
</script>

<style scoped lang="scss">
.verify-container {
  width: 340px;
  margin: 0 auto;
  min-height: 200px; /* 预留高度，防止布局抖动 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  border-radius: 8px;
}
</style>