/**
 * 技能管理 API
 *
 * 仅保留技能基础 CRUD 和参数管理接口。
 * 绑定、执行、调试、日志等接口已迁移至 Scene/Agent 体系。
 */
import { request } from '@/utils/axios';
import { serializeOptions, deserializeOptions } from '@/utils/skillParam';
import CacheKey from '@/constants/cache-key';
import type { Skill, SkillQuery, SkillParam } from './types/skill';

export type { Skill, SkillQuery, SkillParam }

// ===== SSE 通用读取器（技能调试专用） =====

let currentTestAbortController: AbortController | null = null

/** 取消当前进行中的技能调试请求 */
export function abortSkillTest() {
  currentTestAbortController?.abort()
  currentTestAbortController = null
}

/**
 * SSE 流式读取器 —— 供技能调试使用
 * 与 chatExecute.ts 中的 readSseStream 逻辑一致，但使用独立的 AbortController
 */
async function readSseStream(
  url: string,
  body: any,
  onEvent: (json: any) => void,
  signal?: AbortSignal,
): Promise<void> {
  currentTestAbortController?.abort()
  currentTestAbortController = new AbortController()

  // 如果外部传入了 signal，监听它来取消内部的 controller
  if (signal) {
    signal.addEventListener('abort', () => currentTestAbortController?.abort())
  }

  const token = localStorage.getItem(CacheKey.TOKEN)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: currentTestAbortController.signal,
  })

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()!

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('data:')) {
          const raw = trimmed.slice(5).trim()
          if (!raw) continue
          try { onEvent(JSON.parse(raw)) } catch { /* 忽略 */ }
        }
      }
    }
    // 处理 buffer 中剩余数据
    if (buffer.startsWith('data:')) {
      const raw = buffer.slice(5).trim()
      if (raw) { try { onEvent(JSON.parse(raw)) } catch { /* 忽略 */ } }
    }
  } finally {
    reader.releaseLock()
    currentTestAbortController = null
  }
}

/**
 * 技能调试 SSE 流式执行
 */
async function testSkillStream(
  skillId: number,
  params: Record<string, any>,
  onEvent: (event: { type: string; [key: string]: any }) => void,
  signal?: AbortSignal,
): Promise<void> {
  await readSseStream(
    `${BASE_URL}/ai/skills/test-stream`,
    { skillId, params },
    onEvent,
    signal,
  )
}

const BASE_URL = '/api';

export const SkillAPI = {
  /** 全量技能列表 */
  list(params?: { status?: number }) {
    return request<any, Skill[]>({
      url: `${BASE_URL}/ai/skills/all`,
      method: 'get',
      params,
    })
  },

  /** 分页查询技能列表 */
  page(query: SkillQuery) {
    return request<any, PageResult<Skill[]>>({ 
      url: `${BASE_URL}/ai/skills/page/list`, 
      method: 'get', 
      params: query 
    });
  },

  /** 查询技能详情 */
  getById(id: number) {
    return request<any, Skill>({ 
      url: `${BASE_URL}/ai/skills/detail/${id}`,
      method: 'get' 
    });
  },

  /** 新增技能 */
  insert(data: Partial<Skill>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/insert`, 
      method: 'post', 
      data 
    });
  },

  /** 编辑技能（data 中需包含 id） */
  update(id: number, data: Partial<Skill>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/update`, 
      method: 'post', 
      data: { ...data, id }
    });
  },

  /** 删除技能 */
  delete(id: number) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/delete/${id}`, 
      method: 'post' 
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
      url: `${BASE_URL}/ai/skills/${skillId}/add-param`, 
      method: 'post', 
      data: { ...data, options: serializeOptions(data.options as any) },
    });
  },

  /** 编辑参数（自动序列化 options 数组 → JSON；data 中需包含 id） */
  async updateParam(skillId: number, paramId: number, data: Partial<SkillParam>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/update-param`, 
      method: 'post', 
      data: { ...data, id: paramId, options: serializeOptions(data.options as any) },
    });
  },

  /** 删除参数 */
  deleteParam(skillId: number, paramId: number) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/delete-param/${paramId}`, 
      method: 'post' 
    });
  },

  // ===== 技能调试（SSE 流式） =====

  /**
   * 调试执行单个技能（SSE 流式）
   *
   * @param skillId  技能 ID
   * @param params   用户填写的测试参数
   * @param onEvent  SSE 事件回调
   * @param signal   AbortSignal（用于取消请求）
   */
  testSkillStream(
    skillId: number,
    params: Record<string, any>,
    onEvent: (event: { type: string; [key: string]: any }) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    return testSkillStream(skillId, params, onEvent, signal)
  },
};
