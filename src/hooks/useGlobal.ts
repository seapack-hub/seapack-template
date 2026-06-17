import { ref } from 'vue';

/**
 * useLoading —— 通用加载状态管理
 *
 * 提供一个响应式的 loading 状态以及手动开启/关闭的方法，
 * 适用于按钮加载、表格加载、弹窗提交等需要展示加载状态的场景。
 *
 * @returns { loading, showLoading, cancelLoading }
 *   - loading:       响应式布尔值，当前是否处于加载中
 *   - showLoading:   将 loading 设为 true
 *   - cancelLoading: 将 loading 设为 false
 */
export function useLoading() {
  // 当前加载状态，初始为 false（未加载）
  const loading = ref(false);

  // 开启加载
  const showLoading = () => {
    loading.value = true;
  };

  // 关闭加载
  const cancelLoading = () => {
    loading.value = false;
  };

  return { loading, showLoading, cancelLoading };
}

/**
 * useOperateTypeEnum —— 操作类型位掩码枚举
 *
 * 使用位移运算定义操作类型的枚举值，支持通过按位或（|）组合多个操作类型，
 * 适用于表格操作列中判断当前支持哪些操作。
 *
 * 示例：addType | updateType 表示既支持新增也支持编辑
 *
 * @returns { addType, updateType, deleteType, detailType, importType, exportType }
 */
export function useOperateTypeEnum() {
  return {
    addType: 1,          // 新增操作（000001）
    updateType: 1 << 1,  // 更新操作（000010）
    deleteType: 1 << 2,  // 删除操作（000100）
    detailType: 1 << 3,  // 详情操作（001000）
    importType: 1 << 4,  // 导入操作（010000）
    exportType: 1 << 5,  // 导出操作（100000）
  };
}
