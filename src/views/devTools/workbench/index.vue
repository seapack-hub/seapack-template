<template>
  <div
    class="relative flex flex-col items-center h-full overflow-hidden
           margin-[-20px] p-20
           bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] via-[#0f3448] to-[#0a1628]"
  >
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="relative z-1 flex justify-center w-full pt-28 pb-16">
      <div class="text-center fade-down">
        <span
          class="inline-flex items-center gap-6 px-18 py-4 rounded-[20px] mb-16
                 text-[13px] tracking-1 color-[#93c5fd]
                 bg-[rgba(59,130,246,0.2)] border border-[rgba(59,130,246,0.3)]"
        >
          <el-icon class="text-[15px]"><Tools /></el-icon>
          开发工具
        </span>
        <h1
          class="text-[38px] font-700 m-0 mb-10 tracking-3
                 bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#34d399] bg-clip-text text-transparent"
        >
          开发者工具集
        </h1>
        <p class="text-[15px] color-[rgba(255,255,255,0.5)] m-0 tracking-1">
          组件封装 · 流程图设计 · ECharts 数据可视化 · 技术文档
        </p>
      </div>
    </div>

    <div class="relative z-1 grid grid-cols-1 sm:grid-cols-2 gap-16 max-w-760px w-full pb-40">
      <FeatureCard
        v-for="(feat, idx) in features"
        :key="feat.name"
        :icon="feat.icon"
        :title="feat.title"
        :desc="feat.desc"
        :color="feat.color"
        :stat="feat.stat"
        :delay="`${idx * 0.1}s`"
        class="min-h-[88px]"
        @click="navigateTo(feat.route)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Tools } from '@element-plus/icons-vue'
import FeatureCard from '@/components/baseComponents/FeatureCard/index.vue'
import { features } from './data'

const router = useRouter()

function navigateTo(path: string) {
  router.push({ path })
}
</script>

<style scoped lang="scss">
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
  animation: orbFloat 10s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  top: -200px;
  left: -100px;
  background: #3B82F6;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  right: -100px;
  background: #8B5CF6;
  animation-delay: -3s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  top: 50%;
  left: 50%;
  background: #06B6D4;
  animation-delay: -6s;
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
