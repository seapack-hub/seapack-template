# AI 模块架构设计：多 Provider 切换、RAG 知识库与 Agent 编排

> 本文是 SeaPack 项目技术系列的第四篇，聚焦 **AI 模块的整体架构设计与功能全景**。这篇文章的目标是让你在 10 分钟内理解 AI 模块「做了什么」——有哪些核心能力、各部分如何协作、解决了哪些问题。具体的实现细节会拆分到后续每篇文章中逐一展开。

> 阅读收益：如果你正在做企业级 AI 应用，想快速理解「多模型切换」「RAG 知识库」「Agent 编排」「SSE 流式通信」这几个核心能力的全貌，这篇会给你一个清晰的架构地图。

---

## 一、为什么需要一个 AI 模块架构

在很多 AI 项目中，最常见的做法是「对着一个模型硬编码」——用 DeepSeek 就写死 DeepSeek 的调用，想换成通义千问就得改代码、改配置、重新部署。这在原型阶段没问题，但在生产环境会遇到几个致命问题：

| 痛点 | 硬编码一个模型的表现 |
|------|---------------------|
| **模型切换成本高** | 换一个 Provider 就要改代码、改配置、重新部署 |
| **向量化和文本模型混用** | 文本对话用 A 厂商，向量化用 B 厂商，代码里到处 if-else |
| **知识库数据散落** | 文档解析、分片、向量化、检索各写一套，没有统一流程 |
| **Agent 扩展困难** | 想给 Agent 加个技能，要改一堆硬编码逻辑 |
| **可观测性差** | 不知道每次调用花了多少 Token、耗时多久、走了哪条链路 |

SeaPack 的 AI 模块设计目标非常明确：

> **一套配置切换所有 Provider，一套流程管理知识库全生命周期，一个流水线编排 Agent 执行，一条 SSE 管道流式输出所有结果。**

---

## 二、整体架构：一张图看懂全貌

```
                        ┌─────────────────────────────────────────────┐
                        │            前端 SSE 通信层                    │
                        │  useChatExecution.ts → chatExecute.ts       │
                        │  统一 Composable，根据 session.mode 自动路由  │
                        └──────────────────┬──────────────────────────┘
                                           │ fetch + ReadableStream
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                          AiDialogService（统一对话调度）                                │
│                                                                                      │
│   mode: streaming_llm ──→ 直接调用 LLM（通用对话）                                      │
│   mode: agent_stream ──→ Agent 四步流水线                                              │
│   mode: orchestration ─→ LLM 智能路由 → 编排 / Agent / 通用 LLM                         │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              ▼                            ▼                            ▼
   ┌──────────────────┐       ┌──────────────────────┐      ┌──────────────────────┐
   │   多 Provider 配置  │       │   Agent 四步流水线     │      │   编排执行引擎         │
   │                    │       │   1. 提示词组装        │      │                      │
   │  activeProvider    │       │   2. 知识库检索        │      │  sequential / parallel│
   │  embeddingProvider │       │   3. 技能调用          │      │  dynamic orchestration│
   │  providers{}       │       │   4. LLM 流式调用      │      │                      │
   └──────────────────┘       └──────────┬───────────┘      └──────────────────────┘
              │                           │
              ▼                           ▼
   ┌──────────────────┐       ┌──────────────────────────────────────┐
   │ LangChain4j       │       │          ChromaDB 向量数据库          │
   │ 模型实例化          │       │  文档解析 → 分片 → 向量化 → 语义检索   │
   └──────────────────┘       └──────────────────────────────────────┘
```

三层职责划分：

| 层级 | 核心组件 | 职责 |
|------|---------|------|
| **调度层** | `AiDialogService` | 按 mode 分发对话请求，统一取消标志和 Token 额度校验 |
| **执行层** | `AgentTestChatService` / `OrchestrationExecuteService` | Agent 四步流水线 / 编排步骤执行 |
| **基础层** | `AIProperties` / `AiConfig` / `ChromaDbConfig` | 多 Provider 配置、模型实例化、向量存储 |

---

## 三、核心能力一：多 Provider 动态切换

### 3.1 设计目标

> 改一行配置，所有 AI 调用自动切换到新模型——零代码改动。

系统同时对接了三家大模型厂商（DeepSeek、阿里云通义千问、小米 MiMo），通过配置文件中的 `ai.active-provider` 字段决定当前使用哪个。更重要的是，**文本对话模型和向量化模型可以来自不同厂商**——文本追求推理能力用 MiMo，向量化追求语义表达用阿里云，两者独立配置互不干扰。

### 3.2 配置结构

```properties
# 当前激活的 Provider（文本对话用）
ai.active-provider=mimo

# 向量化服务使用的 Provider（可以和文本对话不同）
ai.embedding-provider=aliyun

# 各 Provider 的具体配置
ai.providers.deepseek.api-key=sk-xxx
ai.providers.deepseek.base-url=https://api.deepseek.com/v1
ai.providers.deepseek.chat-model=deepseek-chat
ai.providers.deepseek.embedding-model=text-embedding-ada-002

ai.providers.aliyun.api-key=sk-xxx
ai.providers.aliyun.base-url=https://dashscope.aliyuncs.com/compatible-mode/v1
ai.providers.aliyun.chat-model=qwen-plus
ai.providers.aliyun.embedding-model=text-embedding-v3

ai.providers.mimo.api-key=sk-xxx
ai.providers.mimo.base-url=https://api.xiaomi.com/v1
ai.providers.mimo.chat-model=mimo-v2.5
```

### 3.3 已实现的功能

| 功能 | 说明 |
|------|------|
| **Provider 动态切换** | 通过 `AIProperties` + `@ConfigurationProperties` 自动映射配置，`AiConfig` 根据 `activeProvider` 动态创建 LangChain4j 模型 Bean |
| **文本/向量模型分离** | `activeProvider` 控制文本对话，`embeddingProvider` 控制向量化，各自独立 |
| **OpenAI 协议兼容** | 所有厂商都使用 OpenAI 兼容协议，LangChain4j 的 `OpenAiChatModel` 一套代码通吃 |
| **Provider 身份注入** | 自动在消息头部注入模型身份提示词，避免模型「自报错误身份」 |

### 3.4 涉及的关键类

| 类 | 职责 |
|----|------|
| `AIProperties` | 配置属性类，映射 `ai.*` 前缀，管理所有 Provider 配置 |
| `AiConfig` | Spring 配置类，根据 `activeProvider` 创建 `ChatLanguageModel` / `StreamingChatLanguageModel` Bean |
| `ChromaDbConfig` | ChromaDB 配置，创建 `EmbeddingModel` Bean，按知识库 ID 提供 `EmbeddingStore` |
| `AiProviderIdentities` | 各 Provider 的身份提示词常量 |

---

## 四、核心能力二：RAG 知识库

### 4.1 设计目标

> 上传文档，自动解析、分片、向量化、入库；对话时自动检索相关知识，让 Agent 拥有「领域记忆」。

RAG（Retrieval-Augmented Generation）是让大模型「知道你私有数据」的关键技术。SeaPack 实现了完整的 RAG 链路：从文档上传到语义检索，全流程异步处理，前端实时展示进度。

### 4.2 完整流程

```
用户上传文档
    │
    ▼
保存文件 → 创建文档记录 → 生成 taskToken → 触发异步向量化
                                                   │
    ┌────────────────────────────────────────────────┘
    │  异步线程 (@Async)
    │
    ├── 1. 解析文档 ──── FileParserUtil（支持 PDF / Word / TXT / Markdown）
    │
    ├── 2. 文档分片 ──── 按段落分片，可配置分片大小和重叠字符
    │
    ├── 3. 向量化 ────── 调用 EmbeddingModel 生成每个分片的向量
    │
    ├── 4. 向量入库 ──── 存入 ChromaDB（每个知识库独立 Collection）
    │                    同时写入 MySQL（记录 vectorId，支持回溯和删除）
    │
    └── 5. 更新统计 ──── 文档数、分片数、向量数等统计信息
```

### 4.3 已实现的功能

| 功能 | 说明 |
|------|------|
| **知识库 CRUD** | 创建、编辑、删除、复制、启停控制，支持分页查询 |
| **文档上传与解析** | 支持 PDF、Word、TXT、Markdown，通过 `FileParserUtil` 统一解析 |
| **异步向量化** | `@Async` 异步线程处理，不阻塞用户请求，前端实时展示进度 |
| **可配置分片** | 每个知识库可独立设置分片大小（chunkSize）和重叠字符（chunkOverlap） |
| **ChromaDB 向量存储** | 每个知识库对应独立 Collection（`knowledge_{id}`），数据完全隔离 |
| **语义检索** | 基于向量相似度的 top-K 检索，返回最相关的分片内容 |
| **关键词降级** | ChromaDB 不可用时自动降级到 MySQL 关键词匹配，保障可用性 |
| **进度追踪** | `taskToken` + `VectorProgressManager`，前端实时展示解析→分片→向量化进度 |
| **文档重新处理** | 清理旧向量，重置状态，从磁盘重新读取并向量化 |
| **级联删除** | 删除知识库时自动清理文档、分片、向量数据和磁盘文件 |

### 4.4 涉及的关键类

| 类 | 职责 |
|----|------|
| `KnowledgeBaseService` | 知识库 CRUD、文档上传、语义检索入口 |
| `KnowledgeVectorService` | 异步向量化核心，文档解析→分片→向量化→入库 |
| `ChromaDbConfig` | EmbeddingModel 创建 + EmbeddingStore 动态获取 |
| `VectorProgressManager` | 向量化进度管理，通过 taskToken 推送实时进度 |
| `FileParserUtil` | 多格式文档解析工具（PDF / Word / TXT / Markdown） |

---

## 五、核心能力三：Agent 四步编排流水线

### 5.1 设计目标

> Agent 不是「带 System Prompt 的聊天机器人」，而是一个完整的任务执行流水线——自动组装提示词、检索知识、调用技能、生成回答。

每个 Agent 可以关联多个提示词模板、多个知识库、多个技能。对话时系统自动完成四个步骤的编排，每步执行前用户都可以取消。

### 5.2 四步流水线

```
用户消息: "帮我查一下最近一周的股票行情"
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Agent 四步编排流水线                             │
│                                                                 │
│  Step 1: 提示词组装 (prompt_assembly)                            │
│  ├── 加载 Agent 基础 system_prompt                               │
│  ├── LLM 动态选择相关模板（从 Agent 关联的模板池中）               │
│  └── 拼接: system_prompt + selected_templates                    │
│                                                                 │
│  Step 2: 知识库检索 (knowledge_retrieval)                        │
│  ├── 遍历 Agent 关联的知识库列表                                  │
│  ├── 对每个知识库执行 ChromaDB 向量检索 top-K                      │
│  └── 拼接: system_prompt + 【参考知识】                            │
│                                                                 │
│  Step 3: 技能调用 (skill_execution)                              │
│  ├── LLM 智能选择技能（从 Agent 关联的技能池中）                   │
│  ├── LLM 提取参数（根据 inputSchema + 用户消息）                  │
│  ├── HTTP 调用技能 endpoint                                      │
│  └── 拼接: system_prompt + 【技能执行结果】                        │
│                                                                 │
│  Step 4: LLM 流式调用 (llm_call)                                │
│  ├── 组装完整 messages（system + history + user）                  │
│  ├── 流式调用 LLM API                                            │
│  └── 逐 token 通过 SSE 推送给前端                                 │
│                                                                 │
│  完成后: 组装 TraceSnapshot → 保存会话记录 → 统计 Token             │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 已实现的功能

| 功能 | 说明 |
|------|------|
| **LLM 动态选择模板** | 不是全部加载，而是让 LLM 根据用户意图从模板池中选择最相关的模板 |
| **LLM 动态选择技能** | LLM 从 Agent 关联的技能池中选择最匹配的技能，避免全部执行 |
| **LLM 智能参数提取** | 根据技能的 inputSchema，LLM 自动从用户消息中提取结构化参数 |
| **知识库检索集成** | 自动遍历 Agent 关联的所有知识库，向量检索后拼接到提示词中 |
| **技能策略模式** | `SkillHandler` 接口 + Spring 自动注册，支持 LLM / HTTP / 文件生成等多种技能类型 |
| **Step 间取消检查** | 每个步骤执行前检查 cancelFlag，用户可随时终止 |
| **链路追踪（Trace Snapshot）** | 完整记录每步的输入、输出、耗时、Token 消耗，存入数据库 |
| **场景级配置覆盖** | Agent 在不同场景下可覆盖模型、temperature、maxTokens 等参数 |
| **对话记忆** | 支持滑动窗口记忆，保留最近 N 轮对话上下文 |

### 5.4 涉及的关键类

| 类 | 职责 |
|----|------|
| `AgentTestChatService` | Agent 四步流水线编排核心，管理完整的对话执行链路 |
| `AgentSkillExecutor` | 技能执行引擎：LLM 选择技能 → LLM 提取参数 → HTTP 调用 endpoint |
| `SkillHandler` | 技能执行器策略接口，各类型技能实现各自的 Handler |
| `Agent` | Agent 实体，包含 system_prompt、模型参数、记忆配置等 |

---

## 六、核心能力四：编排模式与 LLM 智能路由

### 6.1 设计目标

> 不需要预先定义流程，让 LLM 根据用户消息实时决定——该用哪个 Agent、按什么顺序执行、甚至是否需要 Agent。

编排模式是整个 AI 模块最灵活的能力。它把「编排决策」本身也交给了 LLM。

### 6.2 路由决策流程

```
用户消息: "帮我分析一下茅台的财务数据并生成报告"
    │
    ▼
┌─── 编排路由 ───────────────────────────────┐
│                                             │
│  1. 收集候选 Agent                          │
│     └── 从场景关联的 Agent 列表中获取         │
│                                             │
│  2. 决策分支                                │
│     ├── 有预定义编排步骤 → 按步骤执行         │
│     ├── 仅 1 个候选 Agent → 直接使用          │
│     ├── 多个候选 Agent → LLM 动态选择         │
│     │   ├── 选中 1 个 → Agent 对话            │
│     │   ├── 选中多个 → 动态编排（顺序/并行）   │
│     │   └── 选 0 个 → 降级到通用 LLM          │
│     └── 无候选 Agent → 降级到通用 LLM          │
│                                             │
│  每个分支都通过 SSE 事件向前端实时反馈路由结果   │
└─────────────────────────────────────────────┘
```

### 6.3 已实现的功能

| 功能 | 说明 |
|------|------|
| **LLM Agent 选择** | LLM 分析用户意图，从候选 Agent 中选择合适的，返回选择原因 |
| **sequential / parallel 策略** | LLM 判断 Agent 之间是否有依赖，决定顺序执行还是并行执行 |
| **动态步骤构建** | LLM 选中多个 Agent 时，动态编排步骤（上一步输出作为下一步输入） |
| **多级降级** | LLM 选择失败 → 默认 Agent → 通用 LLM，三级 fallback |
| **SSE 路由事件** | 前端实时展示路由分析过程（`routing` → `route_result` → `agent_select`） |
| **预定义编排执行** | 支持预先配置好的编排步骤，按顺序逐步执行 |

### 6.4 涉及的关键类

| 类 | 职责 |
|----|------|
| `AiDialogService` | 统一对话调度，编排模式的路由决策核心 |
| `OrchestrationExecuteService` | 编排步骤执行引擎，支持顺序/并行/动态编排 |

---

## 七、核心能力五：SSE 流式通信

### 7.1 设计目标

> 后端逐 token 输出，前端实时渲染——用户看到的不是「等待 5 秒出一堆文字」，而是「像打字一样一个字一个字蹦出来」。

SSE（Server-Sent Events）是整套 AI 模块的通信基础。不仅用于最终的文本输出，还用于传递步骤进度、路由决策、Token 统计等结构化信息。

### 7.2 SSE 事件协议

所有对话模式共享统一的事件协议：

| 事件类型 | 用途 | 关键字段 |
|---------|------|---------|
| `routing` | 编排模式路由开始 | message |
| `route_result` | 路由结果 | route, agents, strategy |
| `agent_select` | Agent 选择结果 | agents, strategy, fallback |
| `step_start` | 步骤开始 | stepIndex, stepType, stepName |
| `step_progress` | 步骤进度 | stepIndex, message |
| `step_detail` | 步骤详情 | stepIndex, detailType, + 各类详情 |
| `step_done` | 步骤完成 | stepIndex, status, durationMs |
| `content` | 流式文本输出 | text |
| `done` | 对话完成 | tokens, durationMs, traceSnapshot |
| `stop` | 用户终止 | message, durationMs |
| `error` | 错误 | message |

### 7.3 已实现的功能

| 功能 | 说明 |
|------|------|
| **后端 SseEmitter** | Spring `SseEmitter` 作为 SSE 发射器，`LlmSseHelper` 封装通用 LLM 流式调用 |
| **前端 readSseStream** | 基于 `fetch` + `ReadableStream` 的通用 SSE 读取器，行缓冲处理不完整数据 |
| **useChatExecution** | 统一 Composable，根据 session.mode 自动选择 LLM/场景模式的 SSE 处理 |
| **步骤进度可视化** | 每个步骤实时推送 `step_start` → `step_progress` → `step_detail` → `step_done` |
| **取消机制** | 前端 `AbortController` + 后端 `AtomicBoolean cancelFlag`，用户可随时终止 |
| **请求中断** | 新请求自动中断上一次进行中的 SSE 流 |

---

## 八、核心能力六：Token 统计与额度管理

### 8.1 设计目标

> 每次 LLM 调用都可追踪——谁调的、用了什么模型、花了多少 Token、耗时多久、走了哪条链路。

### 8.2 已实现的功能

| 功能 | 说明 |
|------|------|
| **Token 消耗记录** | 每次 LLM 调用（包括模板选择、技能选择等辅助调用）都记录到 `token_usage_log` |
| **额度校验** | 每次对话前检查用户剩余额度，超限则拒绝并提示 |
| **多维度统计** | 按用户、模型、场景、业务类型等维度统计 Token 消耗 |
| **链路追踪快照** | Agent 对话生成 `TraceSnapshot`，完整记录每步输入输出和耗时 |
| **前端用量展示** | 对话完成后展示 Token 消耗，支持查看完整执行链路 |

---

## 九、模块全景：前端 AI 管理界面

AI 模块不仅有后端能力，还配套了完整的前端管理界面：

| 模块 | 功能 |
|------|------|
| **Agent 管理** | Agent 的创建、编辑、配置（提示词、知识库、技能、记忆），支持详情查看与编辑双态模式 |
| **知识库管理** | 知识库的创建、文档上传、分片预览、向量化进度追踪、检索测试 |
| **技能管理** | 技能的创建、分类管理、参数 Schema 编辑、技能测试 |
| **提示词模板** | 模板的创建、编辑、预览，支持 Agent 关联 |
| **场景管理** | 场景创建、Agent 关联、编排步骤配置、部署管理 |
| **Token 统计** | Token 消耗趋势图、模型分布饼图、用户排行、场景消耗 |
| **Token 额度** | 用户额度设置、用量进度条、超限告警 |
| **AI 对话** | 统一对话界面，支持 LLM 直聊和场景编排两种模式 |

---

## 十、设计亮点总结

| 设计点 | 实现方式 | 解决的问题 |
|-------|---------|-----------|
| **多 Provider 切换** | `AIProperties` + `AiConfig` + `activeProvider` | 一行配置切换大模型，零代码改动 |
| **文本/向量模型分离** | `activeProvider` + `embeddingProvider` | 不同场景用不同模型 |
| **RAG 全链路** | 解析→分片→向量化→ChromaDB→检索+降级 | 完整的知识库生命周期管理 |
| **Collection 隔离** | 每个知识库独立 ChromaDB Collection | 知识库数据互不干扰 |
| **LLM 智能路由** | LLM 选择模板/技能/Agent | 动态决策，避免硬编码 |
| **SSE 流式通信** | 统一事件协议 + 前端 Composable | 逐 token 输出 + 步骤进度可视化 |
| **取消机制** | 前端 AbortController + 后端 AtomicBoolean | 用户可随时终止对话 |
| **Token 统计** | 每次调用记录 + 额度校验 | 可观测、可控制 |
| **链路追踪** | AgentTraceSnapshot | 完整记录执行链路 |
| **多级降级** | 向量→关键词、POST→GET、LLM选择失败→默认Agent | 系统鲁棒性保障 |

---

## 十一、写在最后

AI 模块的架构设计核心思想是**「配置驱动 + LLM 智能路由 + 降级保障」**。多 Provider 切换让模型选择变得灵活，RAG 知识库让 Agent 拥有了「领域知识」，四步编排流水线让 Agent 从「聊天机器人」升级为「可执行任务的智能体」，SSE 流式通信让用户能实时看到每一步的执行过程。

整套架构的一个重要原则是：**LLM 能做的事让 LLM 做，LLM 做不了的事有降级方案**。模板选择失败就加载全部，技能选择失败就全部执行，向量检索失败就关键词匹配，Agent 选择失败就用默认 Agent。这种「智能 + 兜底」的设计让系统在各种异常场景下都能正常工作。

**后续文章计划**：本文只做架构总览，每个核心能力的实现细节（多 Provider 切换的具体配置方式、RAG 知识库的向量化实现、Agent 编排流水线的代码结构、SSE 流式通信的前后端对接）将在后续文章中逐一展开。
