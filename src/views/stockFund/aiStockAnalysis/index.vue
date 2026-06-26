<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-icon :size="22" color="#F44336"><TrendCharts /></el-icon>
        <span class="page-title">AI 个股诊断</span>
        <span class="page-subtitle">输入股票代码，AI 自动整合行情、分红、K线等数据生成分析报告</span>
      </div>
    </div>

    <div class="analysis-layout">
      <!-- 左侧：输入区 -->
      <el-card shadow="never" class="input-panel">
        <div class="panel-title">诊断设置</div>

        <div class="form-item">
          <label class="form-label">股票代码</label>
          <StockCodeInput
            v-model="stockCode"
            v-model:exchange="exchange"
            :loading="loading"
            :quick-stocks="HOT_STOCKS"
            analyze-text="开始诊断"
            @analyze="analyze"
          />
        </div>

        <div class="form-item">
          <label class="form-label">分析维度</label>
          <el-radio-group v-model="dimension" class="dimension-group">
            <el-tooltip
              v-for="item in ANALYZE_DIMENSIONS"
              :key="item.value"
              :content="item.desc"
              placement="top"
            >
              <el-radio-button :label="item.value" :value="item.value">
                {{ item.label }}
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </div>

        <div class="form-item">
          <label class="form-label">补充问题（可选）</label>
          <el-input
            v-model="extraQuestion"
            type="textarea"
            :rows="4"
            placeholder="例如：这只股票适合长期持有吗？近期有没有分红计划？"
            maxlength="200"
            show-word-limit
          />
        </div>

        <div class="form-actions">
          <el-button type="primary" size="large" :loading="loading" @click="analyze()">
            <el-icon class="mr-4px"><TrendCharts /></el-icon>
            AI 智能诊断
          </el-button>
          <el-button size="large" @click="reset">重置</el-button>
        </div>
      </el-card>

      <!-- 右侧：结果区 -->
      <el-card shadow="never" class="result-panel">
        <AiAnalysisResult
          :content="report?.content"
          :loading="loading"
          :title="reportTitle"
          :on-refresh="reanalyze"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendCharts } from '@element-plus/icons-vue';
import StockCodeInput from '@/views/stockFund/components/StockCodeInput.vue';
import AiAnalysisResult from '@/views/stockFund/components/AiAnalysisResult.vue';
import { useStockAnalysis } from '@/views/stockFund/components/useStockAnalysis';
import { HOT_STOCKS, ANALYZE_DIMENSIONS } from '@/views/stockFund/components/stock';

const { stockCode, exchange, dimension, extraQuestion, loading, report, analyze, reset, reanalyze } = useStockAnalysis();

const reportTitle = computed(() => {
  if (report.value?.stockName) {
    return `${report.value.stockName}(${report.value.stockCode}) - AI 个股诊断报告`;
  }
  if (stockCode.value) {
    return `${stockCode.value} - AI 个股诊断报告`;
  }
  return 'AI 个股诊断报告';
});
</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f5f7fa;
  box-sizing: border-box;
  padding: 12px;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 700;
    color: #303133;
  }

  .page-subtitle {
    font-size: 13px;
    color: #909399;
    margin-left: 12px;
  }
}

.analysis-layout {
  flex: 1;
  display: flex;
  gap: 12px;
  overflow: hidden;
}

.input-panel {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.el-card__body) {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
  }
}

.result-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.el-card__body) {
    height: 100%;
    padding: 0;
  }
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.dimension-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.form-actions {
  margin-top: auto;
  display: flex;
  gap: 12px;
}
</style>
