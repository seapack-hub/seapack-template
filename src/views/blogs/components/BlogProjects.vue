<template>
  <div class="h-full flex flex-col border-l-1 border-#e4e7ed pl-20px">
    <h2 class="text-20px font-700 color-#1a1a2e m-0 mb-16px flex-shrink-0">开源项目</h2>
    <div class="flex-1 overflow-y-auto flex flex-col gap-12px">
      <div
        v-for="project in projects"
        :key="project.name"
        class="bg-white rounded-12px p-16px flex items-center gap-12px cursor-pointer transition-all duration-200 border-1 border-#e8e8e8"
        @click="openLink(project.url)"
        @mouseenter="($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = ''"
      >
        <div class="w-44px h-44px rounded-12px flex items-center justify-center flex-shrink-0" :style="{ background: project.bgColor }">
          <SPIcon :name="project.icon" :size="24" :color="project.color" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="m-0 mb-3px text-14px font-600 color-#303133">{{ project.name }}</h4>
          <p class="m-0 text-12px color-#909399 truncate">{{ project.desc }}</p>
        </div>
        <el-icon class="color-#c0c4cc flex-shrink-0"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { projects, openLink } from '../data'
</script>
