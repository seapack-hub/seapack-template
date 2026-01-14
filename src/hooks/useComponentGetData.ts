import { watch } from 'vue';

export default (props: { getDataMethod: any; options?: any; methodParams?: any; immediate?: boolean })=>{
  //加载状态
  const loading = ref(false);

  //数据
  const data = ref(props.options);

  //加载数据
  const getData = async ()=>{
    loading.value = true;
    data.value = await props.getDataMethod(props.methodParams);
    loading.value = false;
  }

  //监听数据变化
  watch(
    () => props.options,
    () => {
      data.value = props.options
    },
    {
      deep: true,
      immediate: props.immediate
    }
  )

  //监听函数变化
  watch(
    () => props.methodParams,
    () => {
      if (props.getDataMethod) getData()
    },
    {
      deep: true,
      immediate: props.immediate
    }
  )

  return {
    loading,
    data
  }
}