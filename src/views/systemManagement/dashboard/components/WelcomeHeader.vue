<!-- ============================================================
  WelcomeHeader 欢迎横幅组件
  展示用户头像、基于时段的动态问候语、当前日期和星期，
  右侧提供股票行情、用户管理、系统设置三个快捷按钮。
  ============================================================ -->
<template>
  <!-- 渐变背景的欢迎卡片 -->
  <el-card class="welcome-card" shadow="hover">
    <div class="welcome-content">
      <!-- 左侧：头像 + 问候文本 -->
      <div class="welcome-left">
        <!-- 头像区域，含在线状态徽标 -->
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
          <!-- 根据时段动态生成问候语 -->
          <h2 class="greeting">{{ greeting }}</h2>
          <p class="sub-text">
            <!-- 当前日期 -->
            <span class="date-text">{{ currentDate }}</span>
            <el-divider direction="vertical" />
            <!-- 当前星期 -->
            <span class="week-text">{{ currentWeek }}</span>
          </p>
        </div>
      </div>
      <!-- 右侧：快速操作按钮组 -->
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
/**
 * 欢迎横幅脚本
 * 计算动态问候语、格式化当前日期和星期
 */
import { DataAnalysis, User, Setting, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

/** Vue Router 实例，供按钮点击跳转使用 */
const router = useRouter()

/** 当前时间对象，用于计算问候语 */
const now = new Date()
/** 当前小时数（0-23） */
const hours = now.getHours()

/**
 * 根据当前时段返回不同的问候文案
 * 6-8点: 早晨; 8-12点: 上午; 12-18点: 下午; 18-24点: 晚上; 其余: 深夜
 */
const greeting = computed(() => {
  if (hours >= 6 && hours < 8) return '晨起披衣出草堂，轩窗已自喜微凉🌅'
  if (hours >= 8 && hours < 12) return '上午好，烈风逍遥！'
  if (hours >= 12 && hours < 18) return '下午好，烈风逍遥！'
  if (hours >= 18 && hours < 24) return '晚上好，烈风逍遥！'
  return '夜深了，注意休息🌙'
})

/** 格式化当前日期为 YYYY-MM-DD 格式 */
const currentDate = computed(() => {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

/** 星期映射表 */
const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
/** 当前星期中文名 */
const currentWeek = weekDays[now.getDay()]
</script>

<style lang="scss" scoped>
/**
 * 欢迎卡片：紫蓝渐变背景、圆角、白色文字
 */
.welcome-card {
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  :deep(.el-card__body) {
    padding: 24px 32px;
  }
}

/**
 * 欢迎区域布局：左右 flex 分布，垂直居中
 */
.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/**
 * 左侧区域：头像 + 文本水平排列
 */
.welcome-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

/**
 * 头像容器：相对定位，徽章绝对定位在右下角
 */
.avatar-wrapper {
  position: relative;
  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    object-fit: cover;
  }
  /** 绿色在线状态徽标 */
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

/**
 * 问候文本样式
 */
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

/**
 * 右侧快捷按钮区域
 */
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
