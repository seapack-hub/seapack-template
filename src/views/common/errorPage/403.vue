<template>
  <div class="error-page">
    <div class="error-page__content">
      <div class="error-page__illustration">
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="90" r="70" class="circle-bg" />
          <text x="120" y="100" text-anchor="middle" dominant-baseline="central" class="error-code">403</text>
          <g class="forbidden">
            <rect x="100" y="55" width="40" height="50" rx="4" stroke="currentColor" stroke-width="2.5" fill="none" />
            <line x1="102" y1="57" x2="138" y2="103" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            <circle cx="120" cy="105" r="3" fill="currentColor" />
          </g>
          <g class="dots">
            <circle cx="55" cy="55" r="3" class="dot" />
            <circle cx="190" cy="45" r="4" class="dot" />
            <circle cx="175" cy="150" r="3" class="dot" />
            <circle cx="65" cy="155" r="4" class="dot" />
          </g>
        </svg>
      </div>
      <h1 class="error-page__title">权限不足</h1>
      <p class="error-page__desc">抱歉，您没有访问此页面的权限。<br />请联系管理员获取相应权限。</p>
      <div class="error-page__actions">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon style="margin-right: 6px"><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()

function goHome() {
  router.push('/menuTab')
}

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 40px 20px;

  &__content {
    text-align: center;
    max-width: 460px;
  }

  &__illustration {
    width: 240px;
    height: 200px;
    margin: 0 auto 32px;

    svg {
      width: 100%;
      height: 100%;
    }

    .circle-bg {
      fill: #fef0f0;
      stroke: #fde2e2;
      stroke-width: 1;
    }

    .error-code {
      font-size: 48px;
      font-weight: 700;
      fill: #f56c6c;
      font-family: 'Segoe UI', 'PingFang SC', system-ui, sans-serif;
    }

    .forbidden {
      color: #f56c6c;
    }

    .dot {
      fill: #fde2e2;
      animation: float 3s ease-in-out infinite;

      &:nth-child(2) { animation-delay: 0.6s; }
      &:nth-child(3) { animation-delay: 1.2s; }
      &:nth-child(4) { animation-delay: 1.8s; }
    }
  }

  &__title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px;
  }

  &__desc {
    font-size: 15px;
    line-height: 1.7;
    color: #909399;
    margin: 0 0 32px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-6px); opacity: 1; }
}
</style>
