/*
 * useButtonPermission —— 操作列按钮级权限判断
 *
 * 同时兼容两套机制：
 *   1. 新系统：userStore.buttonPerms（来自后端 /auth/buttons 的完整路径权限标识符集合）
 *   2. 旧系统：route.meta.buttonList（静态路由元数据中的按钮级配置）
 *
 * buttonPermission 参数支持两种格式：
 *   - 字符串：'sys:user:add'（完整路径格式）
 *   - 对象：{ permission: 'sys:user:add', type: 'row', name: '新增' }
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

    /* ---- 新系统：从 userStore.buttonPerms 查找（完整路径格式） ---- */
    const { buttonPerms } = userStore;
    if (buttonPerms.length > 0) {
      if (buttonPerms.includes('*:*:*') || buttonPerms.includes('*')) return true;
      return buttonPerms.includes(permKey);
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
