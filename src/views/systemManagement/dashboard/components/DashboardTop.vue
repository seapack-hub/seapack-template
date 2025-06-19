<template>
  <el-card class="container-top">
    <el-row>
      <el-col :span="16">
        <div class="container-top-left">
          <img
            class="img-rotate"
            alt="闪刀"
            width="80px"
            height="80px"
            style="border-radius: 50%"
            src="@/assets/images/blogs/left/shandao2.jpg"
          />
          <div>
            <p>{{ greetings }}</p>
            <p class="left-text">
              今日天气晴朗，气温在15℃至25℃之间，东南风。
            </p>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <el-row
          class="container-top-right"
          :gutter="10"
        >
          <!--仓库-->
          <el-col :span="10">
            <div
              class="icon-title"
              style="color: #ff9a2e"
            >
              <el-icon>
                <Folder />
              </el-icon>
              仓库
            </div>
            <div class="mt-3">
              <div
                v-for="(item, index) in warehouseList"
                :key="index"
                style="display: inline-block"
              >
                <el-link
                  :href="item.href"
                  target="_blank"
                >
                  <SPIcon
                    :name="item.svgIcon"
                    size="20px"
                    :color="item.color"
                  ></SPIcon>
                </el-link>
                <el-divider
                  v-if="index != warehouseList.length - 1"
                  direction="vertical"
                />
              </div>
            </div>
          </el-col>
          <!--文档-->
          <el-col :span="10">
            <div
              class="icon-title"
              style="color: #4080ff"
            >
              <el-icon class="mr-2px">
                <Document />
              </el-icon>
              文档
            </div>
            <div class="mt-3">
              <div
                v-for="(item, index) in documentList"
                :key="index"
                style="display: inline-block"
              >
                <el-link
                  :href="item.href"
                  target="_blank"
                >
                  <SPIcon
                    :name="item.svgIcon"
                    size="20px"
                    :color="item.color"
                  ></SPIcon>
                </el-link>
                <el-divider
                  v-if="index != documentList.length - 1"
                  direction="vertical"
                />
              </div>
            </div>
          </el-col>
          <!--视频-->
          <el-col :span="4">
            <div
              class="icon-title"
              style="color: #f76560"
            >
              <el-icon class="mr-2px">
                <VideoCamera />
              </el-icon>
              视频
            </div>
            <div class="mt-3">
              <div
                v-for="(item, index) in videoList"
                :key="index"
                style="display: inline-block"
              >
                <el-link
                  :href="item.href"
                  target="_blank"
                >
                  <SPIcon
                    :name="item.svgIcon"
                    size="20px"
                    :color="item.color"
                  ></SPIcon>
                </el-link>
                <el-divider
                  v-if="index != videoList.length - 1"
                  direction="vertical"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>
<script setup lang="ts">
//仓库列表
const warehouseList = ref([
  { svgIcon: 'gitee', href: 'https://gitee.com/zenghaifenga/seapack-template', color: '#f76560' },
  { svgIcon: 'github', href: 'https://github.com/seapack-hub', color: '#4080ff' }
]);

//文档列表
const documentList = ref([
  { svgIcon: 'juejin', href: 'https://juejin.cn/user/2071912223613783/posts', color: '#4080ff' },
  { svgIcon: 'csdn', href: 'https://blog.csdn.net/seapackk?spm=1010.2135.3001.10640', color: '' },
  { svgIcon: 'zhihu', href: 'https://www.zhihu.com/people/lie-feng-xiao-yao/posts', color: '' }
]);

//视频列表
const videoList = ref([{ svgIcon: 'bilibili', href: 'https://www.bilibili.com/video/BV1eFUuYyEFj', color: '' }]);

const date: Date = new Date();
const greetings = computed(() => {
  const hours = date.getHours();
  if (hours >= 6 && hours < 8) {
    return '晨起披衣出草堂，轩窗已自喜微凉🌅！';
  } else if (hours >= 8 && hours < 12) {
    return '上午好，' + '烈风逍遥' + '！';
  } else if (hours >= 12 && hours < 18) {
    return '下午好，' + '烈风逍遥' + '！';
  } else if (hours >= 18 && hours < 24) {
    return '晚上好，' + '烈风逍遥' + '！';
  } else {
    return '偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！';
  }
});
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
.container-top {
  &-left {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 20px;
    .img-rotate {
      border: 2px solid gainsboro;
      &:hover {
        animation: rotate 4s infinite;
      }
    }
    .left-text {
      color: gray;
    }
  }
  &-right {
    height: 80px;
    display: flex;
    align-items: center;
    .icon-title {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
}
</style>
