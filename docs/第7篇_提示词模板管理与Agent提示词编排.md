# 提示词模板：让 AI 按你的套路来

> 本文是 SeaPack 项目技术系列的第七篇。前几篇我们搞定了「怎么和大模型聊天」（第五篇）和「怎么让大模型翻书回答」（第六篇），这一篇来解决一个更实际的问题：**你每次让 AI 干活，是不是都在重复写差不多的 Prompt？** 比如每次分析股票都要手动输入「你是一位专业分析师，请从技术面、基本面、资金面三个维度分析以下股票……」，换个人来问，又要重新打一遍。一周后，你发现团队里有 5 个版本的「股票分析 Prompt」，每个都稍微改了一点，但谁也说不清哪个效果最好。

> 提示词模板要解决的就是这件事——把你精心打磨的 Prompt 存下来，下次只需要填几个变量就能一键执行。就像做菜不用每次都从头写菜谱，直接拿出菜谱模板，今天炒个辣椒放进去，明天换成豆豉就行。

---

## 一、为什么需要模板？聊聊 Prompt 的「复用困境」

你有没有过这样的经历：

花了半小时反复调试，终于写出一个效果很好的 Prompt。然后第二天，同事问你：「哎，昨天那个股票分析的 Prompt 能发我一下吗？」你复制粘贴给他。第三天，另一个同事也要。一周后，你发现团队里有 5 个版本的「股票分析 Prompt」，每个都稍微改了一点点，但谁也说不清楚哪个版本效果最好。这就是 Prompt 的「复用困境」——好 Prompt 全靠复制粘贴传播，版本失控，质量参差不齐。

**提示词模板的思路很朴素：把 Prompt 当成「填空题」来管理。** 固定的部分写死在模板里，每次变化的部分做成变量，用的时候填进去就行。举个例子，一个股票技术分析的 Prompt 可以长这样：

```
你是一位资深的股票分析师，请对 {{stockCode}}（{{stockName}}）进行技术面分析。

分析要求：
1. 近 20 个交易日的 K 线形态
2. MACD、KDJ、RSI 等技术指标解读
3. 成交量变化趋势
4. 关键支撑位和压力位

输出格式：{{outputStyle}}
```

这里的 `{{stockCode}}`、`{{stockName}}`、`{{outputStyle}}` 就是变量。每次用的时候，只需要填上「600519」「贵州茅台」「Markdown 格式」，系统就会自动把占位符替换掉，生成一份完整的 Prompt 发给大模型。

看起来简单对吧？但要把这件事做好，需要解决几个有意思的问题——变量怎么定义才能让用户填得明白？模板怎么存才能被多个模块复用？更妙的是，Agent 怎么从一堆模板里自动选出最合适的那个？往下看。

---

## 二、整体思路：一个模板，两种玩法

### 2.1 模板长什么样？

在 SeaPack 里，一个模板不只是「一段 Prompt 文本」。它更像是一个「带表单的 Prompt」——正文里有填空题，每个空都有说明（这个空是股票代码，请输入 6 位数字），有类型（是文本框还是下拉选择），甚至有默认值。

这种设计来自一个很实际的考量：**模板不是给程序员用的，是给业务人员用的。** 如果变量定义不清晰，业务人员填错格式，生成的 Prompt 就会乱七八糟。所以我们把变量的所有元信息（名称、标签、类型、是否必填、选项列表）都单独管理起来，前端根据这些信息自动渲染出对应的输入控件——字符串变成输入框，枚举变成下拉菜单，布尔值变成开关。

### 2.2 模板的两种消费方式

模板做好了，谁来用？

**第一种：人直接用。** 在模板管理界面，点「调试」，填几个变量值，点「调用 LLM」，马上看到效果。这就像在 IDE 里调试代码一样，改改参数看看输出，直到满意为止。

**第二种：Agent 自动用。** Agent 在执行四步流水线（第八篇会详细讲）的时候，Step 1 就是从一堆关联模板中选出最合适的，拼装进系统提示词。这不是人手动选的，而是让 LLM 根据用户的问题来智能选择——你说「分析茅台的技术面」，LLM 就帮你挑出技术分析模板；你说「帮我写一篇关于人工智能的文章」，LLM 就选内容生成模板。

```
模板的两条路径：

人用：  打开模板 → 填变量 → 点按钮 → 拿结果（所见即所得）

Agent 用：用户提问 → Agent 让 LLM 选模板 → 自动选中 → 拼进提示词 → 大模型按套路回答
```

---

## 三、后端怎么实现的

### 3.1 几个关键文件，各干各的活

后端这件事拆成了 8 个核心文件，每个文件的职责可以用一句话概括：

| 文件 | 一句话职责 |
| --- | --- |
| `PromptTemplate.java` | 模板的「身份证」——存名称、正文、分类等基本信息 |
| `TemplateVariable.java` | 变量的「说明书」——告诉前端这个空该怎么填 |
| `PromptTemplateMapper.xml` | 数据库翻译官——定义怎么查、怎么存模板数据 |
| `TemplateVariableMapper.xml` | 变量的数据管家——管理变量的增删改查 |
| `PromptTemplateService.java` | 业务大管家——模板的增删改查、复制、执行全归它管 |
| `AiExecuteHelper.java` | 万能工具箱——变量替换和 LLM 调用这两个活，谁需要谁来借 |
| `PromptTemplateController.java` | 门面——把后端能力翻译成 HTTP 接口给前端调 |
| `AgentPrompt.java` | Agent 和模板之间的「红娘」——记录哪个 Agent 关联了哪些模板 |

这里有个设计上的小聪明：`AiExecuteHelper` 是一个纯静态工具类，谁都能用。模板执行要用它（替换变量 + 调 LLM），技能执行也要用它（后面技能篇会讲），不用每个 Service 都写一遍同样的逻辑。这种「公共设施」式的设计，后面会越来越感受到好处。

### 3.2 数据库：为什么要分两张表？

很多人的第一反应是：一个模板不就是一段文本吗，一张表不就搞定了？确实，如果模板只是存储和展示，一张表就够了。但我们的模板要支持一个很酷的功能：**根据变量类型自动渲染不同的输入控件。**

这就意味着，每个变量不仅要记住「名字是什么」，还要记住「它是文本框还是下拉菜单」「是不是必填」「有没有默认值」「下拉菜单的选项有哪些」。如果把这些信息都塞进模板正文的注释里（比如 `{{stockCode|text|股票代码|必填}}`），解析起来会非常痛苦，而且前端在不解析正文的情况下根本不知道该渲染什么控件。

所以，最干净的做法就是**变量独立成表**。模板正文保持纯净（只有 `{{变量名}}`），变量的元信息放在另一张表里，通过 `templateId` 关联：

```
模板表（ai_prompt_template）          变量表（ai_template_variable）
┌──────────────────────┐            ┌─────────────────────────────┐
│ 你是一位分析师，请分析 │            │ var_name = "stockCode"      │
│ {{stockCode}} {{stockName}}│      │ label = "股票代码"          │
│ 的技术面...           │            │ var_type = "string"         │
│                       │            │ required = 1（必填）         │
│ code = "stock_tech"  │            │ placeholder = "请输入6位代码"│
│ category = "stock"   │            └─────────────────────────────┘
└──────────────────────┘
     ↑ 两个表通过 template_id 关联
```

#### 实体代码

模板实体有个值得注意的设计：`variables` 字段用了 `@Transient` 注解，意思是「这个字段不对应数据库列」。列表查询时不加载变量（保持轻量），详情查询时通过 MyBatis 嵌套查询自动填充——查模板的同时顺便把关联的变量也查出来：

```java
@Entity
@Data
@Table(name = "ai_prompt_template")
public class PromptTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String code;           // 唯一编码，用于跨模块引用

    @Column(columnDefinition = "TEXT")
    private String content;        // 模板正文，含 {{变量名}} 占位符

    private String category;       // 分类：stock_analysis / content_gen / ...
    private String description;
    private String outputFormat;   // markdown/json/text/html
    private String version;
    private Integer useCount;
    private Integer status;        // 1启用 0禁用
    private Long createdBy;

    @Transient                    // 非数据库字段，联查时填充
    private List<TemplateVariable> variables;
}
```

变量实体也有个有意思的细节：`options` 字段存的是 JSON，但前端传过来的可能是字符串也可能是对象数组。所以 `setOptions()` 方法要处理两种格式——不管前端传什么花样，最终都给你序列化成 JSON 字符串：

```java
@Entity
@Data
@Table(name = "ai_template_variable")
public class TemplateVariable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long templateId;
    private String varName;        // 变量名，对应 {{var_name}}
    private String label;          // 显示标签，如"股票代码"
    private String varType;        // string/number/boolean/select/date
    private Integer required;      // 1必填 0选填
    private String defaultValue;

    @Setter(AccessLevel.NONE)
    @Column(columnDefinition = "JSON")
    private String options;        // select 类型选项 [{label,value}]

    private String placeholder;
    private Integer sortOrder;

    // options 支持 String 和 Object 两种 setter
    public void setOptions(Object options) {
        if (options == null) {
            this.options = null;
        } else if (options instanceof String) {
            this.options = (String) options;
        } else {
            this.options = OPTIONS_MAPPER.writeValueAsString(options);
        }
    }
}
```

#### MyBatis 嵌套查询

这里用到了 MyBatis 的 `<collection>` 嵌套查询，翻译成人话就是：**查模板的时候顺便把变量也查了，不用你自己手动发两次 SQL。** 执行 `selectById(1)` 时，MyBatis 会先查模板主表，然后自动拿着模板 ID 去变量表再查一次，把结果塞进 `variables` 字段：

```
selectById(1)
    │
    ├── 1. SELECT * FROM ai_prompt_template WHERE id = 1
    │      → 拿到模板基础信息
    │
    └── 2. SELECT * FROM ai_template_variable WHERE template_id = 1 ORDER BY sort_order
              → 拿到变量列表，自动塞进 PromptTemplate.variables
```

```xml
<!-- PromptTemplateMapper.xml -->
<resultMap id="DetailMap" type="PromptTemplate" extends="BaseMap">
    <collection property="variables" ofType="TemplateVariable"
                column="id"
                select="TemplateVariableMapper.selectByTemplateId"/>
</resultMap>

<select id="selectById" resultMap="DetailMap">
    SELECT * FROM ai_prompt_template WHERE id = #{id}
</select>
```

**设计要点**：列表查询用 `BaseMap`（不加载变量，快），详情查询用 `DetailMap`（加载变量，全）。就像点外卖时「只要套餐」和「套餐+饮料+甜品」的区别——按需加载，不浪费。

**前端的自动检测**：用户在编辑模板正文时写了 `{{stockCode}}`，前端会立刻用正则表达式扫出来，提示「已识别 1 个变量」。用户不用手动去变量表里新建一条记录，只要在正文里写占位符，系统就会自动感知。这种「你写了我就认」的体验，比手动维护两个地方的对应关系舒服多了。

### 3.3 模板执行：从填空到出答案

模板执行是整个系统的「高光时刻」——用户填好变量，点一下按钮，几秒钟后拿到大模型的回答。背后发生了什么？简单说就是三步：**找模板 → 填空 → 发给大模型。**

```
用户点「调用 LLM」
    │
    ▼
① 根据 templateId 从数据库找到模板 → 拿到正文和变量定义
    │
    ▼
② 把用户填的值替换进正文
    │   输入：  "你是一位分析师，请分析 {{stockCode}} {{stockName}} 的技术面"
    │   参数：  {stockCode: "600519", stockName: "贵州茅台"}
    │   输出：  "你是一位分析师，请分析 600519 贵州茅台 的技术面"
    │
    ▼
③ 把渲染好的 Prompt 发给大模型（非流式，等它完整回答）
    │
    ▼
④ 拿到结果，连同耗时、Token 消耗一起返回给前端
```

这个「填空」操作的实现其实很直白——用正则扫描正文中的 `{{xxx}}`，从参数 Map 里找到对应的值替换掉。有个小细节：正则允许写成 `{{ stockCode }}`（带空格），这样写模板的时候不用太小心翼翼：

```java
// AiExecuteHelper.java — 变量替换
public static String replacePlaceholders(String template, Map<String, Object> params) {
    if (template == null || params == null) {
        return template;
    }
    // 正则匹配 {{variable}} 和 {{ variable }}（带空格也行）
    Pattern pattern = Pattern.compile("\\{\\{\\s*(\\w+)\\s*}}");
    Matcher matcher = pattern.matcher(template);

    StringBuffer sb = new StringBuffer();
    while (matcher.find()) {
        String key = matcher.group(1);          // 比如 "stockCode"
        Object value = params.get(key);          // 从用户填的值里找
        String replacement = value != null ? value.toString() : "";
        matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
    }
    matcher.appendTail(sb);
    return sb.toString();
}
```

**有个容易踩的坑**：`quoteReplacement` 这个调用不能省。如果你的变量值里包含 `$` 或 `\`（比如一段 JSON），没有这个保护的话，正则引擎会把它们当成特殊字符处理，替换结果就乱了。另外 `appendTail` 确保模板末尾没被匹配到的文本也能保留——少写了这行，你的模板结尾会神秘消失。

替换完占位符后，就该调用 LLM 了。`callLLM()` 构建的是 OpenAI 兼容格式的请求，把渲染好的 Prompt 作为 `system` 消息发送（不是 `user` 消息，因为这是「角色设定 + 任务指令」，不是用户直接说的话）：

```java
// AiExecuteHelper.java — LLM 调用
public static AiExecuteResult callLLM(String filledPrompt,
                                       BigDecimal temperature,
                                       Integer maxTokens,
                                       RestTemplate restTemplate,
                                       AIProperties aiProperties) {
    long startTime = System.currentTimeMillis();

    // 获取当前激活的 AI 提供商配置
    String providerName = aiProperties.getActiveProvider();
    AIProperties.ProviderConfig config = aiProperties.getProviders().get(providerName);

    // 构建 OpenAI 兼容格式请求
    String url = config.getBaseUrl().replaceAll("/+$", "") + "/chat/completions";
    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("model", config.getChatModel());
    requestBody.put("messages", List.of(
        Map.of("role", "system", "content", filledPrompt)  // 作为 system 消息
    ));
    requestBody.put("stream", false);  // 非流式，一次性拿完整结果

    // 发送请求
    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
    Map<String, Object> apiResponse = restTemplate.postForObject(url, entity, Map.class);
    long durationMs = System.currentTimeMillis() - startTime;

    // 解析响应，组装结果
    AiExecuteResult result = new AiExecuteResult();
    result.setRenderedPrompt(filledPrompt);
    result.setOutput(output);
    result.setTokensPrompt(promptTokens);
    result.setTokensCompletion(completionTokens);
    result.setDurationMs((int) durationMs);
    return result;
}
```

**为什么用「非流式」调用？** 第五篇的通用对话用的是流式（streaming），这里却用非流式（stream: false）。原因很简单：通用对话是「聊天」，需要实时交互；模板执行是「提问拿答案」，更像是一次性的搜索查询。而且模板执行需要一次性展示完整的 Prompt 渲染结果和 Token 统计，流式的话这些信息不好组织。

#### 模板的「复制」功能

你可能注意到了模板管理界面有个「复制」按钮。使用场景是这样的：你有一个效果不错的「股票技术分析模板」，想基于它做一个「股票基本面分析模板」，它们 80% 的内容一样，只是分析维度不同。这时候复制一下，改改不同之处就行了，不用从头写：

```java
// PromptTemplateService.java — 复制模板
@Transactional
public PromptTemplate copy(Long id) {
    // 1. 查询源模板（含变量）
    PromptTemplate source = templateMapper.selectById(id);

    // 2. 创建副本：名称追加"（副本）"，编码追加"_copy"
    PromptTemplate copy = new PromptTemplate();
    copy.setName(source.getName() + "（副本）");
    copy.setCode(source.getCode() + "_copy");
    copy.setContent(source.getContent());
    // ... 复制其他字段
    templateMapper.insert(copy);

    // 3. 复制变量定义（清掉 ID，关联到新模板）
    if (source.getVariables() != null && !source.getVariables().isEmpty()) {
        List<TemplateVariable> copiedVars = source.getVariables().stream()
            .map(v -> { v.setId(null); v.setTemplateId(copy.getId()); return v; })
            .toList();
        variableMapper.batchInsert(copiedVars);
    }
    return copy;
}
```

就像手机里的「克隆 App」，复制出来的是一个完整的独立副本，改了不影响原来的。名称自动加「（副本）」后缀，变量也一起复制过来，省心。

### 3.4 Agent 怎么自动选模板？（用 AI 管 AI）

这是整个模板系统最有意思的部分——也是我觉得写得最「骚」的一个设计。

假设一个 Agent 关联了 5 个模板：股票技术分析、股票基本面分析、内容生成、数据问答、文本润色。当用户问「帮我分析一下茅台最近的走势」，Agent 应该选哪个？如果用户又问「帮我写一篇关于人工智能的文章」，又该选哪个？

**用硬编码规则？** 比如匹配关键词「分析」就选技术分析模板？太脆弱了——「帮我分析一下这篇文章的写作风格」显然不该触发股票分析模板。

**我们的做法是：让 LLM 来选。** 没错，用 AI 来决定该用哪个 AI 模板——有点套娃的意思，但确实好使。把所有模板的名称和前 100 个字预览发给 LLM，让它根据用户的问题判断该用哪些模板，返回一个 ID 列表：

```java
// AgentTestChatService.java — selectPromptsByLLM
// 给 LLM 的 Prompt 长这样：
String systemPrompt = "你是一个模板选择器。根据用户消息，从模板列表中选出与用户意图最相关的模板。\n\n" +
    "可用模板：\n" + templateListDesc + "\n\n" +
    "规则：\n" +
    "1. 只返回 JSON 数组，包含选中模板的 ID，如 [1, 3]\n" +
    "2. 根据用户意图选择最相关的模板，可以选多个\n" +
    "3. 如果用户意图不明确或与所有模板无关，返回所有模板的 ID\n" +
    "4. 不要返回任何解释文字、markdown 标记或其他内容\n\n" +
    "用户消息：" + userMessage;

// temperature=0，确保每次选择结果稳定
requestBody.put("temperature", 0);

// 解析 LLM 返回的 ID 列表
List<Integer> selectedIds = objectMapper.readValue(content, List.class);
```

整个流程翻译成人话就是：

```
给 LLM 看的模板菜单：

[{"id":1, "name":"股票技术分析", "description":"你是一位分析师，请分析..."},
 {"id":2, "name":"内容生成",     "description":"你是一位专业的文章写手..."},
 {"id":3, "name":"文本润色",     "description":"请对以下文本进行润色..."}]

用户说：「帮我分析一下茅台最近的走势」

LLM 内心：嗯，这明显是股票技术分析嘛 → 返回 [1]

用户说：「帮我写一篇关于人工智能的文章」

LLM 内心：这是内容生成的活儿 → 返回 [2]

用户说：「从技术面和基本面两个角度分析茅台」

LLM 内心：两个都要 → 返回 [1, 2]  ← 关键词匹配做不到这种语义判断
```

**如果 LLM 挂了怎么办？** 降级。直接把所有模板都加载上，宁可多消耗一点 Token，也不能让功能中断。这是做 AI 应用的一条铁律：**大模型是不可靠的队友，你必须随时准备兜底方案。** 代码里的 try-catch 不是摆设，而是你的安全网。

完整的组装流程：

```
assemblePrompt (Step 1: 提示词组装)
    │
    ├── ① 先加载 Agent 自己的基础提示词（"你是一个股票分析助手……"）
    │
    ├── ② 查出 Agent 关联的所有启用模板
    │
    ├── ③ 判断模板数量
    │      ├── 只有 0~1 个 → 不用选了，直接用
    │      └── 有多个 → 让 LLM 帮忙选（temperature=0）
    │            ├── 构建模板列表描述 JSON
    │            ├── 构建「模板选择器」system prompt
    │            ├── 调用 LLM
    │            ├── 解析返回的 ID 列表
    │            └── 过滤出选中的模板（如果 LLM 挂了，全部加载）
    │
    ├── ④ 把选中的模板正文按 sort_order 排序拼接进系统提示词
    │
    └── ⑤ 拼好的完整提示词传给下一步（知识库检索）
```

---

## 四、前端怎么做的

### 4.1 页面长什么样

打开模板管理页面，你会看到一个卡片式的列表，每张卡片是渐变色背景 + 图标 + 模板名称 + 描述 + 分类标签。右上角可以切换成表格视图。两种视图共享同一套数据，切换时有丝滑的过渡动画（Vue 的 `<Transition>` 组件，0.25s 的淡入淡出 + 微位移）。

```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  🎨 股票技术分析模板        │  │  🎨 内容生成模板             │
│  分析股票的K线、MACD等指标  │  │  根据主题和风格生成文章      │
│  [股票分析] [markdown]      │  │  [内容生成] [markdown]       │
│  23 次使用                  │  │  8 次使用                    │
│  Template    👁 🚀 📋 🗑   │  │  Template    👁 🚀 📋 🗑   │
└─────────────────────────────┘  └─────────────────────────────┘
```

每张卡片底部有几个小按钮：查看详情、调试（打开预览弹窗）、复制、删除。还有个开关可以直接启用/禁用模板——不用进入编辑页面就能快速切换状态。

### 4.2 编辑弹窗：写模板就像写填空题

点击「新增模板」或「编辑」，弹出一个表单弹窗。上半部分是基本信息（名称、编码、分类、描述），中间是一个大的文本编辑框用来写 Prompt 正文。

关键来了：当你在正文里写下 `{{stockCode}}`，文本框下面会实时提示「已识别 1 个变量」。继续写 `{{stockName}}`，变成「已识别 2 个变量」。然后在下方的「变量管理」表格里，可以为每个变量配置：它是文本框还是下拉菜单？是不是必填？默认值是什么？

这个交互的核心是 Vue 的 `computed` 属性——每次正文内容变化，正则都会重新扫描，自动检测变量：

```typescript
// PromptFormDialog.vue
const detectedVars = computed(() => {
  const content = form.value.content || ''
  // 正则匹配所有 {{variable}} 格式
  const matches = content.match(/\{\{(\w+)\}\}/g) || []
  // 去重后返回变量名数组
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))]
})
```

**一个贴心的细节**：变量子弹窗里，如果变量类型是 `select`（下拉选择），会多出一个「选项列表」的编辑区域，让你添加 `正式商务 → formal`、`轻松活泼 → casual` 这样的选项对。保存后，这些选项会序列化成 JSON 存到数据库里，预览的时候就会渲染成一个真正的下拉菜单。

#### 实体设计的双模式：详情 vs 编辑

弹窗支持「详情只读」和「编辑」两种模式——第一次打开是只读的（看看就好），点「编辑」按钮后才能改。这样设计是为了防止误操作：你只是想看看模板内容，手一抖就改了，那就尴尬了。

```vue
<!-- PromptFormDialog.vue -->
<!-- 只读态：模板正文用 <pre> 标签展示，不可编辑 -->
<div v-if="isReadonly" class="content-readonly">
  <pre class="content-pre">{{ form.content || '暂无内容' }}</pre>
</div>
<!-- 编辑态：模板正文用 textarea，可以编辑 -->
<div v-else class="w-full">
  <el-input
    v-model="form.content"
    type="textarea"
    :rows="8"
    placeholder="输入提示词模板，使用 {{变量名}} 标记可替换内容"
  />
</div>
```

### 4.3 预览弹窗：模板的「试衣间」

保存之前，你一定想先看看效果。预览弹窗就是干这个的——左边填变量值，右边实时展示渲染结果，还能直接调用 LLM 看看实际输出。

弹窗打开后，左侧会根据变量定义自动渲染表单。这里用到了 Vue 的 `v-if` / `v-else-if` 链：变量定义是字符串就渲染输入框，是数字就渲染数字选择器，是布尔就渲染开关，是下拉就渲染带选项的下拉菜单。你不需要手动写任何表单代码，变量定义里写了什么类型，前端就渲染什么控件：

```vue
<!-- PromptPreviewDialog.vue -->
<el-form-item v-for="v in variables" :key="v.varName" :label="v.label">
  <!-- string/date → 普通输入框 -->
  <el-input v-if="v.varType === 'string' || v.varType === 'date'"
            v-model="varValues[v.varName]"
            :placeholder="v.placeholder || `请输入${v.label}`" />
  <!-- number → 数字输入框 -->
  <el-input-number v-else-if="v.varType === 'number'"
                   v-model="varValues[v.varName]" style="width: 100%" />
  <!-- boolean → 开关 -->
  <el-switch v-else-if="v.varType === 'boolean'"
             v-model="varValues[v.varName]" />
  <!-- select → 下拉选择 -->
  <el-select v-else-if="v.varType === 'select'"
             v-model="varValues[v.varName]" style="width: 100%">
    <el-option v-for="opt in v.options" :key="opt.value"
               :label="opt.label" :value="opt.value" />
  </el-select>
  <!-- text → 多行文本 -->
  <el-input v-else-if="v.varType === 'text'"
            v-model="varValues[v.varName]" type="textarea" :rows="3" />
</el-form-item>
```

底部有两个按钮：「预览渲染」只做变量替换（不调 LLM），「调用 LLM」则会真正发送请求。

#### 三阶段执行动画：大模型在干活，请稍候

调用 LLM 的时候，界面会展示一个三阶段的动画——「连接 AI 服务」→「AI 生成中」→「处理结果」，配合一个实时跳动的计时器。为什么要做这个？因为大模型的响应时间通常在 10~60 秒之间，如果界面什么动静都没有，用户很可能以为系统挂了。这个动画就是一个「安心丸」——告诉你系统在干活，耐心等一下。

```
等待时的界面：

         ⏱ 0:23          ← 实时计时器
         已耗时

    ✓  连接 AI 服务       ← 已完成（绿色）
    ◐  AI 生成中          ← 进行中（蓝色旋转）
    ○  处理结果           ← 等待中（灰色）

    AI 生成通常需要 10~60 秒，请耐心等待
```

动画的实现其实就几行代码——`setInterval` 驱动计时器每秒跳一下，`setTimeout` 在 800ms 后自动从阶段 1 切到阶段 2，LLM 返回后切到阶段 3：

```typescript
// PromptPreviewDialog.vue
const phases = [
  { label: '连接 AI 服务', icon: Connection },
  { label: 'AI 生成中',    icon: IconLoading },  // Loading 会自动旋转
  { label: '处理结果',     icon: CircleCheckFilled },
]

function startPhases() {
  elapsed.value = 0
  currentPhase.value = 0
  timerHandle = setInterval(() => { elapsed.value++ }, 1000)  // 每秒 +1
  phaseHandle = setTimeout(() => { currentPhase.value = 1 }, 800)  // 800ms 后切阶段
}

function stopPhases() {
  currentPhase.value = 2  // 切到「处理结果」
  setTimeout(() => {
    clearInterval(timerHandle)
    clearTimeout(phaseHandle)
  }, 400)  // 给动画一点过渡时间
}
```

结果出来后，底部会展示三个指标：耗时多少毫秒、输入消耗了多少 Token、输出消耗了多少 Token。这些数据对于优化 Prompt 很有用——如果输入 Token 太多，说明 Prompt 太长了，该精简了。

### 4.4 代码组织：逻辑归逻辑，界面归界面

前端的代码组织遵循一个原则：**把业务逻辑抽到 Composable 里，页面只管怎么画。**

`usePromptTemplate` 这个函数把所有的查询、增删改查、状态切换逻辑都封装好了，`index.vue` 页面组件通过解构赋值拿到所有需要的东西：

```typescript
// usePromptTemplate.ts — 把所有脏活累活都包了
export function usePromptTemplate() {
  const queryParams = reactive<PromptTemplateQuery>({
    pageNum: 1,
    pageSize: 10,
  })
  const tableData = ref<PromptTemplate[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function handleQuery() {
    loading.value = true
    try {
      const res = await PromptTemplateAPI.page(queryParams)
      tableData.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  // ... 表单、删除、复制、状态切换等方法

  return {
    queryParams, tableData, total, loading,
    handleQuery, handleReset,
    formVisible, formIsEdit, formLoading, formData,
    openAddDialog, openViewDialog, onFormConfirm,
    handleDelete, handleCopy, onStatusChange,
  }
}
```

```typescript
// index.vue — 页面组件只需要解构赋值，干净得像刚洗过的代码
const {
  tableData, loading, handleQuery,     // 查询相关
  formData, openAddDialog,             // 表单相关
  handleDelete, handleCopy,            // 操作相关
} = usePromptTemplate()
```

页面代码里几乎看不到任何 API 调用、try-catch、loading 状态管理这些「脏活累活」，全部在 Composable 里处理好了。以后要加一个「批量删除」功能？只需要在 Composable 里加一个方法，页面组件加一个按钮就行，不用到处改代码。

---

## 五、变量类型：不只是文本框

变量类型系统是模板好用的关键。不同的变量类型，前端会渲染不同的输入控件，让填表的人不用理解「什么是字符串、什么是枚举」这些概念，只需要看控件就知道该怎么填。

| 类型 | 前端控件 | 后端处理 | 适合填什么 | 举例 |
| --- | --- | --- | --- | --- |
| `string` | 普通输入框 | `toString()` 直接替换 | 短文本 | 股票代码「600519」 |
| `number` | 带加减按钮的数字框 | `toString()` 替换 | 数值 | 字数要求「500」 |
| `boolean` | 开关按钮（开/关） | `true/false` 字面量 | 是或否 | 是否包含图表「开」 |
| `select` | 下拉菜单 + 选项列表 | 按选中值替换 | 从预设中选 | 文章风格「正式/活泼」 |
| `date` | 日期选择器 | 日期字符串替换 | 日期 | 截止日期「2024-01-01」 |
| `text` | 多行文本框 | 多行文本替换 | 长文本 | 文章正文 |
| `json` | 代码编辑器 | JSON 字符串替换 | 结构化数据 | API 返回的原始数据 |

**一个实用建议**：如果一个变量的值是固定的几个选项（比如分析维度：技术面/基本面/资金面），强烈建议用「下拉选择」而不是「字符串」。这样用户只能从预设选项里选，不会出现填了「技术」而不是「技术面」导致 Prompt 不通顺的情况。下拉选择就是给用户画了个圈——你只能在这个圈里选，别乱跑。

**有个要注意的坑**：后端的 `replacePlaceholders()` 对所有类型统一用 `toString()` 替换，所以 `boolean` 类型传入 `true` 会被替换为字符串 `"true"` 而不是布尔字面量。如果 LLM 需要的是布尔值，模板正文里写 `{{showChart}}` 就好，别在外面加引号。

---

## 六、API 接口一览

后端暴露的接口很规整，基本就是标准的 CRUD 加一个执行接口：

**模板管理（常规操作）**：

| 干什么 | 接口 | 方法 | 说明 |
| --- | --- | --- | --- |
| 分页列表 | `/ai/prompt-templates/page/list` | GET | 支持分类/状态/关键词筛选 |
| 全量列表 | `/ai/prompt-templates/all` | GET | 只返回已启用的，下拉选择用 |
| 查看详情 | `/ai/prompt-templates/detail/{id}` | GET | 含变量列表（嵌套查询） |
| 新增 | `/ai/prompt-templates/insert` | POST | 含变量定义，code 唯一性校验 |
| 编辑 | `/ai/prompt-templates/update` | POST | 变量先删后插（简单粗暴但好使） |
| 删除 | `/ai/prompt-templates/delete/{id}` | DELETE | 级联删除变量 |
| 复制 | `/ai/prompt-templates/copy/{id}` | POST | 创建副本，变量一起复制 |
| 启用/禁用 | `/ai/prompt-templates/updateStatus/{id}` | PUT | 一键切换状态 |

**模板执行（核心操作）**：

| 干什么 | 接口 | 方法 |
| --- | --- | --- |
| 执行模板 | `/ai/prompt-templates/execute` | POST |

执行接口的请求和响应长这样：

```json
// 请求：告诉后端用哪个模板、填什么值
{
  "templateId": 1,
  "params": { "stockCode": "600519", "stockName": "贵州茅台" },
  "userMessage": "请重点关注近期走势"
}

// 响应：拿到渲染后的 Prompt、LLM 的回答、Token 消耗
{
  "renderedPrompt": "你是一位分析师，请分析 600519 贵州茅台 的技术面 ...",
  "output": "贵州茅台近期呈现震荡上行趋势 ...",
  "tokensPrompt": 156,
  "tokensCompletion": 892,
  "durationMs": 12345
}
```

返回里的 `renderedPrompt` 很有用——你可以检查变量替换后的 Prompt 是不是你想要的样子，方便调试。如果渲染结果不对，多半是变量名写错了。

---

## 七、从创建到执行：一个模板的一生

把前后端串起来看，一个模板从诞生到被使用，经历了这样的旅程：

```
                  创建阶段                                    使用阶段
              ──────────                                  ──────────

  用户：打开模板管理页                        用户：打开预览弹窗
    ↓                                          ↓
  写 Prompt 正文                              填变量值（下拉选、输入框）
    ↓                                          ↓
  系统：「检测到 3 个变量」  ← 自动的          点「调用 LLM」
    ↓                                          ↓
  配置变量属性                                界面：三阶段动画 + 计时器
  （类型、标签、是否必填）                      ↓
    ↓                                        后端：加载模板 → 填空 → 发给大模型
  点「保存」                                    ↓
    ↓                                        拿到回答 + Token 统计
  后端：存模板 + 存变量（事务操作）             ↓
    ↓                                        展示结果（渲染Prompt + LLM输出）
  刷新列表，看到新模板
```

或者，在 Agent 的世界里，模板还有另一条路——被 AI 自动选中：

```
  用户：「帮我分析一下茅台最近的走势」
    ↓
  Agent：Step 1 - 提示词组装
    ├── 加载自己的基础提示词
    ├── 查出关联的 5 个模板
    ├── 让 LLM 从中选最相关的 → [1]（技术分析模板）
    ├── 拼接：基础提示词 + 技术分析模板正文
    └── 完整的 system prompt 传给 Step 2
    ↓
  Agent：Step 2 - 知识库检索（第六篇的内容）
    ↓
  Agent：Step 3 - 技能执行
    ↓
  Agent：Step 4 - 大模型流式回答（第五篇的内容）
```

---

## 八、设计上的一些思考

### 为什么不用流式调用？

第五篇的通用对话用了流式（streaming），这里模板执行却用非流式。原因很简单：通用对话是「聊天」，需要实时交互；模板执行是「提问拿答案」，更像是一次性的搜索查询。而且模板执行的结果需要一次性展示完整的 Prompt 渲染结果和 Token 统计，流式的话这些信息不好组织。就像点外卖和去餐厅吃饭的区别——外卖是一次性送到，餐厅是一道一道上。

### 为什么让 LLM 来选模板？

你可能会问：用关键词匹配不行吗？比如包含「分析」就选分析模板？问题在于关键词太粗了——「分析一下这篇文章的语法错误」和「分析一下茅台的走势」都包含「分析」，但需要的模板完全不同。

让 LLM 来选，它能理解语义。「分析走势」→ 技术分析；「分析语法」→ 文本处理。而且当用户的问题涉及多个领域时（比如「从技术面和基本面两个角度分析茅台」），LLM 可以同时选中两个模板，这是关键词匹配很难做到的。

**代价是什么？** 多了一次 LLM 调用，多消耗一些 Token，多花几秒钟。但在 Agent 场景下，这次调用的耗时相对于后面的完整回答来说微不足道，换来的是更精准的模板匹配，这波不亏。

### 变量自动检测：约定优于配置

用户在正文里写了 `{{stockCode}}`，系统就自动知道有一个叫 `stockCode` 的变量。这种「你写了我就认」的设计，比让用户先去变量表里手动新建一条记录、再回到正文里写占位符的流程友好得多——后者就像让你先去行政部填表申请开一把钥匙，再去仓库领钥匙，最后才能开门。而前者是「门本来就没锁，你推就行」。

而且正则检测是实时的——你每改一个字，检测结果就更新一次。如果正文里的占位符和变量表里的定义不一致（比如正文写了 `{{code}}` 但变量表里定义的是 `stockCode`），用户能立刻发现并修正，不会等到执行的时候才报错——那就像考试交卷了才发现审错题了，为时已晚。

---

## 九、核心文件速查

### 后端

| 文件 | 路径 | 干什么 |
| --- | --- | --- |
| PromptTemplate.java | `org.seaPack.model.ai` | 模板实体 |
| TemplateVariable.java | `org.seaPack.model.ai` | 变量实体（含 options JSON 处理） |
| AgentPrompt.java | `org.seaPack.model.ai` | Agent-模板关联表 |
| PromptTemplateMapper.xml | `resources/mapper/ai` | 模板 SQL（含 DetailMap 嵌套查询） |
| TemplateVariableMapper.xml | `resources/mapper/ai` | 变量 SQL（含批量插入） |
| PromptTemplateService.java | `org.seaPack.service.ai` | 模板业务逻辑（CRUD + 复制 + 执行） |
| AiExecuteHelper.java | `org.seaPack.service.ai` | 变量替换 + LLM 调用（公共工具类） |
| PromptTemplateController.java | `org.seaPack.controller.ai` | HTTP 接口 |

### 前端

| 文件 | 路径 | 干什么 |
| --- | --- | --- |
| index.vue | `views/aiModule/promptTemplate/` | 主页面（卡片/列表双模式） |
| PromptFormDialog.vue | `components/` | 新增/编辑弹窗（含变量管理） |
| PromptPreviewDialog.vue | `components/` | 预览/测试弹窗（变量表单 + LLM 调用） |
| PromptTemplateCard.vue | `components/` | 卡片组件（渐变图标 + 操作栏） |
| usePromptTemplate.ts | `utils/` | 业务逻辑 Composable |
| moduleOptions.ts | `utils/` | 常量选项（分类、变量类型等） |
| tableColumns.ts | `utils/` | 表格列配置 |
| promptTemplate.ts | `api/ai/` | API 接口定义 |
| types/promptTemplate.ts | `api/ai/types/` | TypeScript 类型定义 |

---

## 十、下一篇预告

回顾一下目前的文章路线：

- **第四篇**：AI 模块架构全景 → 知道系统有哪些零件
- **第五篇**：通用 LLM 流式对话 → 知道怎么和大模型聊天
- **第六篇**：RAG 知识库 → 知道怎么让大模型翻书
- **第七篇**：提示词模板 → 知道怎么让大模型按套路来（你在这里）

下一篇（第八篇）要讲的是整个 AI 模块最硬核的部分——**Agent 四步编排流水线**。把前面学的提示词组装、知识库检索、技能调用、LLM 流式回答串成一条完整的链路，再用 SSE 实时推送每一步的执行进度。如果你觉得前面几篇是「单个零件的说明书」，第八篇就是「整机装配手册」——也是这个系列里代码量最大、架构最复杂的一篇，做好心理准备。
