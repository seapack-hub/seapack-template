<template>
  <el-dropdown trigger="hover">
    <div class="user-info">
      <SPIcon name="user" size="20px"></SPIcon>
      <span class="span-user">{{ userInfo?.username || '海峰' }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>用户信息</el-dropdown-item>
        <router-link to="/menuTab">
          <el-dropdown-item>返回首页</el-dropdown-item>
        </router-link>
        <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
//获取用户信息
import { useUserStore } from '@/store/modules/user.ts';
import { useRouter } from 'vue-router';
//信息提示

const userStore = useUserStore();
const router = useRouter();

const userInfo = userStore.userInfo;

/**
 * 退出登录
 */
function logout() {
  router.push({
    path: '/login'
  });
  // ElMessage({
  //   message:h('p', { style: 'line-height: 1; font-size: 14px' }, [
  //     h('span', null, '暂未开发，'),
  //     h('i', { style: 'color: teal' }, '敬请期待！'),
  //   ]),
  // })
}
</script>

<style scoped lang="scss">
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  .span-user {
    display: inline-block;
  }
}
.el-dropdown {
  .el-tooltip__trigger:focus-visible {
    outline: unset;
  }
}
</style>
