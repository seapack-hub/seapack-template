/**
 * 场景管理 API
 */
import { request } from '@/utils/axios'
import type {
  Scene,
  SceneAgent,
  SceneKnowledge,
  SceneQuery,
} from './types/scene'

export type {
  Scene,
  SceneAgent,
  SceneKnowledge,
  SceneQuery,
}

const BASE_URL = '/api/ai/scenes'

export const SceneAPI = {
  /** 分页查询场景列表 */
  page(query: SceneQuery) {
    return request<any, PageResult<Scene[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 全量场景列表 */
  list() {
    return request<any, Scene[]>({
      url: `${BASE_URL}/all`,
      method: 'get',
    })
  },

  /** 查询场景详情 */
  getById(id: number) {
    return request<any, Scene>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** 新增场景 */
  insert(data: Partial<Scene>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** 编辑场景 */
  update(id: number, data: Partial<Scene>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** 删除场景 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'delete',
    })
  },

  /** 复制场景 */
  copy(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/copy/${id}`,
      method: 'post',
    })
  },

  /** 启停切换 */
  updateStatus(id: number, status: number) {
    return request<any, any>({
      url: `${BASE_URL}/updateStatus/${id}`,
      method: 'put',
      data: { status },
    })
  },

  // ===== 关联管理：助手 =====

  /** 获取场景关联的助手列表 */
  getAgents(sceneId: number) {
    return request<any, SceneAgent[]>({
      url: `${BASE_URL}/${sceneId}/agents`,
      method: 'get',
    })
  },

  /** 添加关联助手 */
  addAgent(sceneId: number, data: Partial<SceneAgent>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agents`,
      method: 'post',
      data,
    })
  },

  /** 更新关联助手 */
  updateAgent(sceneId: number, id: number, data: Partial<SceneAgent>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agents/${id}`,
      method: 'put',
      data,
    })
  },

  /** 删除关联助手 */
  deleteAgent(sceneId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agents/${id}`,
      method: 'delete',
    })
  },

  // ===== 关联管理：知识库 =====

  /** 获取场景关联的知识库列表 */
  getKnowledgeList(sceneId: number) {
    return request<any, SceneKnowledge[]>({
      url: `${BASE_URL}/${sceneId}/knowledge`,
      method: 'get',
    })
  },

  /** 添加关联知识库 */
  addKnowledge(sceneId: number, data: Partial<SceneKnowledge>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/knowledge`,
      method: 'post',
      data,
    })
  },

  /** 更新关联知识库 */
  updateKnowledge(sceneId: number, id: number, data: Partial<SceneKnowledge>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/knowledge/${id}`,
      method: 'put',
      data,
    })
  },

  /** 删除关联知识库 */
  deleteKnowledge(sceneId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/knowledge/${id}`,
      method: 'delete',
    })
  },
}
