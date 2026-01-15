<template>
  <div class="m-b-8px flex items-center justify-between">
    <!--标题插槽-->
    <slot v-if="$slots.title" name="title"></slot>
    <p v-else class="font-size-[20px] color-[var(--el-text-color-primary)] font-semibold line-height-[20px]">{{ props.title }}</p>
    <div class="bottom-[14px] right-0 flex items-center justify-end">
      <!--按钮插槽-->
      <slot name="button" />

      <!--编辑按钮组-->
      <template v-if="editable">
        <!--保存-->
        <el-button v-if="save" type="primary" @click="handleSave">{{ saveText }}</el-button>
        <!--取消-->
        <el-button @click="handleCancel()">取消</el-button>
      </template>
      <!--详情按钮组-->
      <template v-else>
        <!--编辑-->
        <el-button v-if="props.edit" type="primary" @click="handleEdit">{{ editText }}</el-button>
        <!--返回-->
        <el-button v-if="props.back" @click="router.back()">{{ props.backText }}</el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '编辑'
  },
  saveText: {
    type: String,
    default: '保存'
  },
  save: {
    type: Boolean,
    default: true
  },
  editText: {
    type: String,
    default: '编辑'
  },
  edit: {
    type: Boolean,
    default: true
  },
  back: {
    type: Boolean,
    default: true
  },
  backText: {
    type: String,
    default: '返回'
  },
});
const emit = defineEmits(['save', 'cancel', 'edit'])
const editable = defineModel<any>();
//调用保存方法
const handleSave = () => emit('save');
const router = useRouter()
//返回
const handleCancel = ()=>{
  editable.value = false;
  emit('cancel')
  if (!props.edit) router.back()
}
//编辑
const handleEdit = () => emit('edit');
</script>

<style lang="scss" scoped></style>