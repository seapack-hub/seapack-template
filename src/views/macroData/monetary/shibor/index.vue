<template>
  <div class="flex flex-col gap-16px">
    <el-alert title="SHIBOR（上海银行间同业拆放利率）反映银行体系短期资金松紧程度" type="info" :closable="false" show-icon />
    <div class="rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden p-x-15 p-y-10">
      <div class="p-b-10 border-b border-[var(--el-border-color-lighter)]">
        <span class="text-15px font-600 color-[var(--el-text-color-primary)]">说明</span>
      </div>
      <p class="m-t-10 color-[#606266] text-14px leading-7">
        SHIBOR 数据目前为日频数据，后续可对接真实数据源。当前展示示意数据。
        关键指标：隔夜利率反映当日资金面；7天利率反映短期流动性；1月/1年利率反映中期预期。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
