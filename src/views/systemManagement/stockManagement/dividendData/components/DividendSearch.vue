<template>
  <el-form :model="model" :inline="true" @keyup.enter="$emit('search')">
    <el-form-item label="关键字">
      <el-input v-model="model.keyword" placeholder="股票代码/名称" clearable style="width: 180px" />
    </el-form-item>
    <el-form-item label="分红年度">
      <el-date-picker v-model="model.year" type="year" placeholder="全部" clearable style="width: 130px" value-format="YYYY" />
    </el-form-item>
    <el-form-item label="分红类型">
      <el-select v-model="model.dividendType" placeholder="全部" clearable style="width: 120px">
        <el-option v-for="opt in typeOpts" :key="opt.dictCode" :label="opt.dictName" :value="opt.dictCode" />
      </el-select>
    </el-form-item>
    <el-form-item label="实施状态">
      <el-select v-model="model.status" placeholder="全部" clearable style="width: 120px">
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
defineEmits<{ search: []; reset: [] }>()

const { typeOpts, statusOpts, load } = useDividendDict()
load()
</script>
