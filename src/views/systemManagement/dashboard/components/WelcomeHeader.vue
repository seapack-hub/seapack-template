<template>
  <el-card class="welcome-card" shadow="hover">
    <div class="welcome-content">
      <div class="welcome-left">
        <div class="avatar-wrapper">
          <img
            class="avatar"
            alt="avatar"
            src="@/assets/images/blogs/left/shandao2.jpg"
          />
          <div class="avatar-badge">
            <el-icon :size="12"><Check /></el-icon>
          </div>
        </div>
        <div class="welcome-text">
          <h2 class="greeting">{{ greeting }}</h2>
          <p class="sub-text">
            <span class="date-text">{{ currentDate }}</span>
            <el-divider direction="vertical" />
            <span class="week-text">{{ currentWeek }}</span>
          </p>
        </div>
      </div>
      <div class="welcome-right">
        <div class="quick-actions">
          <el-button type="primary" :icon="DataAnalysis" @click="router.push('/stockQuote')">
            股票行情
          </el-button>
          <el-button type="success" :icon="User" @click="router.push('/user')">
            用户管理
          </el-button>
          <el-button type="warning" :icon="Setting" @click="router.push('/role')">
            系统设置
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { DataAnalysis, User, Setting, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const now = new Date()
const hours = now.getHours()

const greeting = computed(() => {
  if (hours >= 6 && hours < 8) return '晨起披衣出草堂，轩窗已自喜微凉🌅'
  if (hours >= 8 && hours < 12) return '上午好，烈风逍遥！'
  if (hours >= 12 && hours < 18) return '下午好，烈风逍遥！'
  if (hours >= 18 && hours < 24) return '晚上好，烈风逍遥！'
  return '夜深了，注意休息🌙'
})

const currentDate = computed(() => {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const currentWeek = weekDays[now.getDay()]
</script>

<style lang="scss" scoped>
.welcome-card {
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  :deep(.el-card__body) {
    padding: 24px 32px;
  }
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  position: relative;
  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    object-fit: cover;
  }
  .avatar-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    background: #67c23a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
    color: #fff;
  }
}

.welcome-text {
  .greeting {
    margin: 0 0 6px 0;
    font-size: 22px;
    font-weight: 600;
  }
  .sub-text {
    margin: 0;
    font-size: 14px;
    opacity: 0.85;
  }
  .date-text,
  .week-text {
    font-size: 13px;
  }
}

.welcome-right {
  .quick-actions {
    display: flex;
    gap: 10px;
    :deep(.el-button) {
      border-radius: 8px;
      font-size: 13px;
    }
  }
}
</style>
