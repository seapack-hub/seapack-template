import { defineStore } from 'pinia';

import { User } from '@/api/types/user.ts';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      phone: '13800138000',
      address: '',
      adminType: 1,
    } as User,
    // 当前用户的角色编码列表（来自 /auth/user-info）
    roles: [] as string[],
    // 当前用户的权限标识符集合（来自 /auth/user-info），如 ['user:add', 'role:delete']
    perms: [] as string[],
  }),
  actions: {
    getUserInfo(userInfo: User) {
      this.userInfo = userInfo;
    },
    /** 设置角色编码列表 */
    setRoles(roles: string[]) {
      this.roles = roles;
    },
    /** 设置权限标识符集合 */
    setPerms(perms: string[]) {
      this.perms = perms;
    },
    /** 同时设置角色和权限（登录后调用） */
    setAuthInfo(info: { roles: string[]; perms: string[] }) {
      this.roles = info.roles;
      this.perms = info.perms;
    },
    /** 清除权限数据（登出时调用） */
    clearAuth() {
      this.roles = [];
      this.perms = [];
    },
  },
});
