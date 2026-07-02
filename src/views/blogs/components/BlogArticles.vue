<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center flex-shrink-0 mb-16px">
      <h2 class="text-20px font-700 color-#1a1a2e m-0">最新文章</h2>
      <div class="tab-card flex gap-4px bg-white p-3px shadow-sm flex-wrap">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          class="px-16px py-5px rounded-4px text-13px color-#606266 cursor-pointer transition-all duration-200 select-none"
          :class="activeTab === tab.key ? 'bg-#409eff color-white font-500' : 'hover:color-#409eff'"
          @click="switchTab(tab.key)"
        >{{ tab.label }}</span>
      </div>
    </div>
    <div class="flex-1 overflow-hidden flex flex-col">
      <el-carousel v-if="articleChunks.length > 0" height="100%" indicator-position="outside" arrow="always" class="flex-1">
        <el-carousel-item v-for="chunk in articleChunks" :key="chunk.key">
          <div class="grid grid-cols-4 gap-16px h-full p-10 box-border content-start">
            <div
              v-for="item in chunk.items" :key="item.id"
              class="article-card bg-white cursor-pointer flex flex-col overflow-hidden"
              @click="openDetail(item.id)"
            >
              <div class="h-100px flex items-center justify-center flex-shrink-0" :style="{ background: item.coverBg }">
                <span class="text-36px">{{ item.icon }}</span>
              </div>
              <div class="p-12px flex-1 flex flex-col min-h-0">
                <div class="flex items-center gap-6px mb-6px">
                  <el-tag :type="item.tagType as any" size="small" effect="plain">{{ item.tag }}</el-tag>
                  <span class="text-12px color-#c0c4cc">{{ item.date }}</span>
                </div>
                <h3 class="m-0 mb-4px text-15px font-600 color-#1a1a2e line-clamp-1">{{ item.title }}</h3>
                <p class="m-0 text-13px color-#909399 flex-1 line-clamp-2 lh-1.5">{{ item.desc }}</p>
                <div class="flex justify-between items-center flex-shrink-0 mt-8px">
                  <span class="text-12px color-#c0c4cc flex items-center gap-3px"><el-icon :size="12"><View /></el-icon> {{ item.views }}</span>
                  <span class="text-12px color-#409eff flex items-center gap-3px font-500">阅读全文 <el-icon :size="12"><ArrowRight /></el-icon></span>
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

const PER_PAGE = 8
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

<style scoped lang="scss">
.tab-card{
  border-radius: 10px;
  border: 1px solid #eee;
  box-sizing: border-box;
}
.article-card{
  border-radius: 10px;
  border: 1px solid #eee;
  box-sizing: border-box;
  transition: all 0.25s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.08);
    border-color: #d0d0d0;
  }
}
:deep(.el-carousel) { 
  flex: 1; 
}
:deep(.el-carousel__container) { 
  height: calc(100% - 32px) !important; 
  padding: 4px;
}
:deep(.el-carousel__item) { 
  border-radius: 0; 
}
</style>
