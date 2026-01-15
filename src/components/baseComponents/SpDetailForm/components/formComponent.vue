<template>
  <el-form-item v-bind="column" class="relative" :class="{ hasTooltip: column?.tooltipOption, 'detail-value': !editable }">
    <!--标题添加tips-->
    <template v-if="column.tips" #label>
      <div class="inline-flex items-center gap-x-3px">
        {{ column.label }}
        <el-tooltip effect="dark" :content="String(column.tips)" placement="top">
          <SPIcon name="tips" size="14px" color="#909299"></SPIcon>
        </el-tooltip>
      </div>
    </template>
    <div class="flex items-center" :class="{ 'w-[100%]': column.name !== 'TyUpload' }">
      <slot
        v-if="column.slotName"
        :name="column.slotName"
        :props="column"
        :componentProps="column.props"
        :formData="formData"
        :editable="editable"
      ></slot>
      <SpDetailEditable
        v-else
        v-model="formData[column.prop]"
        :editable="[true, false].includes(column.editable) ? column.editable : editable"
        v-bind="{ name: column.name, ...column.props, valueClass: column.valueClass, column }"
        :class="{ pickerComponents: isDateRangeComponent(column as any) }"
        class="display-inherit flex-1"
      >
        <Suspense>
          <template #default>
            <component
              :is="column.componentsName"
              v-bind="{ ...column.props, disabled: getDisabled(column.props) }"
              v-model="formData[column.prop]"
              :class="{ pickerComponents: isDateRangeComponent(column as any) }"
              v-on="{ ...column.event }"
              @click.stop
            >
            </component>
          </template>
          <template #fallback>
            <el-skeleton class="w-[100%]" animated>
              <template #template>
                <el-skeleton-item variant="text" class="w-[100%]" style="--el-font-size-small: 32px" />
              </template>
            </el-skeleton>
          </template>
        </Suspense>
      </SpDetailEditable>
      <el-tooltip v-if="column.tooltipOption && editable" v-bind="column.tooltipOption">
        <SPIcon name="tips" text="[var(--el-text-color-secondary)]" class="ml-[8px]"></SPIcon>
      </el-tooltip>
      <slot
        v-if="column.slotOptions"
        :name="column?.slotOptions?.slotName"
        :props="column?.slotOptions"
        :componentProps="column?.slotOptions.props"
        :formData="formData"
        :editable="editable"
      ></slot>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { isDateRangeComponent } from '@/utils/components.ts';
defineProps({
  column: {
    type: Object,
    default: () => {}
  },
  editable: {
    type: Boolean,
    default: true
  }
});
const formData = defineModel({
  type: Object,
  default: () => {}
});

const getDisabled = (props: any) => {
  if ([true, false].includes(props.disabled)) return props.disabled
  else if (props.disabledHandler) return props.disabledHandler(formData)
  else return false
}
</script>

<style lang="scss" scoped>
.el-input-number{
  width:250px;
}
</style>