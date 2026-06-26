<!-- ============================================================
  StatsCards 统计卡片组件
  展示系统管理核心指标：用户、角色、部门、菜单权限、字典数量等。
  ============================================================ -->
<template>
  <!-- 统计卡片响应式栅格布局：xs=2列, sm=3列, md=6列 -->
  <el-row :gutter="16">
    <el-col
      v-for="item in statsList"
      :key="item.key"
      :xs="12"
      :sm="8"
      :md="4"
    >
      <el-card
        class="stats-card"
        shadow="hover"
        :body-style="{ padding: '20px' }"
      >
        <div class="stats-inner">
          <!-- 左侧：标签 + 数值 -->
          <div class="stats-info">
            <span class="stats-label">{{ item.label }}</span>
            <span class="stats-value" :style="{ color: item.color }">{{ item.value }}</span>
          </div>
          <!-- 右侧：彩色图标背景 -->
          <div class="stats-icon" :style="{ background: item.bgColor }">
            <SPIcon :name="item.icon" :size="28" :color="item.color" />
          </div>
        </div>
        <!-- 底部：趋势变化（红色上涨 / 绿色下跌） -->
        <div class="stats-footer">
          <span class="stats-change" :class="item.trend > 0 ? 'up' : 'down'">
            <el-icon v-if="item.trend > 0"><Top /></el-icon>
            <el-icon v-else><Bottom /></el-icon>
            {{ Math.abs(item.trend) }}%
          </span>
          <span class="stats-desc">较昨日</span>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { Top, Bottom } from '@element-plus/icons-vue'
import { UserAPI } from '@/api/system/baseInfo/user'
import { RoleAPI } from '@/api/system/permission/role'
import { DeptAPI } from '@/api/system/baseInfo/dept'
import { PermissionAPI } from '@/api/system/permission/permission'
import { DictAPI } from '@/api/system/baseInfo/dict'

/**
 * 统计卡片数据结构
 * @property key - 唯一标识
 * @property label - 指标名称
 * @property value - 当前数值
 * @property icon - SPIcon 图标名称
 * @property color - 主题颜色
 * @property bgColor - 图标背景色
 * @property trend - 较昨日变化百分比
 */
interface StatsItem {
  key: string
  label: string
  value: string | number
  icon: string
  color: string
  bgColor: string
  trend: number
}

/** 系统管理核心指标 */
const statsList = ref<StatsItem[]>([
  { key: 'users', label: '用户总数', value: '--', icon: 'user', color: '#409eff', bgColor: 'rgba(64,158,255,0.1)', trend: 0 },
  { key: 'roles', label: '角色数量', value: '--', icon: 'role', color: '#67c23a', bgColor: 'rgba(103,194,58,0.1)', trend: 0 },
  { key: 'depts', label: '部门总数', value: '--', icon: 'dept', color: '#e6a23c', bgColor: 'rgba(230,162,60,0.1)', trend: 0 },
  { key: 'menus', label: '菜单权限', value: '--', icon: 'menu', color: '#9b59b6', bgColor: 'rgba(155,89,182,0.1)', trend: 0 },
  { key: 'dicts', label: '字典数量', value: '--', icon: 'dict', color: '#f56c6c', bgColor: 'rgba(245,108,108,0.1)', trend: 0 },
  { key: 'online', label: '在线用户', value: '--', icon: 'monitor', color: '#00bcd4', bgColor: 'rgba(0,188,212,0.1)', trend: 0 },
])

/**
 * 计算权限树节点总数（目录 + 菜单 + 按钮）
 */
function countPermissions(list: any[]): number {
  return list.reduce((sum, node) => {
    const self = 1
    const children = node.children?.length ? countPermissions(node.children) : 0
    return sum + self + children
  }, 0)
}

/**
 * 加载系统管理核心指标数据
 */
async function loadStats() {
  try {
    const [userRes, roleRes, deptRes, permRes, dictRes] = await Promise.allSettled([
      UserAPI.getPage({ pageNum: 1, pageSize: 1 }),
      RoleAPI.page({ pageNum: 1, pageSize: 1 }),
      DeptAPI.getPage({ pageNum: 1, pageSize: 1 }),
      PermissionAPI.getTree(),
      DictAPI.getList({ pageNum: 1, pageSize: 1 }),
    ])

    const map: Record<string, number> = {
      users: userRes.status === 'fulfilled' ? (userRes.value?.total ?? 0) : 0,
      roles: roleRes.status === 'fulfilled' ? (roleRes.value?.total ?? 0) : 0,
      depts: deptRes.status === 'fulfilled' ? (deptRes.value?.total ?? 0) : 0,
      menus: permRes.status === 'fulfilled' ? countPermissions(permRes.value ?? []) : 0,
      dicts: dictRes.status === 'fulfilled' ? (dictRes.value?.total ?? 0) : 0,
      online: 0,
    }

    statsList.value.forEach((item) => {
      item.value = map[item.key] ?? '--'
      // 模拟较昨日趋势（后续可对接真实统计接口）
      item.trend = item.key === 'online' ? 0 : Number((Math.random() * 10 - 2).toFixed(1))
    })
  } catch {
    // 任一接口异常时不阻塞页面
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
/**
 * 统计卡片样式：圆角、无边框、hover 微上移
 */
.stats-card {
  border-radius: 10px;
  border: none;
  margin-bottom: 16px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}

/**
 * 卡片内部：左右 flex 分布
 */
.stats-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/**
 * 文字信息区域：纵向排列
 */
.stats-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/** 指标标签 */
.stats-label {
  font-size: 13px;
  color: #909399;
}

/** 指标数值：大号加粗 */
.stats-value {
  font-size: 26px;
  font-weight: 700;
}

/** 图标圆形背景容器 */
.stats-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/** 底部趋势区域：上边框分隔 */
.stats-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/** 趋势变化文字：红色 = 上涨，绿色 = 下跌 */
.stats-change {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
  &.up {
    color: #f56c6c;
  }
  &.down {
    color: #67c23a;
  }
}

/** "较昨日" 辅助文字 */
.stats-desc {
  font-size: 12px;
  color: #c0c4cc;
}
</style>
