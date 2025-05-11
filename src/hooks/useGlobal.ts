import { ref } from 'vue';
/**
 * 加载样式
 */
export function useLoading() {
  //加载状态
  const loading = ref(false);

  //展示加载
  const showLoading = () => {
    loading.value = true;
  };

  //取消加载
  const cancelLoading = () => {
    loading.value = false;
  };

  return { loading, showLoading, cancelLoading };
}

/**
 * 操作类型按钮枚举值
 */
export function useOperateTypeEnum() {
  return {
    addType: 1, //添加按钮类型
    updateType: 1 << 1, //更新按钮
    deleteType: 1 << 2, //删除按钮
    detailType: 1 << 3, //详情按钮
    importType: 1 << 4, //导入按钮
    exportType: 1 << 5 //导出按钮
  };
}
