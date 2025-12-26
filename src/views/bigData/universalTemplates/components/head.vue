<template>
  <div class="head">
    <h1>大数据可视化</h1>
    <div class="weather">
      <img src="@/views/bigData/universalTemplates/images/weather.png" />
      <span>多云转小雨</span>
      <span class="showTime">{{ currentTime }}</span>
      <span class="go-back m-l-20px" @click="router.go(-1)">返回</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter();
const currentTime = ref('');
const timerId = ref<number | null>(null);

//格式化时间
const formatTime = (date:Date):string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};
//更新时间方法
const updateTime = (): void => {
  currentTime.value = formatTime(new Date());
};

onMounted(() => {
  updateTime();
  timerId.value = window.setInterval(updateTime, 1000);
});

//组件销毁时清空计时器
onBeforeUnmount(() => {
  if (timerId.value !== null) {
    clearInterval(timerId.value);
    timerId.value = null;
  }
});
</script>

<style lang="scss" scoped>
.head{
  height:105px; 
  background: url(../images/head_bg.png) no-repeat center center; 
  background-size: 100% 100%; 
  position: relative; 
  z-index: 100;
  h1{ 
    color:#fff; 
    text-align: center; 
    font-size: 40px; 
    line-height:80px;
  }
  .weather{
    position:absolute; 
    right:30px; 
    top:0; 
    line-height: 75px;
    display: flex;
    align-items: center;
    span{
      color:rgba(255,255,255,.7); 
      font-size: 18px; 
      padding-right: 1px;
    }
  }
}
</style>