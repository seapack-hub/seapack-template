# Skill 技能系统：让 Agent 从"动嘴"进化到"动手"

> 本文是 SeaPack 项目技术系列的第八篇。前面几篇我们搞定了「怎么让大模型按套路回答」（第七篇）和「怎么让大模型翻书回答」（第六篇），但有一个问题一直悬而未决：**Agent 能聊、能写、能引经据典，但它就是不能"干活"。** 你问它「帮我查一下贵州茅台今天的股价」，它只能尴尬地用训练数据胡诌一个 2021 年的价格——毕竟它的知识库里没有今天的行情数据。你让它「生成一份本月的销售报告」，它也只能给你一段想象中的数字。

> 这就像一个非常博学的顾问，什么都能聊得头头是道，但你让他帮你拿杯咖啡，他说「抱歉，我只负责动嘴」。**Skill 技能系统要解决的就是这件事——给 Agent 装上"手和脚"，让它不仅能"想"，还能"做"。** 用户说一句话，系统自动识别需要调哪个工具、提取什么参数、发起什么请求，拿到真实数据后再交给大模型组织语言。就像给你的博学顾问配了一个超级助理——顾问负责思考，助理负责跑腿，最终交付的还是顾问的专业意见，但背后的数据是真实的。

---

## 一、概述

**Skill 技能系统**是让 Agent 学会"干活"的那一层能力。在没有 Skill 的时候，Agent 只能基于训练数据"凭感觉"回答问题；有了 Skill，Agent 可以真正调用 API 获取实时数据、生成文件、执行文本处理——结果是真实的，不是编的。

用一句话总结：**Skill 是 Agent 的"手和脚"，LLM 是 Agent 的"大脑"。** 大脑负责思考，手脚负责执行。

### 技能系统要解决什么问题？

假设你有一个股票分析 Agent，用户问"帮我查一下贵州茅台今天的股价"。如果 Agent 只有 LLM，它只能用训练数据给你一个可能是两年前的价格。但有了 Skill，Agent 可以：

1. 调用股票行情 API，拿到**实时**股价数据
2. 把真实数据喂给 LLM，由 LLM 组织成自然语言回答
3. 最终用户看到的回答是基于真实数据的，而不是编的

### 技能系统的职责边界

本文聚焦的是**技能系统本身**的定义、管理和执行能力：

- **定义**：如何描述一个技能（端点、参数 Schema、执行器类型、输出格式）
- **管理**：如何在后台增删改查技能、管理分类和参数
- **执行**：当被调用时，如何根据技能类型分发到对应的执行器完成实际工作
- **调试**：如何独立测试一个技能是否工作正常

至于**谁来调用技能、何时调用、如何从用户意图中选择技能**——这些属于 Agent 流水线的编排职责，将在后续介绍 Agent 系统时详细展开。

---

## 二、策略模式：三种执行器，各司其职

### 一句话概括

技能不只有一种玩法。有的需要调 HTTP 接口获取数据，有的需要调 LLM 做文本生成，有的需要生成文件下载。所以我们用了**策略模式**——一个 `SkillHandler` 接口，三种实现，各干各的。

### 策略接口

这是整个技能执行系统的"契约"。所有执行器都必须遵守这个接口：

```java
public interface SkillHandler {

    /** 返回此 Handler 支持的 skill_type 值 */
    String getSkillType();

    /**
     * 执行技能
     * @param skill     技能配置
     * @param params    用户输入参数
     * @param authToken 认证 Token（内部 API 调用时需要）
     * @param emitter   SSE 发射器（可用于流式推送进度）
     * @return 执行结果
     */
    SkillExecutionResult execute(Skill skill, Map<String, Object> params,
                                 String authToken, SseEmitter emitter);
}
```

注意返回值 `SkillExecutionResult`——这是统一的结果包装，所有执行器都返回这个类型，前端不用关心背后调的是 HTTP 还是 LLM：

```java
@Data
public class SkillExecutionResult {

    /** 输出类型：json / file / stream_text / markdown */
    private String outputType;
    /** 状态码 */
    private int statusCode;
    /** 请求方式描述（GET、POST、LLM 等） */
    private String httpMethod;
    /** 请求的端点 */
    private String url;
    /** 执行耗时（毫秒） */
    private long durationMs;
    /** 响应数据（根据 outputType 不同而不同） */
    private Object body;

    /** 便捷构建：JSON 类型结果 */
    public static SkillExecutionResult json(int statusCode, String method, String url,
                                            long durationMs, Object body) {
        return new SkillExecutionResult("json", statusCode, method, url, durationMs, body);
    }

    /** 便捷构建：文件类型结果 */
    public static SkillExecutionResult file(String url, String fileName, long fileSize, long durationMs) {
        Map<String, Object> body = Map.of("url", url, "fileName", fileName, "fileSize", fileSize);
        return new SkillExecutionResult("file", 200, "FILE", url, durationMs, body);
    }

    /** 便捷构建：流式文本结果 */
    public static SkillExecutionResult streamText(String method, String url, long durationMs, String text) {
        return new SkillExecutionResult("stream_text", 200, method, url, durationMs, text);
    }
}
```

三个静态工厂方法 `json()`、`file()`、`streamText()` 让执行器构建结果时像搭积木一样方便，不用手动 new 对象。

### 三种执行器实现

#### 1. HttpSkillHandler — HTTP 调用型（最常用）

这就是"干活主力"，负责调用内部 API 或外部 HTTP 接口。核心策略：POST 优先、GET 降级、静默 RestTemplate 不抛异常：

```java
@Slf4j
@Component
public class HttpSkillHandler implements SkillHandler {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${server.port:8090}")
    private int serverPort;

    @Override
    public String getSkillType() {
        return "http";
    }

    @Override
    public SkillExecutionResult execute(Skill skill, Map<String, Object> params,
                                         String authToken, SseEmitter emitter) {
        long start = System.currentTimeMillis();

        String url = skill.getEndpoint();
        boolean isInternalCall = url.startsWith("/");
        if (isInternalCall) {
            url = "http://localhost:" + serverPort + url;
        }

        // 展平参数 + 内部接口补充分页默认值
        Map<String, Object> flatParams = flattenParams(params != null ? params : new HashMap<>());
        if (isInternalCall) {
            flatParams.putIfAbsent("pageNum", 1);
            flatParams.putIfAbsent("pageSize", 10);
        }

        // 构建 Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (isInternalCall && authToken != null && !authToken.isBlank()) {
            headers.set("Authorization", authToken);
        }

        // 静默 RestTemplate（不抛异常）
        RestTemplate silentRt = new RestTemplate();
        silentRt.setRequestFactory(restTemplate.getRequestFactory());
        silentRt.setErrorHandler(new ResponseErrorHandler() {
            public boolean hasError(ClientHttpResponse resp) { return false; }
            public void handleError(ClientHttpResponse resp) {}
        });

        // 构建 GET URL
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(url);
        for (Map.Entry<String, Object> entry : flatParams.entrySet()) {
            if (entry.getValue() != null) {
                uriBuilder.queryParam(entry.getKey(), entry.getValue().toString());
            }
        }
        URI uri = uriBuilder.build().encode().toUri();

        // 先试 POST，失败则 GET 降级
        boolean isGetRequest = false;
        HttpEntity<Map<String, Object>> postEntity = new HttpEntity<>(flatParams, headers);
        ResponseEntity<Map> responseEntity = null;
        try {
            responseEntity = silentRt.exchange(url, HttpMethod.POST, postEntity, Map.class);
        } catch (Exception postEx) {
            isGetRequest = true;
            HttpEntity<Void> getEntity = new HttpEntity<>(null, headers);
            responseEntity = silentRt.exchange(uri, HttpMethod.GET, getEntity, Map.class);
        }

        if (responseEntity != null && responseEntity.getStatusCode().isError()) {
            isGetRequest = true;
            HttpEntity<Void> getEntity = new HttpEntity<>(null, headers);
            responseEntity = silentRt.exchange(uri, HttpMethod.GET, getEntity, Map.class);
        }

        long durationMs = System.currentTimeMillis() - start;
        int statusCode = responseEntity != null ? responseEntity.getStatusCode().value() : 0;
        Object body = responseEntity != null ? responseEntity.getBody() : null;
        String httpMethod = isGetRequest ? "GET" : "POST";
        String displayUrl = skill.getEndpoint();

        return SkillExecutionResult.json(statusCode, httpMethod, displayUrl, durationMs, body);
    }
}
```

核心设计：**静默 RestTemplate**——通过自定义 `ErrorHandler` 让 4xx/5xx 不抛异常，这样代码可以统一处理"POST 失败就降级 GET"的逻辑，而不是被 try-catch 割裂。

#### 2. LlmSkillHandler — 大模型调用型

有些技能不需要调外部 API，而是直接用 LLM 做文本生成。比如"翻译"、"摘要"、"润色"这类技能，本质上就是一次 LLM 调用：

```java
@Slf4j
@Component
public class LlmSkillHandler implements SkillHandler {

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    @Override
    public String getSkillType() {
        return "llm";
    }

    @Override
    public SkillExecutionResult execute(Skill skill, Map<String, Object> params,
                                         String authToken, SseEmitter emitter) {
        long start = System.currentTimeMillis();

        String prompt = getParam(params, "prompt", "");
        String systemPrompt = getParam(params, "system_prompt",
                "你是一个专业的AI助手，请根据用户的需求提供准确、详细的回答。");

        if (prompt.isBlank()) {
            return SkillExecutionResult.json(400, "LLM", skill.getEndpoint(),
                    System.currentTimeMillis() - start, Map.of("error", "prompt 参数不能为空"));
        }

        List<ChatMessage> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(new SystemMessage(systemPrompt));
        }
        messages.add(new UserMessage(prompt));

        var response = chatLanguageModel.generate(messages);
        String responseText = response.content().text();

        long durationMs = System.currentTimeMillis() - start;
        String endpoint = skill.getEndpoint() != null ? skill.getEndpoint() : "LLM:" + skill.getCode();
        return SkillExecutionResult.streamText("LLM", endpoint, durationMs, responseText);
    }
}
```

参数约定很简单：`prompt`（必填，用户指令）、`system_prompt`（可选，角色定义）、`temperature`（可选）。LLM 技能不走 HTTP，直接调用 LangChain4j 的 `ChatLanguageModel`。

#### 3. FileGenSkillHandler — 文件生成型

用于生成文档、报告等文件。调用内部文档生成 API，拿到文件 URL 后返回 `file` 类型结果，前端可以直接展示下载按钮：

```java
@Slf4j
@Component
public class FileGenSkillHandler implements SkillHandler {

    @Override
    public String getSkillType() {
        return "file_gen";
    }

    @Override
    public SkillExecutionResult execute(Skill skill, Map<String, Object> params,
                                         String authToken, SseEmitter emitter) {
        // ... 构建请求体、调用文档生成 API ...

        // 成功：提取 url、fileName、fileSize
        String fileUrl = data.getOrDefault("url", "").toString();
        String fileName = data.getOrDefault("fileName", "generated_file").toString();
        long fileSize = data.containsKey("fileSize") ? ((Number) data.get("fileSize")).longValue() : 0;

        return SkillExecutionResult.file(fileUrl, fileName, fileSize, durationMs);
    }
}
```

### Spring 自动注册

三种执行器通过 `@Component` 注解自动注册到 Spring 容器，`SkillService` 在启动时收集所有 `SkillHandler` 实现，建立 `skillType → Handler` 的快速查找表：

```java
@Autowired
private List<SkillHandler> handlerList;

private Map<String, SkillHandler> handlerMap;

@PostConstruct
public void initHandlerMap() {
    handlerMap = new HashMap<>();
    for (SkillHandler h : handlerList) {
        handlerMap.put(h.getSkillType(), h);
    }
    log.info("已注册技能执行器: {}", handlerMap.keySet());
}
```

想新增一种执行器？写一个类实现 `SkillHandler` 接口，加上 `@Component` 注解，Spring 自动帮你注册。**完全符合开闭原则——对扩展开放，对修改关闭。**

---

## 三、数据库设计：四张表的"分工合作"

### 一句话概括

四张表各管一摊事：`ai_skill` 管技能定义，`ai_skill_category` 管分类，`ai_skill_param` 管参数，`ai_agent_skill` 管 Agent 和技能的多对多关系。

### 关系图

```plain
ai_skill_category (1) ←── (N) ai_skill (1) ←── (N) ai_agent_skill (N) →── (1) ai_agent
                                       ↑
                               ai_skill_param (N)
```

一个分类下有多个技能，一个技能有多个参数定义，一个 Agent 可以关联多个技能（多对多通过 `ai_agent_skill` 关联表实现）。

### 核心表结构

**ai_skill — 技能定义表（核心中的核心）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT | 主键 |
| category_id | BIGINT | 所属分类 ID |
| name | VARCHAR(100) | 技能名称，如"股票行情查询" |
| code | VARCHAR(50) | 技能编码，唯一标识，如 `stock_quote` |
| skill_type | VARCHAR(30) | 执行器类型：`http` / `llm` / `file_gen` / `rag` / `hybrid` |
| endpoint | VARCHAR(200) | 调用端点（内部 API 路径或外部 URL） |
| input_schema | JSON | **输入参数 JSON Schema**（LLM 据此提取参数） |
| output_type | VARCHAR(30) | 输出类型：`json` / `file` / `stream_text` / `markdown` |
| status | TINYINT | 1=启用 0=禁用 |

**ai_skill_param — 技能参数表**

| 字段 | 说明 |
| --- | --- |
| param_name | 参数名，如 `stockCode` |
| label | 参数标签，如"股票代码" |
| param_type | 类型：`string` / `number` / `boolean` / `select` / `json` |
| required | 1=必填 0=可选 |
| options | select 类型的选项列表 JSON |

**ai_agent_skill — Agent 关联技能表（多对多）**

| 字段 | 说明 |
| --- | --- |
| agent_id | Agent ID |
| skill_id | 技能 ID |
| is_primary | 1=主技能 0=辅助技能 |
| enabled | 1=启用 0=禁用 |

### Skill 实体设计

实体类用 JPA 注解映射数据库字段，`@Transient` 标注的 `categoryName` 不入库，由 MyBatis 关联查询填充：

```java
@Entity
@Data
@Table(name = "ai_skill")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id")
    private Long categoryId;

    @Transient
    private String categoryName;  // 关联查询填充，不入库

    @Column(name = "name")
    private String name;

    @Column(name = "code")
    private String code;

    @Column(name = "skill_type")
    @Comment("执行器类型：http / llm / script / file_gen / rag / hybrid")
    private String skillType;

    @Column(name = "endpoint")
    private String endpoint;

    @Column(name = "output_type")
    private String outputType;

    @Column(name = "input_schema", columnDefinition = "JSON")
    private String inputSchema;

    @Column(name = "status")
    private Integer status;

    // ... 其他字段
}
```

`input_schema` 是整个技能系统的灵魂字段——它定义了技能需要哪些参数、什么类型，LLM 就是根据这个 Schema 从用户自然语言中提取参数的。

---

## 四、前端：技能管理页面

### 页面布局

技能管理页面采用**左右分栏**布局——左边是分类树，右边是技能列表（支持卡片/列表双模式切换）：

```plain
┌─────────────────────────────────────────────────┐
│ [左侧 220px]          │ [右侧 flex-1]            │
│                        │                          │
│ ┌──────────────┐       │ ┌──────────────────────┐ │
│ │ 技能分类      │       │ │ 搜索栏 + 工具栏       │ │
│ │              │       │ ├──────────────────────┤ │
│ │ ○ 全部分类   │       │ │ [卡片模式] 或 [列表]  │ │
│ │   ├ 内容生成 │       │ │                      │ │
│ │   ├ 数据分析 │       │ │ ┌────┐ ┌────┐ ┌────┐│ │
│ │   └ 工具集成 │       │ │ │卡片│ │卡片│ │卡片││ │
│ │              │       │ │ └────┘ └────┘ └────┘│ │
│ └──────────────┘       │ └──────────────────────┘ │
└─────────────────────────────────────────────────┘
```

分类树组件 `SkillCategoryTree` 内部管理分类的 CRUD，选中某个分类时联动刷新右侧技能列表。列表模式和卡片模式通过 `Transition` 动画平滑切换：

```html
<Transition name="view-fade" mode="out-in">
  <!-- 卡片模式 -->
  <CardGrid v-if="viewMode === 'card'" key="card">
    <SkillCard v-for="row in tableData" :key="row.id" :skill="row" />
  </CardGrid>

  <!-- 列表模式 -->
  <div v-else key="list">
    <SpTable :columns="columns" :data="tableData" />
  </div>
</Transition>
```

### SkillCard — 技能卡片

卡片组件根据技能类型自动应用不同的渐变背景色——HTTP 是紫蓝渐变，LLM 是青绿渐变，文件生成是粉红渐变：

```javascript
const coverGradient = computed(() => {
  const colors = {
    http: ['#667eea', '#764ba2'],
    llm: ['#43e97b', '#38f9d7'],
    script: ['#fa709a', '#fee140'],
    file_gen: ['#f093fb', '#f5576c'],
    rag: ['#4facfe', '#00f2fe'],
    hybrid: ['#a18cd1', '#fbc2eb'],
  }
  const pair = colors[props.skill.skillType] || ['#667eea', '#764ba2']
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`
})
```

卡片底栏有四个操作按钮：详情、参数、调试、删除，每个按钮都受 `v-permission` 指令控制。

### SkillFormDialog — 详情/编辑双态

技能表单弹窗支持两种模式：默认打开是**详情只读态**，点击"编辑"按钮后切换为**编辑态**。这是通过一个内部 `isEditing` 状态变量控制的：

```javascript
const isEditing = ref(false)
const isReadonly = computed(() => isEdit.value && !isEditing.value)

const dialogTitle = computed(() => {
  if (!isEdit.value) return '新增技能'
  return isEditing.value ? '编辑技能' : '技能详情'
})

function enterEditMode() {
  isEditing.value = true
}
```

模板中通过 `:disabled="isReadonly"` 控制所有表单项的可编辑状态，`v-if="isReadonly"` 控制底部按钮是显示"关闭+编辑"还是"取消+确认"。

技能表单有个亮点：`inputSchema` 字段用 `JsonEditor` 组件以代码编辑器的形式展示 JSON Schema，让管理员可以直接写 Schema 定义：

```html
<el-form-item label="输入 Schema" prop="inputSchema">
  <JsonEditor v-model="inputSchemaJson" height="300px" mode="code" :read-only="isReadonly" />
</el-form-item>
```

`inputSchemaJson` 是一个双向计算属性，负责 `string ↔ JSON object` 的转换：

```javascript
const inputSchemaJson = computed({
  get() {
    const raw = form.value.inputSchema
    if (!raw) return undefined
    try { return JSON.parse(raw) } catch { return undefined }
  },
  set(val: any) {
    form.value.inputSchema = val ? JSON.stringify(val) : ''
  },
})
```

### SkillParamEditor — 参数管理

参数管理弹窗是技能定义的"配套工具"。这里有个很实用的设计：**参数名直接对应提示词模板中的 `{{variable}}` 插值变量**——参数名写什么，模板里就用什么变量名。

参数编辑子弹窗支持详情/编辑双态，`select` 类型参数还支持动态添加选项列表：

```html
<!-- select 类型：选项列表编辑 -->
<el-form-item v-if="paramForm.paramType === 'select'" label="选项列表">
  <div v-for="(opt, idx) in selectOptions" :key="idx" class="flex items-center gap-8px">
    <el-input v-model="opt.label" placeholder="显示文本" style="width: 40%" />
    <el-input v-model="opt.value" placeholder="选项值" style="width: 40%" />
    <el-button type="info" icon="delete" circle @click="removeSelectOption(idx)" />
  </div>
  <el-button type="primary" link icon="plus" @click="addSelectOption">添加选项</el-button>
</el-form-item>
```

参数的 `options` 字段在前端是数组格式，后端存 JSON 字符串。`skillParam.ts` 工具类负责序列化/反序列化，还兼容了旧版的 `label=value\n` 格式：

```typescript
export function deserializeOptions(optionsStr?: string | null) {
  if (!optionsStr) return undefined
  try {
    const parsed = JSON.parse(optionsStr)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // 降级兼容旧版 label=value 格式
    if (optionsStr.includes('=')) {
      return optionsStr.split('\n').filter(Boolean).map(line => {
        const [label = '', value = ''] = line.split('=')
        return { label: label.trim(), value: value.trim() }
      })
    }
  }
  return undefined
}
```

---

## 五、技能调试：SSE 流式 + 三阶段动画

### 一句话概括

`SkillTestDialog` 是技能调试的核心组件——左边填参数，右边看结果，支持 SSE 流式进度推送和三阶段动画。

### 调试流程

后端 `SkillController.testStream()` 端点接受技能 ID 和测试参数，通过 SSE 流式返回执行结果：

```java
@PostMapping("/test-stream")
public SseEmitter testStream(@RequestBody SkillTestRequest request,
                              HttpServletResponse response) {
    response.setContentType(MediaType.TEXT_EVENT_STREAM_VALUE);
    response.setHeader("X-Accel-Buffering", "no");

    SseEmitter emitter = new SseEmitter(600000L);  // 10分钟超时

    // 获取认证 Token
    String authToken = RequestContextHolder 获取 Authorization header;

    // 异步执行
    sseExecutor.execute(() -> {
        skillService.testSkillStream(request.getSkillId(), request.getParams(), token, emitter);
    });

    return emitter;
}
```

`testSkillStream` 方法根据技能的 `skillType` 分发到对应的 Handler 执行，执行过程中通过 SSE 推送阶段事件：

```java
public void testSkillStream(Long skillId, Map<String, Object> params,
                            String authToken, SseEmitter emitter) {
    // 1. 加载技能配置
    sendSseEvent(emitter, "phase", Map.of("phase", "loading", "message", "正在加载技能配置..."));
    Skill skill = skillMapper.selectById(skillId);

    // 2. 校验 handler
    SkillHandler handler = handlerMap.get(skillType);

    // 3. 执行
    sendSseEvent(emitter, "phase", Map.of("phase", "calling", "message", "正在调用..."));
    SkillExecutionResult result = handler.execute(skill, params, authToken, emitter);

    // 4. 发送结果
    emitter.send(SseEmitter.event().name("message").data(objectMapper.writeValueAsString(resultMap)));
}
```

### 三阶段动画

前端接收 SSE 事件后，通过三阶段时间线展示执行进度：

```javascript
const phaseDefinitions = [
  { key: 'loading', label: '加载技能配置' },
  { key: 'calling', label: '调用接口' },
  { key: 'complete', label: '完成' },
]
```

每个阶段收到事件后记录到 `phaseHistory`，前端用圆圈 + Loading + Check 图标展示进度。测试进行中显示实时计时器，完成后显示最终耗时。

结果展示区根据 `outputType` 自动切换展示方式：
- **json** → `JsonEditor` 树形只读展示
- **stream_text / markdown** → `MarkdownRenderer` 渲染
- **file** → 文件卡片 + 下载按钮
- **兜底** → 纯文本 `<pre>` 展示

---

## 六、API 清单

### 后端 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/ai/skills/all` | 全量技能列表（不分页） |
| GET | `/ai/skills/page/list` | 分页查询（支持分类、类型、状态、关键词筛选） |
| GET | `/ai/skills/detail/{id}` | 技能详情 |
| POST | `/ai/skills/insert` | 新增技能（校验 code 唯一性） |
| POST | `/ai/skills/update` | 更新技能 |
| POST | `/ai/skills/delete/{id}` | 删除技能（级联删除参数） |
| GET | `/ai/skills/{skillId}/params` | 获取技能参数列表 |
| POST | `/ai/skills/{skillId}/add-param` | 新增参数 |
| POST | `/ai/skills/{skillId}/update-param` | 更新参数 |
| POST | `/ai/skills/{skillId}/delete-param/{paramId}` | 删除参数 |
| POST | `/ai/skills/test-stream` | 技能调试（SSE 流式） |

### 前端 API 封装

```typescript
export const SkillAPI = {
  list(params?)             // 全量列表
  page(query)               // 分页查询
  getById(id)               // 详情
  insert(data)              // 新增
  update(id, data)          // 更新
  delete(id)                // 删除
  getParams(skillId)        // 获取参数（自动反序列化 options）
  addParam(skillId, data)   // 新增参数（自动序列化 options）
  updateParam(skillId, paramId, data)  // 更新参数
  deleteParam(skillId, paramId)        // 删除参数
  testSkillStream(skillId, params, onEvent, signal)  // SSE 调试
}
```

参数管理的 API 自动处理 `options` 的序列化/反序列化——前端传数组，后端存 JSON 字符串，API 层透明处理。

---

## 七、设计要点总结

### 1. 策略模式实现可扩展执行器

三种 Handler（http / llm / file_gen）通过 Spring 自动注册，新增执行器只需实现接口 + 加 `@Component` 注解，零侵入。

### 2. 统一结果包装

`SkillExecutionResult` 通过静态工厂方法 `json()`、`file()`、`streamText()` 统一三种执行器的输出格式，前端不需要关心背后调的是 HTTP、LLM 还是文件生成——拿到的都是同一个结构。

### 3. POST → GET 自动降级

很多内部工具可能只写了 `@GetMapping`，或者网关限制了 POST。自动降级机制保证了调用成功率，开发者不用纠结"这个接口该用 POST 还是 GET"。

### 4. 静默 RestTemplate

通过自定义 `ErrorHandler` 吞掉 HTTP 错误码异常，让业务代码统一处理降级逻辑，而不是被 try-catch 割裂。

### 5. SSE 实时反馈

技能调试通过 SSE 流式推送阶段事件（loading → calling → complete），前端展示进度动画和实时计时器，用户不会感觉"界面卡住了"。

### 6. inputSchema 驱动参数体系

技能通过 `input_schema` 字段定义参数结构（JSON Schema 格式），前端根据 Schema 自动渲染对应的输入控件（文本框、下拉选择、数字框等），后端在执行时也可以据此校验参数完整性。

### 7. 前端 Composable 封装

`useSkill` 封装技能列表的查询、CRUD、状态切换；`useSkillTest` 封装调试的 SSE 交互状态。页面组件只负责 UI 渲染，业务逻辑全部抽离到 composable 中。

---

## 八、预览：下一篇

第八篇我们聊完了 Skill 技能系统——技能的定义、管理、执行器策略模式和调试能力。到这里，技能系统作为一个独立模块已经介绍完整了。

不过你可能已经注意到一个问题：**谁来决定"该调哪个技能"？** 用户说"帮我查一下茅台的股价"，系统怎么知道应该调股票查询技能，而不是新闻搜索技能？这就是 Agent 流水线要解决的编排问题——通过 LLM 智能选择技能、自动提取参数，再调用技能执行器完成实际工作。

下一篇，我们将介绍 **Agent 系统**——如何将提示词模板、知识库、技能串联成一条完整的四步流水线（提示词组装 → 知识库检索 → 技能调用 → LLM 回答），以及 Agent 管理模块的配置界面设计。
