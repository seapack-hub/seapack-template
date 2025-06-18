<template>
  <el-skeleton
    :loading="visitStatsLoading"
    :rows="5"
  >
    <template #template>
      <el-card>
        <template #header>
          <div>
            <el-skeleton-item
              variant="h3"
              style="width: 40%"
            />
            <el-skeleton-item
              variant="rect"
              style="float: right; width: 1em; height: 1em"
            />
          </div>
        </template>

        <div class="flex-x-between">
          <el-skeleton-item
            variant="text"
            style="width: 30%"
          />
          <el-skeleton-item
            variant="circle"
            style="width: 2em; height: 2em"
          />
        </div>
        <div class="mt-5 flex-x-between">
          <el-skeleton-item
            variant="text"
            style="width: 50%"
          />
          <el-skeleton-item
            variant="text"
            style="width: 1em"
          />
        </div>
      </el-card>
    </template>
    <template v-if="!visitStatsLoading">
      <el-card class="card-main">
        <template #header>
          <div class="item-x">
            <span class="text">{{ dataInfo.label }}</span>
            <el-tag
              type="success"
              size="small"
            >
              日
            </el-tag>
          </div>
        </template>

        <div class="main-center item-x">
          <div class="item-y">
            <span class="text-lg">{{ dataInfo.todayUvCount }}</span>
            <span class="text-rate">
              <el-icon>
                <Top v-if="dataInfo.uvGrowthRate > 0" />
                <Bottom v-else-if="dataInfo.uvGrowthRate < 0" />
              </el-icon>
              {{ dataInfo.uvGrowthRate * 100 }}%
            </span>
          </div>
          <SPIcon
            :name="dataInfo.icon"
            size="40px"
          ></SPIcon>
        </div>

        <div class="main-middle item-x text">
          <span>{{ dataInfo.title }}</span>
          <span>{{ dataInfo.totalUvCount }}</span>
        </div>
      </el-card>
    </template>
  </el-skeleton>
</template>

<script setup lang="ts">
import { VisitStatsVO } from '@/api/types/log.ts';
const visitStatsLoading = ref(false);

interface Props {
  dataInfo: VisitStatsVO;   // 必传自定义对象
}
defineProps<Props>();
</script>

<style lang="scss" scoped>
.card-main {
  .item-x {
    .text {
      color: grey;
    }
  }
  .main-center{
    .item-y {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap:10px;
      .text-lg{
        font-size: 20px;
      }
      .text-rate{
        color:#ff9a2e;
        font-size:14px
      }
    }
  }
  .main-middle{
    margin-top: 20px;
  }
}
.text {
  color: grey;
}

.item-x {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
