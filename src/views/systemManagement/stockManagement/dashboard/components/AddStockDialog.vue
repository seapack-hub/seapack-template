<template>
  <!-- 添加监控股票弹框：搜索选股 + 选填备注 -->
  <el-dialog v-model="visible" title="添加监控股票" width="500px" @closed="onClosed">
    <el-form :model="form" label-width="80px">
      <el-form-item label="股票" prop="stockCode">
        <!-- remote 搜索：输入关键字实时过滤股票池 -->
        <el-select
          v-model="form.stockCode"
          placeholder="搜索选择股票"
          filterable
          remote
          :remote-method="onSearch"
          :loading="searching"
          style="width:100%"
        >
          <el-option v-for="s in candidates" :key="s.stockCode" :label="`${s.stockName} (${s.stockCode})`" :value="s.stockCode" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" placeholder="选填，如：高股息重点监控" maxlength="50" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit" :disabled="!form.stockCode">确认添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { StockInfoAPI } from '@/api/system/stock/stockPool/stockPool.ts'
import { UserStockMonitorAPI } from '@/api/system/stock/stockMonitor/userStockMonitor.ts'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

/** 弹框显隐 */
const visible = defineModel<boolean>('visible', { required: true })
const emit = defineEmits<{ refresh: [] }>()

/** 表单：选中的股票代码 + 备注 */
const form = ref({ stockCode: '', remark: '' })
/** 搜索候选列表 */
const candidates = ref<any[]>([])
const searching = ref(false)
const submitting = ref(false)

/** 全量股票池缓存（挂载时一次性加载） */
let fullList: any[] = []

/** 加载全量股票池用于搜索 */
async function loadAll() {
  try {
    fullList = (await StockInfoAPI.list()) ?? []
  } catch {
    fullList = []
  }
}

/** remote 搜索过滤：关键字匹配 code 或 name，最多返回 50 条 */
function onSearch(keyword: string) {
  if (!keyword) { candidates.value = fullList.slice(0, 50); return }
  const q = keyword.toLowerCase()
  candidates.value = fullList.filter((s: any) =>
    s.stockCode?.toLowerCase().includes(q) || s.stockName?.toLowerCase().includes(q)
  ).slice(0, 50)
}

/** 提交：调用后端接口添加监控（重复 code 会抛异常） */
async function onSubmit() {
  if (!form.value.stockCode) return
  submitting.value = true
  try {
    await UserStockMonitorAPI.add(userStore.userInfo.id!, form.value.stockCode, form.value.remark)
    ElMessage.success('添加成功')
    visible.value = false
    emit('refresh')
  } catch {
    ElMessage.error('添加失败，可能该股票已在监控池中')
  } finally {
    submitting.value = false
  }
}

/** 关闭弹框后重置表单 */
function onClosed() {
  form.value = { stockCode: '', remark: '' }
  candidates.value = []
}

onMounted(() => { loadAll() })
</script>
