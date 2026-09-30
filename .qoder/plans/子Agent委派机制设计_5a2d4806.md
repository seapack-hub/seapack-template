# 子Agent委派机制实现方案

## 架构设计

### 核心思想

借鉴 Nanobot 的设计：**Subagent 是一个工具（Tool），不是独立的子系统。** 主Agent在执行过程中，通过 Function Calling 决定是否需要委派任务给其他Agent，就像调用任何其他工具一样。

### 当前架构 vs 目标架构

```
当前架构（固定流水线）：
用户输入 → IntentMatchService → 编排执行（固定步骤1→2→3）→ 返回结果

目标架构（动态委派）：
用户输入 → IntentMatchService → 主Agent执行
    ├── 主Agent分析任务，调用 delegate_agent 工具
    │   └── 子Agent执行子任务，返回结果
    ├── 主Agent继续分析，可能再次委派
    └── 主Agent汇总所有结果，输出最终回答
```

### 与现有编排策略的关系

| 策略 | 执行方式 | 适用场景 |
|------|---------|---------|
| sequential | 固定步骤顺序执行 | 确定性流程（如"查数据→生成报告"） |
| parallel | 固定步骤并行执行 | 无依赖的多任务 |
| **delegation (新增)** | 主Agent动态委派 | 意图不明确、需要灵活决策的场景 |

`delegation` 策略本质上是让主Agent成为"指挥官"，它通过工具调用来决定：
- 是否需要委派
- 委派给谁
- 传什么参数
- 何时汇总结果

## 实现方案

### Task 1: 新增 DelegationStrategy 策略类

**文件**: `src/main/java/org/seaPack/service/ai/orchestration/DelegationStrategy.java`

**职责**: 实现委派模式的编排策略，让主Agent通过工具调用动态委派任务。

**核心流程**:
1. 选择场景中的第一个Agent作为"主Agent"
2. 将场景下其他Agent的信息注册为可委派的工具
3. 主Agent执行 Agent Loop（调用LLM → 执行工具 → 重复）
4. 当主Agent调用 `delegate_agent` 工具时，执行子Agent
5. 子Agent的结果作为工具返回值反馈给主Agent
6. 主Agent继续执行，直到输出最终回答

**关键设计**:
```java
// 主Agent可用的工具列表 = 自身技能 + delegate_agent 工具
// delegate_agent 工具的参数:
{
  "agentId": 123,           // 要委派的Agent ID
  "task": "查询XX数据",     // 任务描述
  "context": "..."          // 可选的上下文信息
}

// 主Agent的系统提示词注入：
"你可以将子任务委派给以下Agent：
- Agent[123] 财务分析师：擅长财务数据分析
- Agent[456] 报告生成器：擅长生成文档报告
当需要其他Agent的能力时，调用 delegate_agent 工具。"
```

### Task 2: 实现 AgentDelegationTool 工具类

**文件**: `src/main/java/org/seaPack/service/ai/AgentDelegationTool.java`

**职责**: 作为 `delegate_agent` 工具的执行器，被主Agent的 Function Calling 调用。

**核心逻辑**:
```java
@Component
public class AgentDelegationTool {

    @Autowired
    private AgentTestChatService agentTestChatService;

    /**
     * 执行子Agent委派
     * 主Agent通过 Function Calling 调用此方法
     */
    public AgentStepResult execute(Long agentId, String task, String context,
                                    Long sceneId, String conversationId) {
        // 1. 构造子Agent的输入
        String input = context != null ? task + "\n\n上下文：" + context : task;

        // 2. 调用 AgentTestChatService.callAgentStep（已有的单步执行方法）
        //    不传 emitter = null，子Agent内部的 SSE 事件不推送
        //    只取最终结果
        AgentStepResult result = agentTestChatService.callAgentStep(
            agentId, input, null, sceneId, conversationId, requestId,
            null,  // emitter = null，子Agent不推送SSE
            cancelFlag, authToken
        );

        return result;
    }
}
```

### Task 3: 修改 DelegationStrategy 策略实现

**文件**: `src/main/java/org/seaPack/service/ai/orchestration/DelegationStrategy.java`

**核心 Agent Loop**:
```java
@Override
public OrchestrationResult execute(ExecuteParams params) {
    // 1. 加载场景下所有Agent
    List<Agent> availableAgents = loadSceneAgents(params.sceneId);

    // 2. 选择主Agent（场景下的第一个Agent，或配置指定的Agent）
    Agent mainAgent = selectMainAgent(availableAgents, params.orchestration);

    // 3. 构建可委派Agent列表（排除主Agent自身）
    List<Agent> delegatableAgents = availableAgents.stream()
        .filter(a -> !a.getId().equals(mainAgent.getId()))
        .collect(Collectors.toList());

    // 4. 构建主Agent的工具列表 = 自身技能 + delegate_agent 工具
    List<Map<String, Object>> toolDefinitions = buildToolDefinitions(
        mainAgent, delegatableAgents);

    // 5. 构建系统提示词（注入可委派Agent信息）
    String systemPrompt = buildDelegationPrompt(mainAgent, delegatableAgents, params.request.getMessage());

    // 6. 执行 Agent Loop（核心：LLM → 工具执行 → 重复）
    String finalOutput = executeAgentLoop(mainAgent, systemPrompt, toolDefinitions,
        params.request, params.config, params.emitter);

    // 7. 汇总结果
    return new OrchestrationResult(finalOutput, totalTokensPrompt, totalTokensCompletion, allSteps);
}
```

### Task 4: AiDialogService 新增 delegation 路由

**文件**: `src/main/java/org/seaPack/service/ai/AiDialogService.java`

**改动**: 在 `handleOrchestration` 的路由分发中，新增 `delegation` 策略的处理。

```java
// 在 switch (matchResult.route) 中：
case IntentMatchService.ROUTE_ORCHESTRATION -> {
    SceneOrchestration orch = matchResult.orchestration;
    String strategy = orch.getStrategy();

    if ("delegation".equals(strategy)) {
        // 委派模式：交给 DelegationStrategy 处理
        delegationStrategy.execute(buildOrchRequest(request), userId, emitter);
    } else {
        // 现有逻辑：固定编排执行
        orchestrationExecuteService.execute(buildOrchRequest(request), userId, emitter);
    }
}
```

### Task 5: IntentMatchService 支持 delegation 匹配

**文件**: `src/main/java/org/seaPack/service/ai/orchestration/IntentMatchService.java`

**改动**: 当匹配到的编排策略是 `delegation` 时，返回 `ROUTE_ORCHESTRATION`（不变），但 `matchResult.strategy` 标记为 `delegation`。

### Task 6: 前端 OrchestrationFormDialog 支持 delegation 策略

**文件**: `src/views/aiModule/scene/components/tab/OrchestrationFormDialog.vue`

**改动**:
1. 策略选项新增 `delegation`（委派模式）
2. 选择 `delegation` 时，显示提示："主Agent将动态选择其他Agent执行子任务"

### Task 7: 链路追踪支持 delegation 步骤

**文件**: `src/views/aiModule/agent/components/test-chat/StepTimeline.vue`

**改动**:
1. 步骤类型新增 `delegation` 标签和颜色
2. 详情面板显示委派信息：目标Agent、任务描述、子Agent执行结果

## 关键设计决策

### 1. 子Agent是否推送SSE事件？

**决策**: 子Agent不推送SSE事件给前端。

**原因**: 
- 主Agent的链路追踪已经包含了委派步骤
- 子Agent的内部步骤（提示词组装、知识库检索等）对用户来说是实现细节
- 避免SSE事件混乱（主Agent和子Agent的事件交织）

**替代方案**: 子Agent的关键信息（输入、输出、耗时、Token）作为主Agent的链路步骤元数据记录。

### 2. 委派深度限制

**决策**: 最大委派深度 = 2（主Agent → 子Agent，子Agent不能再委派）。

**原因**: 
- 防止无限递归
- 保持响应时间可控
- Nanobot 也是同样的限制（子Agent不能 spawn）

### 3. 并发执行

**决策**: 委派模式下，主Agent每次只委派一个子Agent（串行）。

**原因**:
- 简化实现
- 主Agent需要子Agent的结果来做下一步决策
- 后续可扩展为并发委派

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `DelegationStrategy.java` | 新建 | 委派策略核心实现 |
| `AgentDelegationTool.java` | 新建 | 子Agent委派工具执行器 |
| `AiDialogService.java` | 修改 | 新增 delegation 路由 |
| `OrchestrationFormDialog.vue` | 修改 | 策略选项新增 delegation |
| `StepTimeline.vue` | 修改 | 链路追踪支持 delegation |

## 验证

1. 创建一个策略为 `delegation` 的编排，关联多个Agent
2. 测试场景：用户输入一个需要多Agent协作的问题
3. 验证主Agent能正确调用 `delegate_agent` 工具
4. 验证子Agent结果正确返回给主Agent
5. 验证链路追踪正确展示委派过程
6. 运行 `mvn compile` 确认后端编译通过
7. 运行 `pnpm run build` 确认前端构建通过