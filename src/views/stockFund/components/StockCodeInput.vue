<template>
  <div class="stock-code-input">
    <el-input
      v-model="localCode"
      class="stock-input"
      :placeholder="placeholder"
      clearable
      maxlength="6"
      @keyup.enter="handleAnalyze"
    >
      <template #prepend>
        <el-select v-model="localExchange" class="exchange-select" @change="handleExchangeChange">
          <el-option label="沪" value="SH" />
          <el-option label="深" value="SZ" />
          <el-option label="京" value="BJ" />
          <el-option label="全部" value="" />
        </el-select>
      </template>
      <template #append>
        <el-button type="primary" :icon="Search" :loading="loading" @click="handleAnalyze">
          {{ analyzeText }}
        </el-button>
      </template>
    </el-input>

    <div v-if="quickStocks.length" class="quick-stocks">
      <span class="quick-label">热门个股：</span>
      <el-check-tag
        v-for="stock in quickStocks"
        :key="stock.code"
        :checked="localCode === stock.code"
        class="quick-tag"
        @change="selectStock(stock)"
      >
        {{ stock.name }}({{ stock.code }})
      </el-check-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';

export interface QuickStock {
  code: string;
  name: string;
  exchange?: string;
}

interface Props {
  modelValue: string;
  exchange?: string;
  loading?: boolean;
  placeholder?: string;
  analyzeText?: string;
  quickStocks?: QuickStock[];
}

const props = withDefaults(defineProps<Props>(), {
  exchange: '',
  loading: false,
  placeholder: '请输入股票代码，如 600519',
  analyzeText: '诊断',
  quickStocks: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:exchange', value: string): void;
  (e: 'analyze', stockCode: string): void;
  (e: 'select', stock: QuickStock): void;
}>();

const localCode = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const localExchange = computed({
  get: () => props.exchange,
  set: (val) => emit('update:exchange', val),
});

function handleAnalyze() {
  const code = localCode.value.trim();
  if (!code) {
    ElMessage.warning('请输入股票代码');
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    ElMessage.warning('股票代码应为 6 位数字');
    return;
  }
  emit('analyze', code);
}

function handleExchangeChange(val: string) {
  emit('update:exchange', val);
}

function selectStock(stock: QuickStock) {
  localCode.value = stock.code;
  if (stock.exchange) {
    localExchange.value = stock.exchange;
  }
  emit('select', stock);
  emit('analyze', stock.code);
}
</script>

<style scoped lang="scss">
.stock-code-input {
  width: 100%;
}

.stock-input {
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-input-border-color) inset;
  }
}

.exchange-select {
  width: 80px;
}

.quick-stocks {
  margin-top: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  .quick-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .quick-tag {
    font-size: 13px;
    padding: 4px 10px;
    cursor: pointer;
  }
}
</style>
