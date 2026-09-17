import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

/**
 * 页面级权限校验 Composable
 *
 * 在页面 setup 阶段调用，onMounted 时校验当前用户是否拥有指定 permKey。
 * 无权限时弹出 ElMessage.warning 提示，并 replace 到工作台（避免浏览器回退再进入）。
 *
 * 数据源：userStore.menuPermKeys（从后端菜单树提取的页面级权限标识），
 * 与 permissionPlugin 路由守卫使用同一数据源，保持一致。
 *
 * @param permKey  页面所需的权限标识
 * @param pageName 页面中文名称，用于提示文案
 */
export function usePagePermission(permKey: string, pageName: string) {
  const router = useRouter()
  const userStore = useUserStore()

  onMounted(() => {
    if (!userStore.menuPermKeys.includes(permKey)) {
      ElMessage.warning(`暂无「${pageName}」的访问权限，请联系管理员开通`)
      router.replace({ path: '/stockFund/workbench' })
    }
  })
}
