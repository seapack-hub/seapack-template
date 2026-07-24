/**
 * 场景管理 API
 *
 * 后端控制器：SceneController（/ai/scenes）
 * 注：所有修改/删除操作统一使用 POST，URL 以 /update、/delete、/status 结尾
 */
import { request } from '@/utils/axios'
import type {
  Scene,
  SceneAgent,
  SceneAgentConfig,
  SceneBindingInfo,
  SceneDeployment,
  SceneKnowledge,
  SceneQuery,
} from './types/scene'

export type {
  Scene,
  SceneAgent,
  SceneAgentConfig,
  SceneBindingInfo,
  SceneDeployment,
  SceneKnowledge,
  SceneQuery,
}

const BASE_URL = '/api/ai/scenes'

export const SceneAPI = {
  // ===== 场景基础 CRUD =====

  /** GET /ai/scenes/page/list — 分页查询场景列表 */
  page(query: SceneQuery) {
    return request<any, PageResult<Scene[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** GET /ai/scenes/all — 全量已启用场景（下拉选择用） */
  list() {
    return request<any, Scene[]>({
      url: `${BASE_URL}/all`,
      method: 'get',
    })
  },

  /** GET /ai/scenes/detail/{id} — 查询场景详情 */
  getById(id: number) {
    return request<any, Scene>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** POST /ai/scenes/insert — 新增场景 */
  insert(data: Partial<Scene>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/update — 编辑场景 */
  update(id: number, data: Partial<Scene>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** POST /ai/scenes/delete/{id} — 删除场景（级联删除关联关系、部署、Agent 配置） */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'post',
    })
  },

  /** POST /ai/scenes/copy/{id} — 复制场景（含关联关系、部署、Agent 配置） */
  copy(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/copy/${id}`,
      method: 'post',
    })
  },

  /** POST /ai/scenes/updateStatus/{id} — 启停切换 */
  updateStatus(id: number, status: number) {
    return request<any, any>({
      url: `${BASE_URL}/updateStatus/${id}`,
      method: 'post',
      data: { status },
    })
  },

  // ===== 关联管理：助手 =====

  /** GET /ai/scenes/{sceneId}/agents — 查询场景关联的 Agent 列表 */
  getAgents(sceneId: number) {
    return request<any, SceneAgent[]>({
      url: `${BASE_URL}/${sceneId}/agents`,
      method: 'get',
    })
  },

  /** POST /ai/scenes/{sceneId}/agents — 添加关联 Agent */
  addAgent(sceneId: number, data: Partial<SceneAgent>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agents`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/{sceneId}/agents/{id}/update — 更新关联 Agent */
  updateAgent(sceneId: number, id: number, data: Partial<SceneAgent>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agents/${id}/update`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/{sceneId}/agents/{id}/delete — 删除关联 Agent */
  deleteAgent(sceneId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agents/${id}/delete`,
      method: 'post',
    })
  },

  // ===== 关联管理：知识库 =====

  /** GET /ai/scenes/{sceneId}/knowledge — 查询场景关联的知识库列表 */
  getKnowledgeList(sceneId: number) {
    return request<any, SceneKnowledge[]>({
      url: `${BASE_URL}/${sceneId}/knowledge`,
      method: 'get',
    })
  },

  /** POST /ai/scenes/{sceneId}/knowledge — 添加关联知识库 */
  addKnowledge(sceneId: number, data: Partial<SceneKnowledge>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/knowledge`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/{sceneId}/knowledge/{id}/update — 更新关联知识库 */
  updateKnowledge(sceneId: number, id: number, data: Partial<SceneKnowledge>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/knowledge/${id}/update`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/{sceneId}/knowledge/{id}/delete — 删除关联知识库 */
  deleteKnowledge(sceneId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/knowledge/${id}/delete`,
      method: 'post',
    })
  },

  // ===== 部署管理 =====

  /** GET /ai/scenes/{sceneId}/deployments — 查询场景的所有部署配置 */
  getDeployments(sceneId: number) {
    return request<any, SceneDeployment[]>({
      url: `${BASE_URL}/${sceneId}/deployments`,
      method: 'get',
    })
  },

  /** POST /ai/scenes/{sceneId}/deployments — 新增部署（module_key + position_key + config） */
  addDeployment(sceneId: number, data: Partial<SceneDeployment>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/deployments`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/{sceneId}/deployments/{id}/update — 更新部署（config / is_default / sort_order / status） */
  updateDeployment(sceneId: number, id: number, data: Partial<SceneDeployment>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/deployments/${id}/update`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/{sceneId}/deployments/{id}/delete — 删除部署 */
  deleteDeployment(sceneId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/deployments/${id}/delete`,
      method: 'post',
    })
  },

  /** POST /ai/scenes/{sceneId}/deployments/{id}/status — 启停切换部署 */
  toggleDeploymentStatus(sceneId: number, id: number, status: number) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/deployments/${id}/status`,
      method: 'post',
      data: { status },
    })
  },

  // ===== 场景级 Agent 运行配置 =====

  /** GET /ai/scenes/{sceneId}/agent-config — 查询场景的所有 Agent 运行配置 */
  getAgentConfigs(sceneId: number) {
    return request<any, SceneAgentConfig[]>({
      url: `${BASE_URL}/${sceneId}/agent-config`,
      method: 'get',
    })
  },

  /** POST /ai/scenes/{sceneId}/agent-config — 新增场景级 Agent 配置（model / temperature / ...） */
  addAgentConfig(sceneId: number, data: Partial<SceneAgentConfig>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agent-config`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/{sceneId}/agent-config/{id}/update — 更新场景级 Agent 配置 */
  updateAgentConfig(sceneId: number, id: number, data: Partial<SceneAgentConfig>) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agent-config/${id}/update`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/scenes/{sceneId}/agent-config/{id}/delete — 删除场景级 Agent 配置 */
  deleteAgentConfig(sceneId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${sceneId}/agent-config/${id}/delete`,
      method: 'post',
    })
  },

  // ===== 场景绑定查询 =====

  /** GET /ai/scenes/bindings/all — 全量绑定查询（聚合 deployment + agent + knowledge） */
  getAllBindings() {
    return request<any, SceneBindingInfo[]>({
      url: `${BASE_URL}/bindings/all`,
      method: 'get',
    })
  },

  /** GET /ai/scenes/bindings — 按 moduleKey + positionKey 查询场景绑定 */
  getByModuleAndPosition(moduleKey: string, positionKey?: string) {
    return request<any, SceneBindingInfo[]>({
      url: `${BASE_URL}/bindings`,
      method: 'get',
      params: { moduleKey, positionKey },
    })
  },
}
