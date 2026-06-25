<template>
  <el-dropdown trigger="hover">
    <div class="user-info">
      <SPIcon name="user" size="20px"></SPIcon>
      <span class="span-user">{{ userInfo?.userName || '--' }}</span>
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
 * 调用 UserStore 的 logout 方法，清除 Token、用户信息和权限状态
 */
async function logout() {
  try {
    // 调用 store 中的登出方法（清除 Token、用户信息、权限等）
    await userStore.logout();

    // 提示用户已退出
    ElMessage.success('已成功退出登录');

    // 跳转到登录页
    router.replace({ path: '/login' });
  } catch (error) {
    router.replace({ path: '/errorPage' });
    // eslint-disable-next-line no-console
    console.error('退出登录失败:', error);
    ElMessage.error('退出登录失败，请稍后重试');
  }
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
