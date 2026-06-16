<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center flex-shrink-0 mb-16px">
      <h2 class="text-20px font-700 color-#1a1a2e m-0">最新文章</h2>
      <div class="flex gap-4px bg-white rounded-24px p-3px shadow-sm flex-wrap">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          class="px-16px py-5px rounded-20px text-13px color-#606266 cursor-pointer transition-all duration-200 select-none"
          :class="activeTab === tab.key ? 'bg-#409eff color-white font-500' : 'hover:color-#409eff'"
          @click="activeTab = tab.key"
        >{{ tab.label }}</span>
      </div>
    </div>

    <div class="flex-1 overflow-hidden flex flex-col">
      <el-carousel v-if="filteredArticles.length > 0" height="100%" indicator-position="outside" arrow="always" class="flex-1">
        <el-carousel-item v-for="chunk in articleChunks" :key="chunk.key">
          <div class="flex flex-wrap justify-center items-stretch gap-16px h-full py-4px">
            <div
              v-for="article in chunk.items"
              :key="article.id"
              class="bg-white rounded-12px cursor-pointer transition-all duration-250 flex flex-col border-1 border-#e8e8e8"
              style="width: calc((100% - 48px) / 4); min-width: 220px;"
              @click="openLink(article.link)"
              @mouseenter="($event.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; ($event.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'"
              @mouseleave="($event.currentTarget as HTMLElement).style.transform = ''; ($event.currentTarget as HTMLElement).style.boxShadow = ''"
            >
              <div class="h-120px flex items-center justify-center flex-shrink-0" :style="{ background: article.coverBg }">
                <span class="text-42px">{{ article.icon }}</span>
              </div>
              <div class="p-14px 16px flex-1 flex flex-col">
                <div class="flex items-center gap-8px mb-8px">
                  <el-tag :type="article.tagType" size="small" effect="plain">{{ article.tag }}</el-tag>
                  <span class="text-14px color-#c0c4cc">{{ article.date }}</span>
                </div>
                <h3 class="m-0 mb-6px text-17px font-600 color-#1a1a2e">{{ article.title }}</h3>
                <p class="m-0 mb-10px text-15px color-#909399 flex-1">{{ article.desc }}</p>
                <div class="flex justify-between items-center flex-shrink-0">
                  <span class="text-12px color-#c0c4cc flex items-center gap-4px">
                    <el-icon><View /></el-icon> {{ article.views }}
                  </span>
                  <span class="text-13px color-#409eff flex items-center gap-4px font-500">
                    阅读全文 <el-icon><ArrowRight /></el-icon>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <div class="text-center mt-12px flex-shrink-0">
        <el-button round @click="openLink('https://juejin.cn/user/2071912223613783')">
          <el-icon><Connection /></el-icon>
          查看更多 →
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Connection, View, ArrowRight } from '@element-plus/icons-vue'
import { tabs, useFilteredArticles, openLink } from '../data'

const activeTab = ref('all')
const filteredArticles = useFilteredArticles(activeTab)

const PER_PAGE = 4

const articleChunks = computed(() => {
  const chunks: { key: string; items: any[] }[] = []
  for (let i = 0; i < filteredArticles.value.length; i += PER_PAGE) {
    chunks.push({ key: `page-${i / PER_PAGE}`, items: filteredArticles.value.slice(i, i + PER_PAGE) })
  }
  return chunks
})
</script>

<style scoped>
:deep(.el-carousel) { flex: 1; }
:deep(.el-carousel__container) { height: calc(100% - 32px) !important; }
</style>
