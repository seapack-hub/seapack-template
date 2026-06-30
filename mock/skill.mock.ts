/**
 * AI 技能模块 Mock 数据
 *
 * 提供技能管理、分类、参数、绑定、执行日志的完整模拟接口
 * 响应格式统一为 { code: 200, data: ..., message: '...' } 以对齐 axios.ts 拦截器
 */
import { MockMethod } from 'vite-plugin-mock';

// ===== 5 个技能分类 =====
const categories = [
  { id: 1, name: '内容生成', code: 'content_gen', icon: 'content-gen', description: '文章、文案、报告等内容创作类技能', sortOrder: 1, status: 1, createdAt: '2025-06-01 10:00:00', updatedAt: '2025-06-01 10:00:00' },
  { id: 2, name: '数据分析', code: 'data_analysis', icon: 'data-analysis', description: '数据查询、分析、可视化类技能', sortOrder: 2, status: 1, createdAt: '2025-06-01 10:00:00', updatedAt: '2025-06-01 10:00:00' },
  { id: 3, name: '代码辅助', code: 'code_assist', icon: 'code-assist', description: '代码生成、审查、优化类技能', sortOrder: 3, status: 1, createdAt: '2025-06-01 10:00:00', updatedAt: '2025-06-01 10:00:00' },
  { id: 4, name: '图片处理', code: 'image_process', icon: 'image-process', description: '图片生成、编辑、识别类技能', sortOrder: 4, status: 0, createdAt: '2025-06-01 10:00:00', updatedAt: '2025-06-01 10:00:00' },
  { id: 5, name: '智能客服', code: 'smart_service', icon: 'smart-service', description: '问答、推荐、对话类技能', sortOrder: 5, status: 1, createdAt: '2025-06-01 10:00:00', updatedAt: '2025-06-01 10:00:00' },
]

// ===== 8 个技能 =====
const skills = [
  { id: 1, categoryId: 1, categoryName: '内容生成', name: '文章AI写作助手', code: 'blog-writing', description: '根据主题和关键词生成高质量的博客文章', promptTemplate: '你是一个专业的博客写手。请根据以下要求撰写文章：\n\n主题：{{topic}}\n关键词：{{keywords}}\n文章风格：{{style}}\n字数要求：{{wordCount}}字左右\n\n请生成一篇完整的博客文章，包含标题、段落和小标题。', temperature: 0.75, maxTokens: 4096, outputFormat: 'markdown', version: 'v2.0.0', status: 1, sortOrder: 1, useCount: 128, createdAt: '2025-06-05 09:00:00', updatedAt: '2025-06-20 14:30:00' },
  { id: 2, categoryId: 2, categoryName: '数据分析', name: '智能选股助手', code: 'stock-picker', description: '根据技术指标和基本面分析推荐股票', promptTemplate: '你是一名资深股票分析师。请分析以下股票：{{stockCode}}\n分析维度：{{dimension}}\n\n请从技术面、基本面、资金面等多个维度进行分析，给出投资建议。', temperature: 0.5, maxTokens: 2048, outputFormat: 'markdown', version: 'v1.2.0', status: 1, sortOrder: 2, useCount: 256, createdAt: '2025-06-05 09:00:00', updatedAt: '2025-06-18 11:20:00' },
  { id: 3, categoryId: 3, categoryName: '代码辅助', name: '代码审查助手', code: 'code-reviewer', description: '自动审查代码质量，发现潜在bug和优化点', promptTemplate: '你是一位资深代码审查专家。请审查以下代码：\n\n语言：{{language}}\n代码：\n```\n{{code}}\n```\n\n请从以下几个方面给出意见：\n1. 潜在bug和安全问题\n2. 代码风格和最佳实践\n3. 性能优化建议\n4. 可读性和维护性', temperature: 0.3, maxTokens: 4096, outputFormat: 'markdown', version: 'v1.0.0', status: 1, sortOrder: 3, useCount: 89, createdAt: '2025-06-08 10:00:00', updatedAt: '2025-06-15 16:40:00' },
  { id: 4, categoryId: 2, categoryName: '数据分析', name: '数据图表生成器', code: 'chart-generator', description: '根据数据自动生成ECharts图表配置', promptTemplate: '你是一个数据可视化专家。根据以下数据生成ECharts配置：\n\n图表类型：{{chartType}}\n数据：{{data}}\n需求描述：{{description}}\n\n请返回可以直接使用的ECharts option配置对象。', temperature: 0.4, maxTokens: 3072, outputFormat: 'json', version: 'v1.1.0', status: 1, sortOrder: 4, useCount: 45, createdAt: '2025-06-10 14:00:00', updatedAt: '2025-06-22 09:15:00' },
  { id: 5, categoryId: 5, categoryName: '智能客服', name: '智能客服机器人', code: 'customer-service', description: '自动回答用户常见问题，支持多轮对话', promptTemplate: '你是一个智能客服助手。请回答用户的问题。\n\n用户问题：{{question}}\n上下文：{{context}}\n\n请给出友好、准确的回答。', temperature: 0.6, maxTokens: 1024, outputFormat: 'text', version: 'v3.0.0', status: 1, sortOrder: 5, useCount: 512, createdAt: '2025-06-01 08:00:00', updatedAt: '2025-06-25 10:00:00' },
  { id: 6, categoryId: 4, categoryName: '图片处理', name: '图片风格迁移', code: 'style-transfer', description: '将图片转换为指定艺术风格', promptTemplate: null, temperature: 0.8, maxTokens: 0, outputFormat: 'text', version: 'v1.0.0', status: 0, sortOrder: 6, useCount: 12, createdAt: '2025-06-15 11:00:00', updatedAt: '2025-06-15 11:00:00' },
  { id: 7, categoryId: 3, categoryName: '代码辅助', name: 'SQL查询优化器', code: 'sql-optimizer', description: '分析和优化SQL查询语句性能', promptTemplate: '你是一个SQL性能优化专家。请优化以下SQL查询：\n\n数据库类型：{{dbType}}\n原始SQL：\n```sql\n{{sql}}\n```\n\n请给出优化后的SQL和优化说明。', temperature: 0.3, maxTokens: 2048, outputFormat: 'markdown', version: 'v1.0.0', status: 1, sortOrder: 7, useCount: 67, createdAt: '2025-06-18 09:30:00', updatedAt: '2025-06-21 17:00:00' },
  { id: 8, categoryId: 1, categoryName: '内容生成', name: '知识库问答助手', code: 'kb-qa', description: '基于RAG知识库的智能问答', promptTemplate: '你是一个知识库问答助手。请基于以下知识库内容回答问题。\n\n知识库内容：\n{{context}}\n\n用户问题：{{question}}\n\n请基于知识库给出准确的回答。如果知识库中没有相关信息，请明确告知。', temperature: 0.5, maxTokens: 2048, outputFormat: 'markdown', version: 'v1.0.0', status: 1, sortOrder: 8, useCount: 34, createdAt: '2025-06-20 08:00:00', updatedAt: '2025-06-23 10:00:00' },
]

// ===== 技能参数 =====
const skillParams: { id: number; skillId: number; paramName: string; label: string; paramType: string; required: number; defaultValue: string; options: any; placeholder: string; sortOrder: number }[] = [
  // 技能1: 文章AI写作助手
  { id: 1, skillId: 1, paramName: 'topic', label: '文章主题', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '如 Vue3 状态管理最佳实践', sortOrder: 1 },
  { id: 2, skillId: 1, paramName: 'keywords', label: '关键词', paramType: 'string', required: 0, defaultValue: 'Vue3, Pinia, 状态管理', options: null, placeholder: '逗号分隔', sortOrder: 2 },
  { id: 3, skillId: 1, paramName: 'style', label: '文章风格', paramType: 'select', required: 0, defaultValue: '技术教程', options: [{ label: '技术教程', value: '技术教程' }, { label: '经验分享', value: '经验分享' }, { label: '行业分析', value: '行业分析' }, { label: '产品介绍', value: '产品介绍' }], placeholder: '选择风格', sortOrder: 3 },
  { id: 4, skillId: 1, paramName: 'wordCount', label: '字数要求', paramType: 'number', required: 0, defaultValue: '1500', options: null, placeholder: '建议 800-3000', sortOrder: 4 },
  // 技能2: 智能选股助手
  { id: 5, skillId: 2, paramName: 'stockCode', label: '股票代码', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '如 600519', sortOrder: 1 },
  { id: 6, skillId: 2, paramName: 'dimension', label: '分析维度', paramType: 'select', required: 0, defaultValue: 'all', options: [{ label: '全面分析', value: 'all' }, { label: '技术面', value: 'technical' }, { label: '基本面', value: 'fundamental' }, { label: '资金面', value: 'capital' }], placeholder: '选择维度', sortOrder: 2 },
  // 技能3: 代码审查助手
  { id: 7, skillId: 3, paramName: 'language', label: '编程语言', paramType: 'select', required: 1, defaultValue: 'JavaScript', options: [{ label: 'JavaScript', value: 'JavaScript' }, { label: 'TypeScript', value: 'TypeScript' }, { label: 'Python', value: 'Python' }, { label: 'Java', value: 'Java' }, { label: 'Go', value: 'Go' }], placeholder: '选择语言', sortOrder: 1 },
  { id: 8, skillId: 3, paramName: 'code', label: '源代码', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '粘贴需要审查的代码', sortOrder: 2 },
  // 技能4: 数据图表生成器
  { id: 9, skillId: 4, paramName: 'chartType', label: '图表类型', paramType: 'select', required: 1, defaultValue: 'bar', options: [{ label: '柱状图', value: 'bar' }, { label: '折线图', value: 'line' }, { label: '饼图', value: 'pie' }, { label: '散点图', value: 'scatter' }], placeholder: '选择图表类型', sortOrder: 1 },
  { id: 10, skillId: 4, paramName: 'data', label: '数据', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: 'JSON格式数据', sortOrder: 2 },
  { id: 11, skillId: 4, paramName: 'description', label: '需求描述', paramType: 'string', required: 0, defaultValue: '', options: null, placeholder: '额外的样式要求', sortOrder: 3 },
  // 技能5: 智能客服
  { id: 12, skillId: 5, paramName: 'question', label: '用户问题', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '请输入用户的问题', sortOrder: 1 },
  { id: 13, skillId: 5, paramName: 'context', label: '上下文', paramType: 'string', required: 0, defaultValue: '', options: null, placeholder: '对话历史上下文', sortOrder: 2 },
  // 技能7: SQL查询优化器
  { id: 14, skillId: 7, paramName: 'dbType', label: '数据库类型', paramType: 'select', required: 1, defaultValue: 'MySQL', options: [{ label: 'MySQL', value: 'MySQL' }, { label: 'PostgreSQL', value: 'PostgreSQL' }, { label: 'Oracle', value: 'Oracle' }, { label: 'SQL Server', value: 'SQL Server' }], placeholder: '选择数据库', sortOrder: 1 },
  { id: 15, skillId: 7, paramName: 'sql', label: 'SQL语句', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '粘贴需要优化的SQL', sortOrder: 2 },
  // 技能8: 知识库问答助手
  { id: 16, skillId: 8, paramName: 'context', label: '知识库内容', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '知识库相关文档内容', sortOrder: 1 },
  { id: 17, skillId: 8, paramName: 'question', label: '用户问题', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '请输入问题', sortOrder: 2 },
]

// ===== 模块绑定 =====
const bindings: { id: number; skillId: number; moduleKey: string; position: string; config: any; status: number }[] = [
  { id: 1, skillId: 1, moduleKey: 'blogsManagement', position: 'editor-toolbar', config: { buttonText: 'AI写作' }, status: 1 },
  { id: 2, skillId: 2, moduleKey: 'stockFund', position: 'detail-toolbar', config: { buttonText: 'AI分析' }, status: 1 },
  { id: 3, skillId: 5, moduleKey: 'aiModule', position: 'chat-sidebar', config: { buttonText: '客服模式' }, status: 1 },
  { id: 4, skillId: 8, moduleKey: 'aiModule', position: 'chat-sidebar', config: { buttonText: '知识库问答' }, status: 1 },
]

// ===== 执行日志（20条模拟数据） =====
const executionLogs = Array.from({ length: 20 }, (_, i) => {
  const skill = skills[i % skills.length]
  const statuses = ['success', 'success', 'success', 'success', 'fail', 'success', 'success', 'timeout']
  const status = statuses[i % statuses.length]
  const tokensPrompt = Math.floor(Math.random() * 800) + 200
  const tokensCompletion = Math.floor(Math.random() * 1500) + 100
  const durationMs = Math.floor(Math.random() * 5000) + 500
  const date = new Date(Date.now() - i * 3600000)
  const dateStr = date.toISOString().replace('T', ' ').slice(0, 19)
  return {
    id: i + 1,
    skillId: skill.id,
    skillCode: skill.code,
    moduleKey: ['blogsManagement', 'stockFund', 'aiModule', 'devTools'][i % 4],
    inputParams: { topic: '测试主题', style: '技术教程', wordCount: 1000 },
    outputResult: status === 'success' ? `# ${skill.name} 执行结果\n\n## 概要\n\n这是一段由 **${skill.name}** 生成的模拟输出内容。\n\n- 项目状态：正常运行\n- 处理结果：成功\n- 建议：继续优化\n\n详细内容请参考后续分析报告。` : null,
    tokensPrompt,
    tokensCompletion,
    durationMs,
    status,
    errorMessage: status === 'fail' ? 'LLM API 调用超时，请稍后重试' : status === 'timeout' ? '请求处理超过最大等待时间（30s）' : null,
    createdBy: 1,
    createdAt: dateStr,
  }
})

// 用于追踪 ID 自增
let maxCategoryId = 5
let maxSkillId = 8
let maxParamId = 17
let maxBindingId = 4
let maxLogId = 20

// ===== Mock API 路由注册 =====
export default [
  // ==================== 分类接口 ====================
  {
    url: '/api/ai/skill-categories',
    method: 'GET',
    response: () => ({ code: 200, data: categories, message: '成功' }),
  },
  {
    url: '/api/ai/skill-categories',
    method: 'POST',
    response: ({ body }: any) => {
      maxCategoryId++
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      categories.push({ id: maxCategoryId, ...body, createdAt: now, updatedAt: now })
      return { code: 200, data: null, message: '新增成功' }
    },
  },
  {
    url: '/api/ai/skill-categories/:id',
    method: 'PUT',
    response: ({ params, body }: any) => {
      const idx = categories.findIndex(c => c.id === Number(params.id))
      if (idx === -1) return { code: 404, data: null, message: '分类不存在' }
      categories[idx] = { ...categories[idx], ...body, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  {
    url: '/api/ai/skill-categories/:id',
    method: 'DELETE',
    response: ({ params }: any) => {
      const idx = categories.findIndex(c => c.id === Number(params.id))
      if (idx === -1) return { code: 404, data: null, message: '分类不存在' }
      categories.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },

  // ==================== 技能接口 ====================
  {
    url: '/api/ai/skills',
    method: 'GET',
    response: ({ query }: any) => {
      let list = [...skills]
      if (query.categoryId) list = list.filter(s => s.categoryId === Number(query.categoryId))
      if (query.status !== undefined && query.status !== '') list = list.filter(s => s.status === Number(query.status))
      if (query.keyword) {
        const kw = query.keyword.toLowerCase()
        list = list.filter(s => s.name.toLowerCase().includes(kw) || s.code.toLowerCase().includes(kw) || (s.description || '').toLowerCase().includes(kw))
      }
      const pageNum = Number(query.pageNum) || 1
      const pageSize = Number(query.pageSize) || 10
      const start = (pageNum - 1) * pageSize
      const paged = list.slice(start, start + pageSize)
      return { code: 200, data: { list: paged, total: list.length }, message: '成功' }
    },
  },
  {
    url: '/api/ai/skills/:id',
    method: 'GET',
    response: ({ params }: any) => {
      const skill = skills.find(s => s.id === Number(params.id))
      if (!skill) return { code: 404, data: null, message: '技能不存在' }
      return { code: 200, data: skill, message: '成功' }
    },
  },
  {
    url: '/api/ai/skills',
    method: 'POST',
    response: ({ body }: any) => {
      maxSkillId++
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      const cat = categories.find(c => c.id === body.categoryId)
      skills.push({
        id: maxSkillId,
        ...body,
        categoryName: cat ? cat.name : '',
        useCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      return { code: 200, data: null, message: '新增成功' }
    },
  },
  {
    url: '/api/ai/skills/:id',
    method: 'PUT',
    response: ({ params, body }: any) => {
      const idx = skills.findIndex(s => s.id === Number(params.id))
      if (idx === -1) return { code: 404, data: null, message: '技能不存在' }
      const cat = categories.find(c => c.id === body.categoryId)
      skills[idx] = {
        ...skills[idx],
        ...body,
        categoryName: cat ? cat.name : skills[idx].categoryName,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  {
    url: '/api/ai/skills/:id',
    method: 'DELETE',
    response: ({ params }: any) => {
      const idx = skills.findIndex(s => s.id === Number(params.id))
      if (idx === -1) return { code: 404, data: null, message: '技能不存在' }
      skills.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },
  {
    url: '/api/ai/skills/:id/execute',
    method: 'POST',
    response: ({ params, body }: any) => {
      const skill = skills.find(s => s.id === Number(params.id))
      if (!skill) return { code: 404, data: null, message: '技能不存在' }
      maxLogId++
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      const tokensPrompt = Math.floor(Math.random() * 500) + 100
      const tokensCompletion = Math.floor(Math.random() * 1000) + 200
      const durationMs = Math.floor(Math.random() * 3000) + 300
      const result = {
        content: `# ${skill.name} 执行结果\n\n## 输入参数\n\`\`\`json\n${JSON.stringify(body, null, 2)}\n\`\`\`\n\n## 输出内容\n\n这是一段由 **${skill.name}** 生成的模拟执行结果。在真实环境中，这里将展示 LLM 返回的完整内容。\n\n### 关键发现\n\n1. 当前系统运行状态正常\n2. 主要指标符合预期\n3. 建议持续关注后续变化\n\n> 此内容为模拟数据，实际执行时将调用 AI 模型生成。`,
        tokensPrompt,
        tokensCompletion,
        durationMs,
      }
      // 记录日志
      executionLogs.unshift({
        id: maxLogId,
        skillId: skill.id,
        skillCode: skill.code,
        moduleKey: 'skillManagement',
        inputParams: body,
        outputResult: result.content,
        tokensPrompt,
        tokensCompletion,
        durationMs,
        status: 'success',
        errorMessage: null,
        createdBy: 1,
        createdAt: now,
      })
      skill.useCount = (skill.useCount || 0) + 1
      return { code: 200, data: result, message: '执行成功' }
    },
  },

  // ==================== 参数接口 ====================
  {
    url: '/api/ai/skills/:skillId/params',
    method: 'GET',
    response: ({ params }: any) => {
      return { code: 200, data: skillParams.filter(p => p.skillId === Number(params.skillId)), message: '成功' }
    },
  },
  {
    url: '/api/ai/skills/:skillId/params',
    method: 'POST',
    response: ({ params, body }: any) => {
      maxParamId++
      skillParams.push({ id: maxParamId, skillId: Number(params.skillId), ...body })
      return { code: 200, data: null, message: '新增成功' }
    },
  },
  {
    url: '/api/ai/skills/:skillId/params/:paramId',
    method: 'PUT',
    response: ({ params, body }: any) => {
      const idx = skillParams.findIndex(p => p.id === Number(params.paramId))
      if (idx === -1) return { code: 404, data: null, message: '参数不存在' }
      skillParams[idx] = { ...skillParams[idx], ...body }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  {
    url: '/api/ai/skills/:skillId/params/:paramId',
    method: 'DELETE',
    response: ({ params }: any) => {
      const idx = skillParams.findIndex(p => p.id === Number(params.paramId))
      if (idx === -1) return { code: 404, data: null, message: '参数不存在' }
      skillParams.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },

  // ==================== 模块绑定接口 ====================
  {
    url: '/api/ai/skills/:skillId/bindings',
    method: 'GET',
    response: ({ params }: any) => {
      return { code: 200, data: bindings.filter(b => b.skillId === Number(params.skillId)), message: '成功' }
    },
  },
  {
    url: '/api/ai/skills/:skillId/bindings',
    method: 'POST',
    response: ({ params, body }: any) => {
      maxBindingId++
      bindings.push({ id: maxBindingId, skillId: Number(params.skillId), ...body })
      return { code: 200, data: null, message: '新增成功' }
    },
  },
  {
    url: '/api/ai/skills/:skillId/bindings/:bindingId',
    method: 'PUT',
    response: ({ params, body }: any) => {
      const idx = bindings.findIndex(b => b.id === Number(params.bindingId))
      if (idx === -1) return { code: 404, data: null, message: '绑定不存在' }
      bindings[idx] = { ...bindings[idx], ...body }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  {
    url: '/api/ai/skills/:skillId/bindings/:bindingId',
    method: 'DELETE',
    response: ({ params }: any) => {
      const idx = bindings.findIndex(b => b.id === Number(params.bindingId))
      if (idx === -1) return { code: 404, data: null, message: '绑定不存在' }
      bindings.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },

  // ==================== 执行日志接口 ====================
  {
    url: '/api/ai/skills/logs',
    method: 'GET',
    response: ({ query }: any) => {
      let list = [...executionLogs]
      if (query.skillId) list = list.filter(l => l.skillId === Number(query.skillId))
      if (query.status) list = list.filter(l => l.status === query.status)
      const pageNum = Number(query.pageNum) || 1
      const pageSize = Number(query.pageSize) || 10
      const start = (pageNum - 1) * pageSize
      const paged = list.slice(start, start + pageSize)
      return { code: 200, data: { list: paged, total: list.length }, message: '成功' }
    },
  },
  {
    url: '/api/ai/skills/logs/:id',
    method: 'GET',
    response: ({ params }: any) => {
      const log = executionLogs.find(l => l.id === Number(params.id))
      if (!log) return { code: 404, data: null, message: '日志不存在' }
      return { code: 200, data: log, message: '成功' }
    },
  },
] as MockMethod[];
