<template>
  <SpDetailLayout :column :padding class="p-x-[var(--padding-l)]">
    <slot name="components">
      <template v-for="column in formList" :key="column.prop">
        <template v-if="column?.vIFHandler ? column.vIFHandler(formData) : true">
          <SpTitle v-if="column.type === 'title'" v-bind="column.props"> </SpTitle>
          <div v-else-if="column.type === 'empty'"></div>
          <slot v-else-if="column.type === 'slot'" :name="column.value" :props="column" :componentProps="column.props" :formData="formData"></slot>
          <FormComponent
            v-else-if="column.type !== 'empty'"
            v-model="formData"
            :editable
            :column
            :style="{ marginBottom: column.style?.marginBottom ? column.style?.marginBottom : '20px' }"
          >
            <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
              <slot :name="name" v-bind="scope"></slot>
            </template>
          </FormComponent>
        </template>
      </template>
    </slot>
  </SpDetailLayout>
</template>

<script setup lang="ts">
import { formatFormColumns } from '@/utils/components';
import FormComponent from "./formComponent.vue";
const props = defineProps({
  //组件信息
  formColumns: {
    type: Array,
    default: () => []
  },
  column: {
    type: Number,
    default: null
  },
  padding: {
    type: Number,
    default: null
  },
  columnVal: {
    type: Number,
    default: 0
  },
  editable: {
    type: Boolean,
    default: true
  }
});

const formList = computed(() => {
  return formatFormColumns(props.formColumns)
});

const formData = defineModel({
  type: Object,
  default: () => {}
})
</script>

<style lang="scss" scoped></style>