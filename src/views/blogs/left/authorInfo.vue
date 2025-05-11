<template>
  <div class="author-info">
    <div class="author-info-top">
      <!--图片-->
      <img
        class="img-rotate"
        src="@/assets/images/blogs/left/shandao2.jpg"
        alt="闪刀"
        width="100px"
        height="100px"
        style="border-radius: 50%"
      />
      <div class="author-name">烈风逍遥</div>
      <div class="author-motto" text-data="一个迷途的旅人">一个迷途的旅人</div>
      <div class="author-address">
        <!--图标-->
        <SPIcon name="address" size="20px" color="#8a8a8a"></SPIcon>
        <div class="author-address-text">湖北·武汉</div>
      </div>
    </div>
    <!--文章信息-->
    <div class="author-info-middle">
      <div v-for="(item, index) in blogsInfoList" :key="index" class="item">
        <div class="item-name">{{ item.name }}</div>
        <div class="item-number">{{ item.number }}</div>
      </div>
    </div>
    <!--GitHub和掘金-->
    <div class="author-info-footer">
      <div class="jump-icon" @click="jumpToLink('gitHub')">
        <SPIcon name="github" size="20px"></SPIcon>
      </div>
      <div class="jump-icon" @click="jumpToLink('juejin')">
        <SPIcon name="juejin" size="20px"></SPIcon>
      </div>
      <div class="jump-icon" @click="jumpToLink('houtai')">
        <SPIcon name="houtai" size="20px"></SPIcon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const blogsInfoList = ref([]);

blogsInfoList.value = [
  { name: '文章', number: '30' },
  { name: '分类', number: '16' },
  { name: '标签', number: '10' }
];

function jumpToLink(str) {
  if (str === 'gitHub') {
    window.open('https://github.com/seapack-hub', '_blank');
  } else if (str === 'juejin') {
    window.open('https://juejin.cn/user/2071912223613783', '_blank');
  } else {
    router.push({
      path: '/systemManagement'
    });
  }
}
</script>

<style lang="scss" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes changeColor {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
.author-info {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 20px 10px 20px;
  &-top {
    display: flex;
    flex-direction: column;
    align-items: center;

    .img-rotate {
      border: 2px solid gainsboro;
      &:hover {
        animation: rotate 4s infinite;
      }
    }
    .author-name {
      margin-top: 15px;
      font-size: 20px;
      font-weight: 700;
    }
    .author-motto {
      font-size: 15px;
      margin-top: 5px;
      font-family: sans-serif;
      color: #ccc;
      position: relative;
      &::after {
        content: attr(text-data);
        position: absolute;
        white-space: nowrap; /* 加了这行代码，禁止文字换行 */
        top: 0;
        left: 0;
        background: linear-gradient(to right, #8cc9f4, #0396ff);
        -webkit-background-clip: text;
        color: transparent;
        animation: changeColor 6s linear infinite;
      }
    }
    .author-address {
      display: flex;
      align-items: center;
      margin-top: 8px;
      &-text {
        margin-left: 5px;
        font-size: 14px;
        color: #8a8a8a;
        font-family: 黑体;
      }
    }
  }
  &-middle {
    display: flex;
    margin-top: 15px;
    justify-content: space-around;
    .item {
      color: #707070;
      &-name {
        font-size: 14px;
        font-family: cursive;
      }
      &-number {
        font-size: 24px;
        margin-top: 8px;
        color: black;
      }
    }
  }
  &-footer {
    margin-top: 15px;
    display: flex;
    justify-content: space-around;
    .jump-icon {
      width: 100%;
      text-align: center;
      padding: 8px 0 4px 0;
      border-radius: 8px;
      &:hover {
        background-color: #ccc;
      }
    }
  }
}
</style>
