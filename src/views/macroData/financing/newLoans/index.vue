<template>
  <div class="flex flex-col gap-16px">
    <el-alert title="新增人民币贷款反映实体经济的信贷需求强度，是信用扩张的核心观测指标" type="info" :closable="false" show-icon />
    <div class="rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden p-x-15 p-y-10">
      <div class="p-b-10 border-b border-[var(--el-border-color-lighter)]">
        <span class="text-15px font-600 color-[var(--el-text-color-primary)]">数据说明</span>
      </div>
      <p class="m-t-10 color-[#606266] text-14px leading-7">
        数据来源：中国人民银行月度金融统计数据。新增贷款 = 当月各项贷款余额 - 上月各项贷款余额。
        后续对接真实数据后，将展示趋势图和对比分析。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
