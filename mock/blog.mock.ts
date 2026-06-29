/**
 * 博客模块 Mock 数据
 * 提供文章和项目的 CRUD 模拟接口，开发阶段替代后端 API
 */
import { MockMethod } from 'vite-plugin-mock';

// ===== 6 篇模拟文章 =====
const articles = [
  { id: 1, title: 'Vue3 + Element Plus 实现企业级权限管理系统', summary: '从零搭建基于 RBAC 模型的后台管理系统，包含用户、角色、菜单权限的完整 CRUD 与动态路由加载。', contentMd: '# Vue3 + Element Plus 权限系统\n\n## 项目介绍\n\n从零搭建基于 RBAC 模型的后台管理系统...', contentHtml: '<h1>Vue3 + Element Plus 权限系统</h1><h2>项目介绍</h2><p>从零搭建基于 RBAC 模型的后台管理系统...</p>', category: 'vue', tag: 'Vue3', tagType: '', coverIcon: '🔐', coverColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', status: 1, viewCount: 1200, likeCount: 86, isTop: 1, createTime: '2025-06-10 10:00:00', updateTime: '2025-06-10 10:00:00' },
  { id: 2, title: 'RAG + LLM + SpringBoot 实现企业私有智能知识库', summary: '基于 Vue 3 + Spring Boot 构建 RAG 智能知识库，结合 LLM 大模型实现企业文档智能问答。', contentMd: '# RAG 智能知识库\n\n## 技术架构\n\n...', contentHtml: '<h1>RAG 智能知识库</h1><p>技术架构...</p>', category: 'gis', tag: 'GIS', tagType: 'success', coverIcon: '🗺️', coverColor: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', status: 1, viewCount: 856, likeCount: 42, isTop: 0, createTime: '2025-05-28 14:30:00', updateTime: '2025-05-28 14:30:00' },
  { id: 3, title: 'Cesium 3D 地图入门：从加载地球到粒子特效', summary: 'Cesium 快速上手指南，涵盖相机控制、3D 模型加载、GeoJSON 数据展示与雨雪粒子特效。', contentMd: '# Cesium 3D 地图入门\n\n## 环境搭建\n\n...', contentHtml: '<h1>Cesium 3D 地图入门</h1><p>环境搭建...</p>', category: 'gis', tag: 'GIS', tagType: 'success', coverIcon: '🌍', coverColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', status: 1, viewCount: 1500, likeCount: 120, isTop: 1, createTime: '2025-05-15 09:00:00', updateTime: '2025-05-15 09:00:00' },
  { id: 4, title: 'SpringBoot + MyBatis-Plus 实现通用 CRUD 接口', summary: '封装一套通用的增删改查接口，减少重复代码，提升后端开发效率。', contentMd: '# 通用 CRUD 接口\n\n## 核心思路\n\n...', contentHtml: '<h1>通用 CRUD 接口</h1><p>核心思路...</p>', category: 'java', tag: 'Java', tagType: 'warning', coverIcon: '☕', coverColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', status: 1, viewCount: 2100, likeCount: 168, isTop: 0, createTime: '2025-04-20 16:00:00', updateTime: '2025-04-20 16:00:00' },
  { id: 5, title: 'Vue3 电子签名组件：Canvas 实现手写签名', summary: '使用 Canvas API 实现支持压感、颜色选择、撤销重做的电子签名组件。', contentMd: '# Vue3 电子签名组件\n\n## Canvas 基础\n\n...', contentHtml: '<h1>Vue3 电子签名组件</h1><p>Canvas 基础...</p>', category: 'vue', tag: 'Vue3', tagType: '', coverIcon: '✍️', coverColor: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', status: 1, viewCount: 932, likeCount: 55, isTop: 0, createTime: '2025-04-08 11:20:00', updateTime: '2025-04-08 11:20:00' },
  { id: 6, title: 'ECharts 实现中国地图与迁徙图可视化', summary: '基于 ECharts 5 实现中国地图下钻、迁徙动画、热力分布等数据可视化大屏常用图表。', contentMd: '# ECharts 地图可视化\n\n## 地图数据\n\n...', contentHtml: '<h1>ECharts 地图可视化</h1><p>地图数据...</p>', category: 'other', tag: '其他', tagType: 'info', coverIcon: '📊', coverColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', status: 1, viewCount: 1800, likeCount: 92, isTop: 0, createTime: '2025-03-25 08:00:00', updateTime: '2025-03-25 08:00:00' },
]

// ===== 3 个模拟项目 =====
const projects = [
  { id: 1, name: 'Sea Pack Template', description: '企业级后台管理模板 · Vue3 + TypeScript + Vite', icon: 'home', color: '#409eff', bgColor: 'rgba(64,158,255,0.1)', url: 'https://gitee.com/zenghaifenga/seapack-template', sort: 1, status: 1 },
  { id: 2, name: 'Vue3 GIS Toolkit', description: 'OpenLayers + Cesium 地图组件库', icon: 'gis', color: '#67c23a', bgColor: 'rgba(103,194,58,0.1)', url: 'https://gitee.com/zenghaifenga/seapack-template', sort: 2, status: 1 },
  { id: 3, name: 'Stock Monitor', description: '股票实时监控与告警系统 · SpringBoot', icon: 'trend-charts', color: '#e6a23c', bgColor: 'rgba(230,162,60,0.1)', url: 'https://github.com/seapack-hub/SeaPackBackEnd', sort: 3, status: 1 },
]

let maxArticleId = 6
let maxProjectId = 3

// ===== Mock API 路由注册 =====
export default [
  // ===== 文章接口 =====
  {
    url: '/api/blogs/articles',
    method: 'GET',
    response: ({ query }) => {
      let list = [...articles]
      if (query.category && query.category !== 'all') {
        list = list.filter(a => a.category === query.category)
      }
      if (query.status !== undefined && query.status !== '') {
        list = list.filter(a => a.status === Number(query.status))
      }
      if (query.keyword) {
        const kw = query.keyword.toLowerCase()
        list = list.filter(a => a.title.toLowerCase().includes(kw) || a.summary.toLowerCase().includes(kw))
      }
      const pageNum = Number(query.pageNum) || 1
      const pageSize = Number(query.pageSize) || 10
      const start = (pageNum - 1) * pageSize
      const paged = list.slice(start, start + pageSize)
      return { code: 0, data: { list: paged, total: list.length }, msg: '成功' }
    }
  },
  {
    url: '/api/blogs/articles/:id',
    method: 'GET',
    response: ({ params }) => {
      const article = articles.find(a => a.id === Number(params.id))
      if (!article) return { code: 404, data: null, msg: '文章不存在' }
      return { code: 0, data: article, msg: '成功' }
    }
  },
  {
    url: '/api/blogs/articles',
    method: 'POST',
    response: ({ body }) => {
      maxArticleId++
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      articles.unshift({ id: maxArticleId, ...body, viewCount: 0, likeCount: 0, createTime: now, updateTime: now })
      return { code: 0, data: null, msg: '新增文章成功' }
    }
  },
  {
    url: '/api/blogs/articles/:id',
    method: 'PUT',
    response: ({ params, body }) => {
      const idx = articles.findIndex(a => a.id === Number(params.id))
      if (idx === -1) return { code: 404, data: null, msg: '文章不存在' }
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      articles[idx] = { ...articles[idx], ...body, id: Number(params.id), updateTime: now }
      return { code: 0, data: null, msg: '修改文章成功' }
    }
  },
  {
    url: '/api/blogs/articles/:id',
    method: 'DELETE',
    response: ({ params }) => {
      const idx = articles.findIndex(a => a.id === Number(params.id))
      if (idx === -1) return { code: 404, data: null, msg: '文章不存在' }
      articles.splice(idx, 1)
      return { code: 0, data: null, msg: '删除文章成功' }
    }
  },

  // ===== 项目接口 =====
  {
    url: '/api/blogs/projects',
    method: 'GET',
    response: () => {
      return { code: 0, data: projects.filter(p => p.status === 1), msg: '成功' }
    }
  },
  {
    url: '/api/blogs/projects',
    method: 'POST',
    response: ({ body }) => {
      maxProjectId++
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      projects.push({ id: maxProjectId, ...body, createTime: now, updateTime: now })
      return { code: 0, data: null, msg: '新增项目成功' }
    }
  },
  {
    url: '/api/blogs/projects/:id',
    method: 'PUT',
    response: ({ params, body }) => {
      const idx = projects.findIndex(p => p.id === Number(params.id))
      if (idx === -1) return { code: 404, data: null, msg: '项目不存在' }
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      projects[idx] = { ...projects[idx], ...body, id: Number(params.id), updateTime: now }
      return { code: 0, data: null, msg: '修改项目成功' }
    }
  },
  {
    url: '/api/blogs/projects/:id',
    method: 'DELETE',
    response: ({ params }) => {
      const idx = projects.findIndex(p => p.id === Number(params.id))
      if (idx === -1) return { code: 404, data: null, msg: '项目不存在' }
      projects.splice(idx, 1)
      return { code: 0, data: null, msg: '删除项目成功' }
    }
  },
] as MockMethod[];
