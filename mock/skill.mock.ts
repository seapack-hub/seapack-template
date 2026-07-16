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
  { id: 1, categoryId: 1, categoryName: '内容生成', name: '文章AI写作助手', code: 'blog-writing', description: '根据主题和关键词生成高质量的博客文章', skillType: 'llm', endpoint: 'https://api.example.com/v1/chat', timeoutMs: 60000, inputSchema: '', version: 'v2.0.0', status: 1, sortOrder: 1, useCount: 128, createdAt: '2025-06-05 09:00:00', updatedAt: '2025-06-20 14:30:00' },
  { id: 2, categoryId: 2, categoryName: '数据分析', name: '智能选股助手', code: 'stock-picker', description: '根据技术指标和基本面分析推荐股票', skillType: 'llm', endpoint: 'https://api.example.com/v1/chat', timeoutMs: 45000, inputSchema: '', version: 'v1.2.0', status: 1, sortOrder: 2, useCount: 256, createdAt: '2025-06-05 09:00:00', updatedAt: '2025-06-18 11:20:00' },
  { id: 3, categoryId: 3, categoryName: '代码辅助', name: '代码审查助手', code: 'code-reviewer', description: '自动审查代码质量，发现潜在bug和优化点', skillType: 'llm', endpoint: 'https://api.example.com/v1/chat', timeoutMs: 120000, inputSchema: '', version: 'v1.0.0', status: 1, sortOrder: 3, useCount: 89, createdAt: '2025-06-08 10:00:00', updatedAt: '2025-06-15 16:40:00' },
  { id: 4, categoryId: 2, categoryName: '数据分析', name: '数据图表生成器', code: 'chart-generator', description: '根据数据自动生成ECharts图表配置', skillType: 'function', endpoint: 'https://api.example.com/v1/functions/chart', timeoutMs: 30000, inputSchema: '{"type":"object","properties":{"chartType":{"type":"string"},"data":{"type":"string"},"description":{"type":"string"}}}', version: 'v1.1.0', status: 1, sortOrder: 4, useCount: 45, createdAt: '2025-06-10 14:00:00', updatedAt: '2025-06-22 09:15:00' },
  { id: 5, categoryId: 5, categoryName: '智能客服', name: '智能客服机器人', code: 'customer-service', description: '自动回答用户常见问题，支持多轮对话', skillType: 'llm', endpoint: 'https://api.example.com/v1/chat', timeoutMs: 30000, inputSchema: '', version: 'v3.0.0', status: 1, sortOrder: 5, useCount: 512, createdAt: '2025-06-01 08:00:00', updatedAt: '2025-06-25 10:00:00' },
  { id: 6, categoryId: 4, categoryName: '图片处理', name: '图片风格迁移', code: 'style-transfer', description: '将图片转换为指定艺术风格', skillType: 'function', endpoint: 'https://api.example.com/v1/functions/style-transfer', timeoutMs: 120000, inputSchema: '{"type":"object","properties":{"imageUrl":{"type":"string"},"style":{"type":"string"}}}', version: 'v1.0.0', status: 0, sortOrder: 6, useCount: 12, createdAt: '2025-06-15 11:00:00', updatedAt: '2025-06-15 11:00:00' },
  { id: 7, categoryId: 3, categoryName: '代码辅助', name: 'SQL查询优化器', code: 'sql-optimizer', description: '分析和优化SQL查询语句性能', skillType: 'llm', endpoint: 'https://api.example.com/v1/chat', timeoutMs: 60000, inputSchema: '', version: 'v1.0.0', status: 1, sortOrder: 7, useCount: 67, createdAt: '2025-06-18 09:30:00', updatedAt: '2025-06-21 17:00:00' },
  { id: 8, categoryId: 1, categoryName: '内容生成', name: '知识库问答助手', code: 'kb-qa', description: '基于RAG知识库的智能问答', skillType: 'llm', endpoint: 'https://api.example.com/v1/chat', timeoutMs: 60000, inputSchema: '', version: 'v1.0.0', status: 1, sortOrder: 8, useCount: 34, createdAt: '2025-06-20 08:00:00', updatedAt: '2025-06-23 10:00:00' },
]

// ===== 技能参数 =====
// 注意：options 存储为后端 JSON String（columnDefinition = "JSON"），
//       前端 API 层（serializeOptions / deserializeOptions）自动转换
const skillParams: { id: number; skillId: number; paramName: string; label: string; paramType: string; required: number; defaultValue: string; options: string | null; placeholder: string; sortOrder: number }[] = [
  // 技能1: 文章AI写作助手
  { id: 1, skillId: 1, paramName: 'topic', label: '文章主题', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '如 Vue3 状态管理最佳实践', sortOrder: 1 },
  { id: 2, skillId: 1, paramName: 'keywords', label: '关键词', paramType: 'string', required: 0, defaultValue: 'Vue3, Pinia, 状态管理', options: null, placeholder: '逗号分隔', sortOrder: 2 },
  { id: 3, skillId: 1, paramName: 'style', label: '文章风  { id: 4, skillId: 1, paramName: \'wordCount\', label: \'字数要求\', paramType: \'number\', required: 0, defaultValue: \'1500\', options: null, placeholder: \'建议 800-3000\', sortOrder: 4 },\n格', paramType: 'select', required: 0, defaultValue: '技术教程', options: '[{"label":"技术教程","value":"技术教程"},{"label":"经验分享","value":"经验分享"},{"label":"行业分析","value":"行业分析"},{"label":"产品介绍","value":"产品介绍"}]', placeholder: '选择风格', sortOrder: 3 },
  // 技能2: 智能选股助手
  { id: 5, skillId: 2, paramName: 'stockCode', label: '股票代码', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '如 600519', sortOrder: 1 },
  { id: 6, skillId: 2, paramName: 'dimension', label: '分析维度', paramType: 'select', required: 0, defaultValue: 'all', options: '[{"label":"全面分析","value":"全面分析"},{"label":"技术面","value":"technical"},{"label":"基本面","value":"fundamental"},{"label":"资金面","value":"capital"}]', placeholder: '选择维度', sortOrder: 2 },
  // 技能3: 代码审查助手
  { id: 7, skillId: 3, paramName: 'language', label: '编程语言', paramType: 'select', required: 1, defaultValue: 'JavaScript', options: '[{"label":"JavaScript","value":"JavaScript"},{"label":"TypeScript","value":"TypeScript"},{"label":"Python","value":"Python"},{"label":"Java","value":"Java"},{"label":"Go","value":"Go"}]', placeholder: '选择语言', sortOrder: 1 },
  { id: 8, skillId: 3, paramName: 'code', label: '源代码', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '粘贴需要审查的代码', sortOrder: 2 },
  // 技能4: 数据图表生成器
  { id: 9, skillId: 4, paramName: 'chartType', label: '图表类型', paramType: 'select', required: 1, defaultValue: 'bar', options: '[{"label":"柱状图","value":"bar"},{"label":"折线图","value":"line"},{"label":"饼图","value":"pie"},{"label":"散点图","value":"scatter"}]', placeholder: '选择图表类型', sortOrder: 1 },
  { id: 10, skillId: 4, paramName: 'data', label: '数据', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: 'JSON格式数据', sortOrder: 2 },
  { id: 11, skillId: 4, paramName: 'description', label: '需求描述', paramType: 'string', required: 0, defaultValue: '', options: null, placeholder: '额外的样式要求', sortOrder: 3 },
  // 技能5: 智能客服
  { id: 12, skillId: 5, paramName: 'question', label: '用户问题', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '请输入用户的问题', sortOrder: 1 },
  { id: 13, skillId: 5, paramName: 'context', label: '上下文', paramType: 'string', required: 0, defaultValue: '', options: null, placeholder: '对话历史上下文', sortOrder: 2 },
  // 技能7: SQL查询优化器
  { id: 14, skillId: 7, paramName: 'dbType', label: '数据库类型', paramType: 'select', required: 1, defaultValue: 'MySQL', options: '[{"label":"MySQL","value":"MySQL"},{"label":"PostgreSQL","value":"PostgreSQL"},{"label":"Oracle","value":"Oracle"},{"label":"SQL Server","value":"SQL Server"}]', placeholder: '选择数据库', sortOrder: 1 },
  { id: 15, skillId: 7, paramName: 'sql', label: 'SQL语句', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '粘贴需要审查的SQL', sortOrder: 2 },
  // 技能8: 知识库问答助手
  { id: 16, skillId: 8, paramName: 'context', label: '知识库内容', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '知识库相关文档内容', sortOrder: 1 },
  { id: 17, skillId: 8, paramName: 'question', label: '用户问题', paramType: 'string', required: 1, defaultValue: '', options: null, placeholder: '请输入问题', sortOrder: 2 },
]

// ===== 模块绑定 =====
// 注意：config 存储为后端 JSON String（columnDefinition = "JSON"），
//       前端 API 层（serializeConfig / deserializeConfig）自动转换
const bindings: { id: number; skillId: number; moduleKey: string; position: string; config: string | null; status: number }[] = [
  { id: 1, skillId: 1, moduleKey: 'blogsManagement', position: 'editor-toolbar', config: '{"buttonText":"AI写作"}', status: 1 },
  { id: 2, skillId: 2, moduleKey: 'stockFund', position: 'detail-toolbar', config: '{"buttonText":"AI分析"}', status: 1 },
  { id: 3, skillId: 5, moduleKey: 'aiModule', position: 'chat-sidebar', config: '{"buttonText":"客服模式"}', status: 1 },
  { id: 4, skillId: 8, moduleKey: 'aiModule', position: 'chat-sidebar', config: '{"buttonText":"知识库问答"}', status: 1 },
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

/**
 * 合并绑定与技能、参数信息，模拟批量查询接口返回扁平结构
 * 匹配后端实际返回格式：{ skillId, skillName, moduleKey, position, status, config, params, ... }
 */
function buildBindingInfos() {
  return bindings.map(b => {
    const skill = skills.find(s => s.id === b.skillId)
    if (!skill) return null
    return {
      skillId: skill.id,
      skillName: skill.name,
      skillCode: skill.code,
      promptTemplate: '你是一个专业的助手。请根据用户输入生成内容。\n\n用户输入：{{input}}',
      temperature: 0.7,
      maxTokens: 2048,
      outputFormat: 'markdown',
      skillType: skill.skillType,
      moduleKey: b.moduleKey,
      position: b.position,
      status: b.status,
      config: b.config ? JSON.parse(b.config as string) : null,
      params: skillParams
        .filter(p => p.skillId === b.skillId)
        .map(p => ({
          paramName: p.paramName,
          label: p.label,
          paramType: p.paramType,
          required: p.required,
          options: p.options,
          placeholder: p.placeholder,
          sortOrder: p.sortOrder,
        })),
    }
  }).filter(Boolean)
}

export const mock: MockMethod[] = [
  { url: '/api/ai/skill/categories', method: 'get', response: () => ({ data: categories }) },
  { url: '/api/ai/skill/list', method: 'get', response: () => ({ data: skills }) },
  { url: '/api/ai/skill/params', method: 'get', response: () => ({ data: skillParams }) },
  { url: '/api/ai/skill/bindings', method: 'get', response: () => ({ data: bindings }) },
  { url: '/api/ai/skill/logs', method: 'get', response: () => ({ data: executionLogs }) },
  // 批量查询：返回含技能和参数详情的绑定列表，供前端 Store 全量缓存
  { url: '/api/ai/skills/bindings', method: 'get', response: () => ({ data: buildBindingInfos() }) },
]
