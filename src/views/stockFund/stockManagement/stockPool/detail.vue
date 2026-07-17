<template>
  <!-- 股票详情页：基本信息 / 分红 / K 线 / 财务 四个 Tab -->
  <div class="detail-container flex flex-col">
    <PageHeader :title="stockName" :edit="false" back-text="返回" @cancel="goBack">
      <template #button>
        <template v-for="b in aiBindings" :key="b.sceneId">
          <el-button
            v-if="(b.config?.displayType || 'button') === 'button'"
            :type="b.config?.type || 'primary'"
            @click="openAiDialog()"
          >
            <el-icon style="vertical-align: -2px; margin-right: 4px">
              <component :is="b.config?.icon || 'MagicStick'" />
            </el-icon>
            {{ b.config?.buttonText || b.agentName }}
          </el-button>
        </template>
      </template>
    </PageHeader>

    <el-tabs v-model="activeTab" class="detail-tabs flex-1">
      <!-- 标的概况 + 交易参数 -->
      <el-tab-pane label="基本信息" name="info" lazy>
        <StockInfoTab :info="stockInfo" :loading="infoLoading" />
      </el-tab-pane>
      <!-- 历年分红走势图 + 分红明细表 -->
      <el-tab-pane label="分红" name="dividend" lazy>
        <StockDividendTab :stock-code="stockInfo.stockCode" />
      </el-tab-pane>
      <!-- K 线图 + 日期筛选 + 行情概要 -->
      <el-tab-pane label="历史行情" name="price" lazy>
        <StockChartTab :stock-code="stockInfo.stockCode" />
      </el-tab-pane>
      <!-- 三大财务报表：资产负债表 / 利润表 / 现金流量表 -->
      <el-tab-pane label="财务数据" name="finance" lazy>
        <StockFinanceTab :data="financeData" :loading="financeLoading" />
      </el-tab-pane>
    </el-tabs>

    <!-- AI Agent 执行通用弹框 -->
    <AiAgentExecutor
      v-model:visible="aiDialogVisible"
      module-key="stockFund"
      position="detail-toolbar"
      :context="aiContext"
      @done="handleAiResult"
    />

    <!-- AI 分析结果展示弹框 -->
    <el-dialog v-model="resultVisible" :title="resultTitle" width="700px" class="ai-result-dialog">
      <div v-loading="resultLoading" class="result-content">
        <div v-if="resultContent" class="markdown-body" v-html="renderedResult" />
        <el-empty v-else description="暂无分析结果" :image-size="60" />
      </div>
      <template #footer>
        <el-button @click="resultVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { InstrumentAPI } from '@/api/stockFund/stock/instrument.ts'
import { generateMockFinance } from './components/detailShared'
import StockInfoTab from './components/StockInfoTab.vue'
import StockChartTab from './components/StockChartTab.vue'
import StockDividendTab from './components/StockDividendTab.vue'
import StockFinanceTab from './components/StockFinanceTab.vue'
import { useSceneBindings } from '@/hooks/useSceneBindings'
import MarkdownIt from 'markdown-it'
import { ElMessage } from 'element-plus'
const md = new MarkdownIt()

const router = useRouter()
const route = useRoute()
/** 从路由查询参数取股票 ID（对应 stock_pool 表主键） */
const stockCode = route.query?.stockCode || '000001'
const stockName = computed(()=>(route.query?.stockName || '--'))
function goBack() { router.back() }

/** 当前激活的 tab 名称 */
const activeTab = ref('info')
/** 标的详情（InstrumentDto），合并后挂载 stockCode 供子组件使用 */
const stockInfo = ref<any>({})
/** 三大财务报表原始数据 */
const financeData = ref<{ balance: any[]; income: any[]; cashflow: any[] }>({ balance: [], income: [], cashflow: [] })

const infoLoading = ref(true)
const financeLoading = ref(true)

/** 从 Store 获取股票详情工具栏位所有启用的 AI 场景绑定 */
const { bindings: aiBindings } = useSceneBindings('stockFund', 'detail-toolbar')

const aiDialogVisible = ref(false)
const aiContext = ref({ stockCode: '', stockName: '' })

/** AI 结果展示 */
const resultVisible = ref(false)
const resultTitle = ref('')
const resultContent = ref('')
const resultLoading = ref(false)

/** 将 markdown 渲染为 HTML */
const renderedResult = computed(() => {
  if (!resultContent.value) return ''
  try { return md.render(resultContent.value) }
  catch { return resultContent.value }
})

function openAiDialog() {
  aiContext.value = {
    stockCode: stockCode as string,
    stockName: stockName.value,
  }
  aiDialogVisible.value = true
}

function handleAiResult(result: { content: string; agentName: string; agentId: number; elapsedMs: number }) {
  if (!result.content) {
    ElMessage.error('AI 分析执行失败，请重试')
    return
  }
  resultTitle.value = `${result.agentName} 分析结果`
  resultContent.value = result.content
  resultVisible.value = true
}

onMounted(async () => {
  if (!stockCode) return
  try {
    infoLoading.value = true
    financeLoading.value = true
    const [instruments] = await Promise.all([
      InstrumentAPI.getByCode(stockCode as string).catch(() => null),
    ])
    const inst = Array.isArray(instruments) && instruments.length ? instruments[0] : null
    stockInfo.value = { ...inst, stockCode: inst?.code }
    infoLoading.value = false

    financeData.value = generateMockFinance(stockCode as string)
    financeLoading.value = false

  } catch {
    infoLoading.value = false
    financeLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.detail-container {
  height: 100%;
  width: 100%;
  padding: 0;
  background: #f5f7fa;
  box-sizing: border-box;
  overflow-y: auto;
}
.detail-tabs {
  background: #fff; border-radius: 8px; padding: 0 16px 16px;
}
:deep(.ai-result-dialog .result-content) {
  min-height: 200px;
  max-height: 60vh;
  overflow-y: auto;
  .markdown-body { line-height: 1.8; font-size: 14px; }
}
</style>
