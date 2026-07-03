import { defineStore } from 'pinia';
import { type User} from '@/api/system/baseInfo/user.ts';
import { usePermissionStore } from '@/store/modules/permission';
import { AuthAPI, type MenuTree } from '@/api/system/permission/auth';
import CacheKey from '@/constants/cache-key';

interface AuthCache {
  roles: string[]
  perms: string[]
  menuTree: MenuTree[]
}

/**
 * 用户状态管理
 * 职责：
 *   1. 管理用户 Token（登录凭证）
 *   2. 管理用户信息（用户ID、用户名、昵称等）
 *   3. 管理用户角色和权限标识
 *   4. 提供登录/登出的完整流程
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    // ===== Token 相关 =====
    // 用户登录凭证，存在 localStorage 中持久化
    token: '',
    // ===== 用户信息 =====
    userInfo:{} as User,
    // ===== 权限相关 =====
    // 当前用户的角色编码列表
    roles: [] as string[],
    // 当前用户的权限标识符集合，如 ['user:add', 'role:delete']
    perms: [] as string[],
    // 后端返回的已过滤菜单树（getMenus 结果），用作权限守卫的真实数据源
    menuTree: [] as MenuTree[],
    // 标记当前会话是否已完成权限加载（避免重复请求）
    authLoaded: false,
  }),
  getters: {
    // 是否已登录（有 Token）
    isLoggedIn(state) {
      return !!state.token
    },
    // 用户名（对应后端 userInfo.userName）
    username(state) {
      return state.userInfo?.userName ?? ''
    },
    // 用户 ID（对应后端 userInfo.id）
    userId(state) {
      return state.userInfo?.id ?? ''
    },
    // 从菜单树中提取所有非空 permKey，用作路由守卫的权限判定数据源
    menuPermKeys(state): string[] {
      const keys = new Set<string>()
      function walk(nodes: MenuTree[]) {
        for (const node of nodes) {
          const k = node.permKey?.trim()
          if (k) keys.add(k)
          if (node.children?.length) walk(node.children)
        }
      }
      walk(state.menuTree)
      return Array.from(keys)
    },
  },
  actions: {
    // ===== Token 操作 =====
    /**
     * 设置 Token（登录成功后调用）
     * @param token 后端返回的登录凭证
     */
    setToken(token: string) {
      this.token = token;
      localStorage.setItem(CacheKey.TOKEN, token);
    },

    /**
     * 从 localStorage 恢复 Token（页面刷新后调用）
     */
    restoreToken() {
      const token = localStorage.getItem(CacheKey.TOKEN);
      if (token) {
        this.token = token;
      }
    },

    /**
     * 清除 Token（登出时调用）
     */
    clearToken() {
      this.token = '';
      localStorage.removeItem(CacheKey.TOKEN);
    },

    // ===== 用户信息操作 =====
    /**
     * 设置用户信息（登录后获取用户详情时调用）
     * @param userInfo 后端返回的用户信息
     */
    setUserInfo(userInfo: User) {
      this.userInfo = userInfo;
      // 同时存入 localStorage，持久化
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

    /**
     * 从 localStorage 恢复用户信息（页面刷新后调用）
     */
    restoreUserInfo() {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
          this.userInfo = JSON.parse(userInfoStr);
        } catch {
          localStorage.removeItem('userInfo');
        }
      }
    },

    /**
     * 清除用户信息（登出时调用）
     */
    clearUserInfo() {
      this.userInfo = {} as User;
      localStorage.removeItem('userInfo');
    },

    // ===== 权限信息操作 =====
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
      this.menuTree = [];
      this.authLoaded = false;
    },

    /** 从 sessionStorage 恢复权限缓存 */
    restoreAuthFromCache(): boolean {
      try {
        const raw = sessionStorage.getItem(CacheKey.AUTH_CACHE)
        if (!raw) return false
        const cache: AuthCache = JSON.parse(raw)
        if (!cache.roles || !cache.perms || !cache.menuTree) return false
        this.roles = cache.roles
        this.perms = cache.perms
        this.menuTree = cache.menuTree
        this.authLoaded = true
        return true
      } catch {
        sessionStorage.removeItem(CacheKey.AUTH_CACHE)
        return false
      }
    },

    /** 将当前权限数据存入 sessionStorage */
    saveAuthToCache() {
      try {
        const cache: AuthCache = {
          roles: this.roles,
          perms: this.perms,
          menuTree: this.menuTree,
        }
        sessionStorage.setItem(CacheKey.AUTH_CACHE, JSON.stringify(cache))
      } catch {
        // sessionStorage 满或不可用时静默忽略
      }
    },

    /** 清除 sessionStorage 权限缓存 */
    clearAuthCache() {
      sessionStorage.removeItem(CacheKey.AUTH_CACHE)
    },

    // ===== 登录/登出完整流程 =====
    /**
     * 登录成功后的完整初始化流程
     * @param token 后端返回的 Token
     * @param userInfo 后端返回的用户信息
     */
    loginSuccess(token: string, userInfo: User) {
      // 1. 保存 Token
      this.setToken(token);
      // 2. 保存用户信息
      this.setUserInfo(userInfo);
    },

    /**
     * 页面刷新后恢复登录状态
     * @returns 是否已登录（有 Token）
     */
    restoreLoginState(): boolean {
      // 1. 恢复 Token
      this.restoreToken();
      // 2. 恢复用户信息
      this.restoreUserInfo();
      // 3. 返回是否已登录
      return this.isLoggedIn;
    },

    //从后端获取用户角色权限
    async fetchAuthPerms(userId: string) {
      //获取用户权限数据
      const authInfo = await AuthAPI.getUserInfo(userId);
      //赋值
      this.roles = authInfo.roles;
      this.perms = authInfo.perms;

      //获取用户权限菜单（已过滤的菜单树）
      const menu = await AuthAPI.getMenus(userId);
      this.menuTree = menu;

      // 缓存到 sessionStorage，下次页面刷新直接恢复
      this.authLoaded = true
      this.saveAuthToCache()

      // 重新收集路由，恢复 dynamicRoutesLoaded，刷新侧边栏
      const permissionStore = usePermissionStore()
      permissionStore.collectRoutes()
    },

    /**
     * 登出完整流程
     * @param needRequest 是否需要调用后端登出接口
     */
    async logout(needRequest = true) {
      // 1. 可选：调用后端登出接口（清除服务端 Session/Token）
      if (needRequest) {
        try {
          // await logoutAPI();
          // 暂时不调用，等后端接口就绪
        } catch {
          // 忽略错误
        }
      }
      // 2. 清除 Token
      this.clearToken();
      // 3. 清除用户信息
      this.clearUserInfo();
      // 4. 清除权限数据
      this.clearAuth();
      // 5. 清除 sessionStorage 权限缓存
      this.clearAuthCache();
      // 6. 重置路由权限状态（让路由守卫重新判断）
      const permissionStore = usePermissionStore();
      permissionStore.resetPermissionState();
    },
  },
});

