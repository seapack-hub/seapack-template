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
  }),
  actions: {
    getUserInfo(userInfo: User) {
      this.userInfo = userInfo;
    },
  },
});
