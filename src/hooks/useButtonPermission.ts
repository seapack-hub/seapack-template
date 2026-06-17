/*
 * useButtonPermission —— 操作列按钮级权限判断
 *
 * 同时兼容两套机制：
 *   1. 新系统：userStore.perms（来自后端 /auth/user-info 的扁平权限标识符集合）
 *   2. 旧系统：route.meta.buttonList（静态路由元数据中的按钮级配置）
 *
 * buttonPermission 参数支持两种格式：
 *   - 字符串：'user:add'
 *   - 对象：{ permission: 'user:add', type: 'row', name: '新增' }
 */

import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/modules/user';

export default () => {
  const route = useRoute();
  const userStore = useUserStore();

  /** 从字符串或对象中提取 permKey */
  const getPermKey = (buttonPermission: any): string | undefined => {
    if (!buttonPermission) return undefined;
    if (typeof buttonPermission === 'string') return buttonPermission;
    return buttonPermission?.permission;
  };

  /** 判断单个按钮是否有权限 */
  const buttonHasPermission = (buttonPermission: any) => {
    const permKey = getPermKey(buttonPermission);
    if (!permKey) return true;

    /* ---- 新系统：从 userStore.perms 查找 ---- */
    const { perms } = userStore;
    if (perms.length > 0) {
      if (perms.includes('*:*:*') || perms.includes('*')) return true;
      return perms.includes(permKey);
    }

    /* ---- 旧系统：从 route.meta.buttonList 查找 ---- */
    const metaKey = String(route.name);
    const buttonList: any = route?.meta?.buttonList ?? [];
    if (buttonList?.length) {
      const type = buttonPermission?.type ?? 'row';
      return buttonList.some((item: { buttonMetaKey: string }) =>
        item?.buttonMetaKey === `${metaKey}.${type}.${permKey}`
      );
    }
    return false;
  };

  /** 批量过滤有权限的按钮 */
  const buttonsHasPermission = (buttons: any[]) => {
    return buttons.filter((item: { buttonPermission: any }) => {
      if (item.buttonPermission) return buttonHasPermission(item?.buttonPermission);
      return true;
    });
  };

  return {
    buttonHasPermission,
    buttonsHasPermission,
  };
};
