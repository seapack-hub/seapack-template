import { watch } from 'vue';

/**
 * useComponentGetData —— 通用的组件数据加载 hook
 *
 * 职责：
 *   将请求方法 + 参数 + 初始数据封装为统一的响应式状态，
 *   自动在参数变化时重新调用请求方法获取数据。
 *
 * @param props.getDataMethod  数据请求的方法（返回 Promise）
 * @param props.options        初始数据 / 静态选项数据
 * @param props.methodParams   传给 getDataMethod 的参数，变化时会自动重新请求
 * @param props.immediate      是否立即执行 watch 回调（默认 false）
 *
 * @returns { loading, data, getData }
 */
export default (props: {
  getDataMethod: any;
  options?: any;
  methodParams?: any;
  immediate?: boolean;
}) => {
  // 请求加载状态：true 时表示正在请求数据
  const loading = ref(false);

  // 响应式数据源：初始值为 props.options（通常是静态选项或空数组/空对象）
  const data = ref(props.options);

  /**
   * 执行数据请求
   * 调用 props.getDataMethod(props.methodParams) 发起异步请求，
   * 请求完成后将返回值赋给 data。
   */
  const getData = async () => {
    loading.value = true;
    data.value = await props.getDataMethod(props.methodParams);
    loading.value = false;
  };

  /**
   * 监听 props.options 的变化
   * 当外部传入的 options 更新时，同步更新 data 的引用。
   * 适用于：下拉选项等静态数据由父组件动态传入的场景。
   */
  watch(
    () => props.options,
    () => {
      data.value = props.options;
    },
    {
      deep: true,             // 深度监听，对象/数组内部变化也能触发
      immediate: props.immediate,
    }
  );

  /**
   * 监听 props.methodParams 的变化
   * 当请求参数变化时，自动重新调用 getData 获取新数据。
   * 适用于：分页查询、搜索条件变化等需要重新请求数据的场景。
   */
  watch(
    () => props.methodParams,
    () => {
      if (props.getDataMethod) getData();
    },
    {
      deep: true,
      immediate: props.immediate,
    }
  );

  // 暴露 loading 状态、响应式数据、手动触发请求的方法
  return {
    loading,
    data,
    getData,
  };
};
