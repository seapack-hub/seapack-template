<template>
  <!--
    左侧边栏：其他文章列表
    从博客 Store 拉取文章列表（排除当前文章），点击条目跳转到对应文章详情页
  -->
  <aside
    class="flex-shrink-0 w-[260px] h-[100%] bg-white rd-10 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden"
  >
    <!-- 面板标题 -->
    <div class="flex-shrink-0 px-[18px] py-[12px] border-b border-b-[var(--el-border-color-lighter)]">
      <div class="ma-0 text-20px font-600 color-[#303133] flex items-center gap-[6px]">
        <el-icon><Document /></el-icon>
        <span>文章列表</span>
      </div>
    </div>

    <!-- 文章条目列表 -->
    <div v-loading="loading" class="flex-1 overflow-hidden py-[8px]">
      <template v-if="items.length > 0">
        <el-scrollbar class="h-full">
          <div class="flex flex-col gap-10 px-[8px]">
            <div
              v-for="item in items"
              :key="item.id"
              class="article-card px-[18px] py-[12px] cursor-pointer border-l-3 border-l-transparent transition-all-200"
              :class="[item.id === currentId ? 'bg-[#ecf5ff] border-l-[#409eff]' : 'hover:bg-[#f5f7fa]']"
              @click="goArticle(item.id!)"
              @mouseenter="prefetchArticle"
            >
              <div class="mb-[4px]">
                <el-tag :type="item.tagType || 'info'" size="small" effect="plain">{{ item.tag }}</el-tag>
              </div>
              <div class="text-13px font-500 color-[#303133] lh-[1.5] line-clamp-2">
                {{ item.title }}
              </div>
              <div class="text-12px color-[#909399] mt-[4px]">
                {{ item.createTime?.slice(0, 10) }}
              </div>
            </div>
          </div>
        </el-scrollbar>
      </template>
      <el-empty v-else description="暂无文章" :image-size="80" />
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * ArticleList —— 左侧文章列表组件
 *
 * 功能：
 *   1. 挂载时从 Store 拉取文章列表
 *   2. 过滤掉当前正在查看的文章
 *   3. 点击条目跳转到对应文章的详情页
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { Document } from '@element-plus/icons-vue'
import type { Article } from '@/api/blogs/article.ts'

/** 当前文章的 ID，用于高亮排除 */
const props = defineProps<{ currentId: number }>()

const router = useRouter()
const store = useBlogStore()
const loading = ref(false)

/** 过滤后的文章列表（排除当前文章），类型断言确保 id 存在 */
const items = computed(() =>
  store.articles.filter((a: Article): a is Article & { id: number } => !!a.id && a.id !== props.currentId)
)

/** 点击跳转到指定文章详情页 */
function goArticle(id: number) {
  router.push({ name: 'articleDetail', params: { id } })
}

/** 鼠标悬停时预加载文章详情页组件 chunk */
function prefetchArticle() {
  import('@/views/blogs/detail/index.vue')
}

onMounted(async () => {
  loading.value = true
  try {
    await store.fetchArticles({ pageNum: 1, pageSize: 50 })
  } finally {
    loading.value = false
  }
})
</script>
<style lang="scss" scoped>
.article-card{
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  box-sizing: border-box;
}
</style>
