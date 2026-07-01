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
          @click="switchTab(tab.key)"
        >{{ tab.label }}</span>
      </div>
    </div>
    <div class="flex-1 overflow-hidden flex flex-col">
      <el-carousel v-if="articleChunks.length > 0" height="100%" indicator-position="outside" arrow="always" class="flex-1">
        <el-carousel-item v-for="chunk in articleChunks" :key="chunk.key">
          <div class="flex flex-wrap justify-center items-stretch gap-16px h-full py-4px">
            <div
              v-for="item in chunk.items" :key="item.id"
              class="bg-white rounded-12px cursor-pointer transition-all duration-250 flex flex-col border-1 border-#e8e8e8"
              style="width: calc((100% - 48px) / 4); min-width: 220px;"
              @click="openDetail(item.id)"
              @mouseenter="($event.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; ($event.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'"
              @mouseleave="($event.currentTarget as HTMLElement).style.transform = ''; ($event.currentTarget as HTMLElement).style.boxShadow = ''"
            >
              <div class="h-120px flex items-center justify-center flex-shrink-0" :style="{ background: item.coverBg }">
                <span class="text-42px">{{ item.icon }}</span>
              </div>
              <div class="p-14px 16px flex-1 flex flex-col">
                <div class="flex items-center gap-8px mb-8px">
                  <el-tag :type="item.tagType as any" size="small" effect="plain">{{ item.tag }}</el-tag>
                  <span class="text-14px color-#c0c4cc">{{ item.date }}</span>
                </div>
                <h3 class="m-0 mb-6px text-17px font-600 color-#1a1a2e">{{ item.title }}</h3>
                <p class="m-0 mb-10px text-15px color-#909399 flex-1">{{ item.desc }}</p>
                <div class="flex justify-between items-center flex-shrink-0">
                  <span class="text-12px color-#c0c4cc flex items-center gap-4px"><el-icon><View /></el-icon> {{ item.views }}</span>
                  <span class="text-13px color-#409eff flex items-center gap-4px font-500">阅读全文 <el-icon><ArrowRight /></el-icon></span>
                </div>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div v-else class="flex-1 flex items-center justify-center color-#c0c4cc">暂无文章</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { CategoryAPI } from '@/api/blogs/category.ts'
import { View, ArrowRight } from '@element-plus/icons-vue'

const store = useBlogStore()
const router = useRouter()
const activeTab = ref('')
const tabs = ref<{ key: string; label: string }[]>([])

interface ArticleDisplay {
  id: number; title: string; desc: string; tag: string
  tagType: string; category: string; date: string; views: string
  icon: string; coverBg: string
}

const articles = ref<ArticleDisplay[]>([])

const filteredArticles = computed(() => {
  if (activeTab.value === '')
    return articles.value
  return articles.value.filter(a => a.category === activeTab.value)
})

const PER_PAGE = 4
const articleChunks = computed(() => {
  const chunks: { key: string; items: ArticleDisplay[] }[] = []
  for (let i = 0; i < filteredArticles.value.length; i += PER_PAGE) {
    chunks.push({ key: `page-${i / PER_PAGE}`, items: filteredArticles.value.slice(i, i + PER_PAGE) })
  }
  return chunks
})

function switchTab(key: string) {
  activeTab.value = key
  store.setCategory(key)
}

function openDetail(id: number) {
  router.push(`/blogsManagement/article/${id}`)
}

watch(() => store.articles, (val) => {
  articles.value = val.map(a => ({
    id: a.id!,
    title: a.title,
    desc: a.summary,
    tag: a.tag,
    tagType: a.tagType,
    category: a.category,
    date: a.createTime ? a.createTime.slice(0, 10) : '',
    views: a.viewCount > 1000 ? (a.viewCount / 1000).toFixed(1) + 'k' : String(a.viewCount),
    icon: a.coverIcon,
    coverBg: a.coverColor,
  }))
}, { immediate: true })

onMounted(async () => {
  await store.fetchArticles()
  const cats = await CategoryAPI.getList()
  tabs.value = [{ key: '', label: '全部' }, ...(cats || []).map(c => ({ key: c.dictCode, label: c.dictName }))]
})
</script>

<style scoped>
:deep(.el-carousel) { flex: 1; }
:deep(.el-carousel__container) { height: calc(100% - 32px) !important; }
</style>
