<template>
  <div class="error-page">
    <div class="error-page__content">
      <div class="error-page__illustration">
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="90" r="70" class="circle-bg" />
          <text x="120" y="100" text-anchor="middle" dominant-baseline="central" class="error-code">404</text>
          <g class="magnifier">
            <circle cx="128" cy="68" r="18" stroke="currentColor" stroke-width="3" fill="none" />
            <line x1="140" y1="80" x2="156" y2="96" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </g>
          <g class="dots">
            <circle cx="55" cy="55" r="3" class="dot" />
            <circle cx="190" cy="45" r="4" class="dot" />
            <circle cx="175" cy="150" r="3" class="dot" />
            <circle cx="65" cy="155" r="4" class="dot" />
          </g>
        </svg>
      </div>
      <h1 class="error-page__title">页面未找到</h1>
      <p class="error-page__desc">抱歉，您访问的页面不存在或已被移除。<br />请检查网址是否正确，或返回首页。</p>
      <el-button type="primary" size="large" @click="goHome">
        <el-icon style="margin-right: 6px"><HomeFilled /></el-icon>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()

function goHome() {
  router.push('/')
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
      fill: #f0f5ff;
      stroke: #d6e4ff;
      stroke-width: 1;
    }

    .error-code {
      font-size: 48px;
      font-weight: 700;
      fill: #409eff;
      font-family: 'Segoe UI', 'PingFang SC', system-ui, sans-serif;
    }

    .magnifier {
      color: #a0cfff;
    }

    .dot {
      fill: #d6e4ff;
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
}

@keyframes float {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-6px); opacity: 1; }
}
</style>