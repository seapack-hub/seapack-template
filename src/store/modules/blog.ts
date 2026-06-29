/**
 * blog —— 博客 Pinia store
 *
 * 职责：
 *   1. 管理文章列表状态（分页、加载、分类筛选）
 *   2. 管理项目列表状态
 *   3. 提供文章的增删改查方法
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ArticleAPI, type Article, type ArticleQuery } from '@/api/blogs/article.ts'
import { ProjectAPI, type Project } from '@/api/blogs/project.ts'

export const useBlogStore = defineStore('blog', () => {

  // ===== 文章状态 =====
  const articles = ref<Article[]>([])           // 当前页文章列表
  const total = ref(0)                          // 文章总数
  const loading = ref(false)                    // 列表加载状态
  const query = ref<ArticleQuery>({ pageNum: 1, pageSize: 10, category: 'all' })

  // ===== 项目状态 =====
  const projects = ref<Project[]>([])           // 项目列表
  const projectsLoading = ref(false)

  /** 当前文章列表（仅读） */
  const articleList = computed(() => articles.value)
  /** 当前项目列表（仅读） */
  const projectList = computed(() => projects.value)

  /** 获取文章列表 */
  async function fetchArticles(params?: ArticleQuery) {
    loading.value = true
    try {
      if (params) query.value = { ...query.value, ...params }
      const res = await ArticleAPI.getPage(query.value)
      articles.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  /** 根据 ID 获取文章详情 */
  async function fetchArticleById(id: number): Promise<Article | null> {
    try {
      return await ArticleAPI.getDetail(id)
    } catch {
      return null
    }
  }

  /** 新增文章（成功后自动刷新列表） */
  async function createArticle(data: Partial<Article>) {
    await ArticleAPI.create(data)
    await fetchArticles()
  }

  /** 更新文章（成功后自动刷新列表） */
  async function updateArticle(id: number, data: Partial<Article>) {
    await ArticleAPI.update(id, data)
    await fetchArticles()
  }

  /** 删除文章（成功后自动刷新列表） */
  async function deleteArticle(id: number) {
    await ArticleAPI.delete(id)
    await fetchArticles()
  }

  /** 获取项目列表 */
  async function fetchProjects() {
    projectsLoading.value = true
    try {
      const res = await ProjectAPI.getList()
      projects.value = res || []
    } finally {
      projectsLoading.value = false
    }
  }

  /** 切换页码 */
  function setPage(pageNum: number) {
    query.value.pageNum = pageNum
    fetchArticles()
  }

  /** 切换分类筛选 */
  function setCategory(category: string) {
    query.value.category = category
    query.value.pageNum = 1
    fetchArticles()
  }

  return {
    articles, total, loading, query,
    articleList, projects, projectsLoading, projectList,
    fetchArticles, fetchArticleById,
    createArticle, updateArticle, deleteArticle,
    fetchProjects, setPage, setCategory,
  }
})
