import { computed } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import { SystemTypeEnum } from '@/constants/app-key'

const settingStore = useSettingsStore()

// 是否为管理系统
const isManageSystem = computed(
  () => settingStore.systemType === SystemTypeEnum.ManageSystem
)
// 是否为博客
const isBlogSystem = computed(
  () => settingStore.systemType === SystemTypeEnum.BlogSystem
)

// 是否为二维地图
const isTwoDimensionalMapSystem = computed(
  () => settingStore.systemType === SystemTypeEnum.TwoDimensionalMapSystem
)

// 是否为三维地图
const isThreeDimensionalMapSystem = computed(
  () => settingStore.systemType === SystemTypeEnum.ThreeDimensionalMapSystem
)

// 设置系统类型
const setSystemType = (type: SystemTypeEnum) => {
  settingStore.systemType = type
}

export function useSystemTypeMode() {
  return {
    isManageSystem,
    isBlogSystem,
    isTwoDimensionalMapSystem,
    isThreeDimensionalMapSystem,
    setSystemType,
  }
}
