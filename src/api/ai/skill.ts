/**
 * 技能管理 API
 *
 * 后端接口：
 *   GET    /api/ai/skills                   — 分页查询技能列表
 *   POST   /api/ai/skills                   — 新增技能
 *   GET    /api/ai/skills/{id}              — 技能详情
 *   PUT    /api/ai/skills/{id}              — 编辑技能
 *   DELETE /api/ai/skills/{id}              — 删除技能
 *   POST   /api/ai/skills/{id}/execute      — 执行技能
 *   GET    /api/ai/skills/{id}/params       — 获取技能参数列表
 *   POST   /api/ai/skills/{id}/params       — 新增参数
 *   PUT    /api/ai/skills/{id}/params/{pid} — 编辑参数
 *   DELETE /api/ai/skills/{id}/params/{pid} — 删除参数
 *   GET    /api/ai/skills/{id}/bindings     — 获取模块绑定列表
 *   POST   /api/ai/skills/{id}/bindings     — 新增绑定
 *   PUT    /api/ai/skills/{id}/bindings/{bid} — 编辑绑定
 *   DELETE /api/ai/skills/{id}/bindings/{bid} — 删除绑定
 */
import { request } from '@/utils/axios';
import { serializeOptions, deserializeOptions, serializeConfig, deserializeConfig } from '@/utils/skillParam';

const BASE_URL = '/api';

/** 技能实体 */
export interface Skill {
  id?: number;
  /** 所属分类ID */
  categoryId?: number;
  /** 分类名称（只读） */
  categoryName?: string;
  /** 技能名称 */
  name: string;
  /** 技能编码 */
  code: string;
  /** 图标 SVG 文件名 */
  icon?: string;
  /** 描述 */
  description?: string;
  /** 系统提示词模板，支持 {{variable}} 插值 */
  promptTemplate?: string;
  /** LLM 温度参数 0-2 */
  temperature?: number;
  /** 最大输出 token 数 */
  maxTokens?: number;
  /** 输出格式：markdown/json/text/html */
  outputFormat?: string;
  /** 当前版本号 */
  version?: string;
  /** 状态：1启用 0禁用 */
  status?: number;
  /** 排序号 */
  sortOrder?: number;
  /** 使用次数 */
  useCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** 技能分页查询参数 */
export interface SkillQuery {
  pageNum: number;
  pageSize: number;
  /** 分类ID（可选） */
  categoryId?: number;
  /** 状态筛选（可选） */
  status?: number;
  /** 关键词搜索（名称/编码） */
  keyword?: string;
}

/** 技能输入参数实体 */
export interface SkillParam {
  id?: number;
  skillId?: number;
  /** 参数名，对应 prompt_template 中的变量名 */
  paramName: string;
  /** 参数标签 */
  label: string;
  /** 参数类型：string/number/boolean/select */
  paramType: string;
  /** 是否必填：1是 0否 */
  required?: number;
  /** 默认值 */
  defaultValue?: string;
  /**
   * select 类型的选项列表
   * 前端内部为数组格式，提交时由 serializeOptions 序列化为 JSON 字符串
   */
  options?: { label: string; value: string }[];
  /** 输入提示 */
  placeholder?: string;
  /** 排序号 */
  sortOrder?: number;
}

/** 技能-模块绑定实体 */
export interface SkillBinding {
  id?: number;
  skillId?: number;
  /** 模块标识，对应 config/modules.ts 的 key */
  moduleKey: string;
  /** 模块内位置 */
  position?: string;
  /** 展示配置 JSON */
  config?: Record<string, any>;
  /** 状态：1启用 0禁用 */
  status?: number;
}

/** 技能执行请求体，对应后端 SkillExecuteRequest */
export interface SkillExecuteRequest {
  /** 技能参数键值对 */
  params: Record<string, any>
  /** 用户补充消息，附加在 prompt_template 之后 */
  userMessage?: string
}

/** 技能执行结果，对应后端返回 data */
export interface SkillExecuteResult {
  /** 技能 ID */
  skillId: number;
  /** 技能编码 */
  skillCode: string;
  /** 生成的内容 */
  output: string;
  /** 提示词 token 数 */
  tokensPrompt: number;
  /** 补全 token 数 */
  tokensCompletion: number;
  /** 耗时（毫秒） */
  durationMs: number;
  /** 执行日志 ID */
  logId: number;
}

/** 技能绑定的完整信息（含技能详情和参数定义），供批量查询接口返回 */
export interface SkillBindingInfo {
  /** 技能 ID */
  skillId: number;
  /** 技能名称 */
  skillName: string;
  /** 技能编码 */
  skillCode: string;
  /** 系统提示词模板 */
  promptTemplate?: string;
  /** LLM 温度参数 */
  temperature?: number;
  /** 最大输出 token 数 */
  maxTokens?: number;
  /** 输出格式 */
  outputFormat?: string;
  /** 模块标识 */
  moduleKey: string;
  /** 模块内位置 */
  position: string;
  /** 状态：1启用 0禁用 */
  status: number;
  /** 展示配置 JSON */
  config?: Record<string, any>;
  /** 技能的参数定义列表 */
  params: SkillParam[];
}

/** 统一 AI 执行结果，消费方据此处理插入/替换/预览 */
export interface AiExecutionResult {
  /** 是否执行成功 */
  success: boolean;
  /** 主输出内容 */
  content: string;
  /** 内容类型，消费方根据此决定插入方式 */
  contentType: 'markdown' | 'html' | 'text' | 'json';
  /** 技能名称 */
  skillName: string;
  /** 技能 ID */
  skillId: number;
  /** 执行日志 ID */
  executionLogId?: number;
  /** 执行耗时（毫秒） */
  elapsedMs: number;
  /** 扩展元数据（JSON 格式时存放结构化内容） */
  meta?: Record<string, any>;
}

export const SkillAPI = {
  /** 分页查询技能列表 */
  page(query: SkillQuery) {
    return request<any, PageResult<Skill[]>>({ 
      url: `${BASE_URL}/ai/skills`, 
      method: 'get', 
      params: query 
    });
  },

  /** 查询技能详情 */
  getById(id: number) {
    return request<any, Skill>({ 
      url: `${BASE_URL}/ai/skills/${id}`,
      method: 'get' 
    });
  },

  /** 新增技能 */
  insert(data: Partial<Skill>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills`, 
      method: 'post', 
      data 
    });
  },

  /** 编辑技能 */
  update(id: number, data: Partial<Skill>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${id}`, 
      method: 'put', 
      data 
    });
  },

  /** 删除技能 */
  delete(id: number) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${id}`, 
      method: 'delete' 
    });
  },

  /** 执行技能（AI 接口较慢，超时设为 5 分钟） */
  execute(id: number, req: SkillExecuteRequest) {
    return request<any, SkillExecuteResult>({
      url: `${BASE_URL}/ai/skills/${id}/execute`,
      method: 'post',
      data: req,
      timeout: 300000,
    });
  },

  // ===== 参数管理 =====

  /** 获取技能参数列表（自动反序列化 options JSON → 数组） */
  async getParams(skillId: number) {
    const res = await request<any, SkillParam[]>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/params`, 
      method: 'get' 
    });
    return (res || []).map(p => ({
      ...p,
      options: deserializeOptions(p.options as unknown as string | null) as any,
    }))
  },

  /** 新增参数（自动序列化 options 数组 → JSON） */
  async addParam(skillId: number, data: Partial<SkillParam>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/params`, 
      method: 'post', 
      data: { ...data, options: serializeOptions(data.options as any) },
    });
  },

  /** 编辑参数（自动序列化 options 数组 → JSON） */
  async updateParam(skillId: number, paramId: number, data: Partial<SkillParam>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/params/${paramId}`, 
      method: 'put', 
      data: { ...data, options: serializeOptions(data.options as any) },
    });
  },

  /** 删除参数 */
  deleteParam(skillId: number, paramId: number) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/params/${paramId}`, 
      method: 'delete' 
    });
  },

  // ===== 模块绑定 =====

  /** 获取技能模块绑定列表（自动反序列化 config JSON → 对象） */
  async getBindings(skillId: number) {
    const res = await request<any, SkillBinding[]>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/bindings`, 
      method: 'get' 
    });
    return (res || []).map(b => ({
      ...b,
      config: deserializeConfig(b.config as unknown as string | null) as any,
    }))
  },

  /** 新增模块绑定（自动序列化 config 对象 → JSON） */
  async addBinding(skillId: number, data: Partial<SkillBinding>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/bindings`, 
      method: 'post', 
      data: { ...data, config: serializeConfig(data.config as any) },
    });
  },

  /** 编辑模块绑定（自动序列化 config 对象 → JSON） */
  async updateBinding(skillId: number, bindingId: number, data: Partial<SkillBinding>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/bindings/${bindingId}`, 
      method: 'put', 
      data: { ...data, config: serializeConfig(data.config as any) },
    });
  },

  /** 删除模块绑定 */
  deleteBinding(skillId: number, bindingId: number) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/bindings/${bindingId}`, 
      method: 'delete' 
    });
  },

  // ===== 批量查询（供前端 Store 全量缓存） =====

  /** 查询所有模块绑定（含技能和参数详情），初始化时全量加载 */
  getAllBindings() {
    return request<any, SkillBindingInfo[]>({
      url: `${BASE_URL}/ai/skills/bindings`,
      method: 'get',
    });
  },
};
