<template>
  <el-dropdown trigger="hover" popper-class="user-dropdown-popper">
    <div class="user-info">
      <div class="user-avatar">
        {{ userInfo?.userName?.charAt(0)?.toUpperCase() || 'U' }}
      </div>
      <span class="user-name">{{ userInfo?.userName || '--' }}</span>
      <el-icon class="user-arrow"><ArrowDown /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu class="user-dropdown-menu">
        <div class="dropdown-user-header">
          <div class="dropdown-avatar">{{ userInfo?.userName?.charAt(0)?.toUpperCase() || 'U' }}</div>
          <div class="dropdown-user-info">
            <p class="dropdown-user-name">{{ userInfo?.userName || '--' }}</p>
            <p class="dropdown-user-role">{{ userStore.username === 'admin' ? '管理员' : '普通用户' }}</p>
          </div>
        </div>
        <el-dropdown-item divided>
          <el-icon><User /></el-icon>
          用户信息
        </el-dropdown-item>
        <router-link to="/menuTab">
          <el-dropdown-item>
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-dropdown-item>
        </router-link>
        <el-dropdown-item divided class="logout-item" @click="logout">
          <el-icon><SwitchButton /></el-icon>
          <span style="color: var(--el-color-danger)">退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user.ts';
import { useRouter } from 'vue-router';
import { ArrowDown, User, HomeFilled, SwitchButton } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();

const userInfo = userStore.userInfo;

async function logout() {
  try {
    await userStore.logout();
    ElMessage.success('已成功退出登录');
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
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #6366f1);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  color: var(--el-text-color-primary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.2s;

  .user-info:hover & {
    transform: rotate(180deg);
  }
}
</style>

<style lang="scss">
.user-dropdown-popper {
  padding: 0 !important;
  min-width: 200px;
}

.user-dropdown-menu {
  border: none !important;
  padding: 0 !important;

  .dropdown-user-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .dropdown-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #409EFF, #6366f1);
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .dropdown-user-info {
    .dropdown-user-name {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .dropdown-user-role {
      margin: 2px 0 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    font-size: 13px;

    .el-icon {
      font-size: 15px;
    }
  }

  .logout-item {
    &:hover {
      background-color: var(--el-color-danger-light-9) !important;
    }
  }
}
</style>
