<template>
  <el-form :model="model" :inline="true" @keyup.enter="$emit('search')">
    <el-form-item label="关键字">
      <el-input :model-value="model.keyword" placeholder="股票代码/名称" clearable style="width: 180px" @update:model-value="emit('update:model', { ...model, keyword: $event })" />
    </el-form-item>
    <el-form-item label="分红年度">
      <el-date-picker :model-value="model.year" type="year" placeholder="全部" clearable style="width: 160px" value-format="YYYY" @update:model-value="emit('update:model', { ...model, year: $event })" />
    </el-form-item>
    <el-form-item label="分红类型">
      <el-select :model-value="model.dividendType" placeholder="全部" clearable style="width: 160px" @update:model-value="emit('update:model', { ...model, dividendType: $event })">
        <el-option v-for="opt in typeOpts" :key="opt.dictCode" :label="opt.dictName" :value="opt.dictCode" />
      </el-select>
    </el-form-item>
    <el-form-item label="实施状态">
      <el-select :model-value="model.status" placeholder="全部" clearable style="width: 160px" @update:model-value="emit('update:model', { ...model, status: $event })">
        <el-option v-for="opt in statusOpts" :key="opt.dictCode" :label="opt.dictName" :value="opt.dictCode" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="search" @click="$emit('search')">搜索</el-button>
      <el-button icon="refresh" @click="$emit('reset')">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { useDividendDict } from './useDividendDict'

defineProps<{ model: any }>()
const emit = defineEmits<{ search: []; reset: []; 'update:model': [value: any] }>()

const { typeOpts, statusOpts, load } = useDividendDict()
load()
</script>
