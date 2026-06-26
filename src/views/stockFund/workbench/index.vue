<template>
  <div
    class="home-container relative flex flex-col items-center h-full overflow-hidden
           bg-gradient-to-br from-[#0a1628] via-[#0d2137] via-[#132d45] to-[#0f2027]"
  >
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>
    </div>

    <div class="relative z-1 flex justify-center w-full pt-28 pb-16">
      <div class="text-center fade-down">
        <span
          class="inline-flex items-center gap-6 px-18 py-4 rounded-[20px] mb-16
                 text-[13px] tracking-1 color-[#ef9a9a]
                 bg-[rgba(244,67,54,0.2)] border border-[rgba(244,67,54,0.3)]"
        >
          <el-icon class="text-[15px]"><Coin /></el-icon>
          股票基金
        </span>
        <h1
          class="text-[38px] font-700 m-0 mb-10 tracking-3
                 bg-gradient-to-r from-[#ff8a80] via-[#80deea] to-[#ffcc80] bg-clip-text text-transparent"
        >
          金融数据中心
        </h1>
        <p class="text-[15px] color-[rgba(255,255,255,0.5)] m-0 tracking-1">
          实时行情监控 · 智能投研分析 · 基金信息管理
        </p>
      </div>
    </div>

    <div
      class="relative z-1 flex gap-16 mb-28 fade-down flex-wrap justify-center md:flex-nowrap"
      style="animation-delay: 0.15s"
    >
      <div
        v-for="item in marketData"
        :key="item.label"
        class="flex items-center gap-10 px-18 py-12 rounded-12
               bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]
               backdrop-blur-[8px] transition-colors duration-300
               hover:(bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.15)])"
      >
        <span class="text-[13px] color-[rgba(255,255,255,0.5)] whitespace-nowrap">{{ item.label }}</span>
        <span class="text-[16px] font-600 color-white font-mono">{{ item.value }}</span>
        <span
          class="text-[13px] font-600 font-mono min-w-52 text-right"
          :class="item.change >= 0 ? 'color-[#F44336]' : 'color-[#4CAF50]'"
        >
          {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
        </span>
      </div>
    </div>

    <div class="relative z-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 max-w-900px w-full pb-40">
      <FeatureCard
        v-for="(feat, idx) in features"
        :key="feat.name"
        :icon="feat.icon"
        :title="feat.title"
        :desc="feat.desc"
        :color="feat.color"
        :stat="feat.stat"
        :delay="`${idx * 0.1}s`"
        @click="navigateTo(feat.route)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Coin } from '@element-plus/icons-vue'
import FeatureCard from '@/components/baseComponents/FeatureCard/index.vue'
import { marketData, features } from './data'

const router = useRouter()

function navigateTo(path: string) {
  router.push({ path })
}
</script>

<style scoped lang="scss">
.home-container {
  box-sizing: border-box;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  animation: orbFloat 10s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  top: -200px;
  right: -100px;
  background: #F44336;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  left: -150px;
  background: #00BCD4;
  animation-delay: -3s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  top: 40%;
  left: 60%;
  background: #FF9800;
  animation-delay: -6s;
}

.orb-4 {
  width: 350px;
  height: 350px;
  top: 10%;
  left: -100px;
  background: #4CAF50;
  animation-delay: -8s;
}

.fade-down {
  animation: fadeDown 0.6s ease both;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(40px, -50px) scale(1.1); }
  50% { transform: translate(-30px, 30px) scale(0.9); }
  75% { transform: translate(50px, 40px) scale(1.05); }
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
