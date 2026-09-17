<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-icon :size="22" color="#F44336"><TrendCharts /></el-icon>
        <span class="page-title">AI 个股诊断</span>
        <span class="page-subtitle">选择场景，输入股票代码，AI 自动整合行情、分红、K线等数据生成分析报告</span>
      </div>
    </div>

    <div class="analysis-layout">
      <!-- 左侧：输入区 -->
      <el-card shadow="never" class="input-panel">
        <div class="panel-title">诊断设置</div>

        <!-- 场景选择 -->
        <div class="form-item">
          <label class="form-label">AI 场景</label>
          <div v-if="selectedScene" class="scene-selected">
            <el-tag type="success" class="scene-tag">
              {{ selectedScene.name }}
            </el-tag>
            <el-button text type="info" size="small" @click="unbindScene">更换</el-button>
          </div>
          <el-popover v-else placement="bottom-start" :width="340" trigger="click" @show="loadScenes">
            <template #reference>
              <el-button class="scene-select-btn">
                <el-icon style="margin-right: 4px"><Grid /></el-icon>
                选择 AI 场景
              </el-button>
            </template>
            <div class="scene-popover">
              <el-input
                v-model="sceneSearch"
                placeholder="搜索场景..."
                clearable
                class="mb-8px"
                size="small"
              />
              <div v-if="scenesLoading" class="flex justify-center py-12px">
                <el-icon class="is-loading" :size="16"><Loading /></el-icon>
              </div>
              <div v-else-if="filteredScenes.length === 0" class="text-13px color-#909399 text-center py-12px">
                暂无可用场景
              </div>
              <div v-else class="scene-grid">
                <div
                  v-for="scene in filteredScenes"
                  :key="scene.id"
                  class="scene-option"
                  @click="handleSceneSelect(scene)"
                >
                  <span class="scene-option-name">{{ scene.name }}</span>
                  <span v-if="scene.description" class="scene-option-desc">{{ scene.description }}</span>
                </div>
              </div>
            </div>
          </el-popover>
        </div>

        <div class="form-item">
          <label class="form-label">股票代码</label>
          <StockCodeInput
            v-model="stockCode"
            v-model:exchange="exchange"
            :loading="loading"
            :quick-stocks="HOT_STOCKS"
            analyze-text="搜索"
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
          <el-tooltip
            :content="!selectedScene ? '请先选择一个 AI 场景' : ''"
            :disabled="!!selectedScene"
            placement="top"
          >
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              :disabled="!selectedScene"
              @click="analyze()"
            >
              <template v-if="!loading">
                <el-icon class="mr-4px"><Cpu /></el-icon>
                AI 智能诊断
              </template>
              <template v-else>诊断中...</template>
            </el-button>
          </el-tooltip>
          <el-button v-if="loading" size="large" @click="cancelAnalysis">取消</el-button>
          <el-button v-else size="large" @click="reset">重置</el-button>
        </div>
      </el-card>

      <!-- 右侧：结果区 -->
      <el-card shadow="never" class="result-panel">
        <AiAnalysisResult
          :content="content"
          :loading="loading"
          :title="reportTitle"
          :steps="steps"
          :total-duration-ms="totalDurationMs"
          :token-usage="tokenUsage"
          :on-refresh="reanalyze"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendCharts, Grid, Cpu, Loading } from '@element-plus/icons-vue';
import StockCodeInput from '@/views/stockFund/components/StockCodeInput.vue';
import AiAnalysisResult from '@/views/stockFund/components/AiAnalysisResult.vue';
import { useStockAnalysis } from '@/views/stockFund/components/useStockAnalysis';
import { HOT_STOCKS, ANALYZE_DIMENSIONS } from '@/views/stockFund/components/stock';
import type { Scene } from '@/api/ai/scene';
import { usePagePermission } from '@/hooks/usePagePermission'

usePagePermission('aiStockAnalysis', 'AI 个股诊断')

const {
  // 场景
  sceneList, selectedScene, scenesLoading,
  loadScenes, selectScene, unbindScene,
  // 输入
  stockCode, exchange, dimension, extraQuestion,
  // 状态
  loading, content, steps, tokenUsage, totalDurationMs,
  reportTitle,
  // 方法
  analyze, cancelAnalysis, reset, reanalyze,
} = useStockAnalysis();

// ===== 场景搜索 =====
const sceneSearch = ref('');

const filteredScenes = computed(() => {
  if (!sceneSearch.value) return sceneList.value;
  const q = sceneSearch.value.toLowerCase();
  return sceneList.value.filter(s =>
    s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q),
  );
});

function handleSceneSelect(scene: Scene) {
  selectScene(scene);
  sceneSearch.value = '';
  // 关闭 popover
  document.body.click();
}
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

// ===== 场景选择 =====
.scene-selected {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scene-tag {
  max-width: 280px;

  :deep(.el-tag__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.scene-select-btn {
  width: 100%;
  justify-content: flex-start;
  border-style: dashed;
}

.scene-popover {
  .scene-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    max-height: 240px;
    overflow-y: auto;
  }

  .scene-option {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .scene-option-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .scene-option-desc {
      font-size: 11px;
      color: var(--el-text-color-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
