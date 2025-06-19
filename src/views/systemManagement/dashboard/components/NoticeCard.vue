<template>
  <el-card>
    <template #header>
      <div class="notice-header">
        <div class="flex-y-center">
          通知公告
        </div>
        <el-link type="primary">
          <span class="text-xs">查看更多</span>
          <el-icon class="text-xs">
            <ArrowRight />
          </el-icon>
        </el-link>
      </div>
    </template>

    <el-scrollbar height="400px">
      <div
        v-for="(item, index) in notices"
        :key="index"
        class="notice-item flex-y-center py-4"
      >
        <el-text
          truncated
          class="text !text-gray"
        >
          {{ item.title }}
        </el-text>
        <el-link>
          <el-icon class="text-sm">
            <View />
          </el-icon>
        </el-link>
      </div>
    </el-scrollbar>
  </el-card>
</template>
 
 <script setup>
 const notices = ref([
  {title:"消息一"},
  {title:"222222222"},
  {title:"以色列进攻伊朗"},
  {title:"俄乌战场传来最新消息"},
  {title:"666666666"},
 ])
 </script>
 
<style lang="scss" scoped>
.notice-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.notice-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .text{
    color:gray;
  }
}
</style>