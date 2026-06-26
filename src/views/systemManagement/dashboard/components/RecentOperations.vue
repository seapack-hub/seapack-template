<!-- ============================================================
  RecentOperations 最近操作动态组件
  展示系统管理模块最近的用户新增、角色变更等操作记录。
  ============================================================ -->
<template>
  <el-card class="recent-operations" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="card-title">最近动态</span>
        <el-button type="primary" link @click="router.push({ name: 'user' })">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>

    <el-table
      v-loading="loading"
      :data="operationList"
      stripe
      size="small"
      style="width: 100%"
      :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: 500 }"
    >
      <el-table-column prop="targetName" label="操作对象" min-width="120" />
      <el-table-column prop="type" label="类型" width="90">
        <template #default="{ row }">
          <el-tag :type="row.tagType" size="small">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="100" />
      <el-table-column prop="time" label="时间" min-width="140">
        <template #default="{ row }">
          {{ formatTime(row.time) }}
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && operationList.length === 0" description="暂无最近动态" :image-size="60" />
  </el-card>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { UserAPI } from '@/api/system/baseInfo/user'
import { RoleAPI } from '@/api/system/permission/role'

const router = useRouter()

interface OperationItem {
  targetName: string
  type: string
  tagType: '' | 'success' | 'warning' | 'info'
  operator: string
  time: string
}

const loading = ref(false)
const operationList = ref<OperationItem[]>([])

function formatTime(time: string) {
  if (!time) return '--'
  const d = new Date(time)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}

async function loadOperations() {
  loading.value = true
  try {
    const [userRes, roleRes] = await Promise.allSettled([
      UserAPI.getPage({ pageNum: 1, pageSize: 5 }),
      RoleAPI.page({ pageNum: 1, pageSize: 5 }),
    ])

    const list: OperationItem[] = []

    if (userRes.status === 'fulfilled') {
      const users = userRes.value?.list ?? []
      users.forEach((u: any) => {
        list.push({
          targetName: u.nickName || u.userName || '未知用户',
          type: '新增用户',
          tagType: 'success',
          operator: '系统管理员',
          time: u.createTime || new Date().toISOString(),
        })
      })
    }

    if (roleRes.status === 'fulfilled') {
      const roles = roleRes.value?.list ?? []
      roles.forEach((r: any) => {
        list.push({
          targetName: r.roleName || '未知角色',
          type: '角色变更',
          tagType: 'warning',
          operator: '系统管理员',
          time: r.createTime || new Date().toISOString(),
        })
      })
    }

    // 按时间倒序排列，最多展示 8 条
    operationList.value = list
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8)
  } catch {
    operationList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOperations()
})
</script>

<style lang="scss" scoped>
.recent-operations {
  border-radius: 12px;
  border: none;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}
</style>
