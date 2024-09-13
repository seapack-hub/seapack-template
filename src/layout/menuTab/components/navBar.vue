<template>
  <div class="menuTab-nav-bar-wrapper">
    <div class="menuTab-nav-bar-left">
      <div class="blogs-name">烈风逍遥的博客</div>
      <div class="item-list">
        <div
          class="item"
          v-for="(item, index) in itemList"
          :key="index"
          :class="{ isActive: activeValue === index }"
          tabindex="0"
          @click="tabClick(item, index)"
        >
          <SPIcon
            :name="item.iconName"
            size="20px"
            :color="activeValue === index ? 'aqua' : item.color"
          ></SPIcon>
          <span class="item-name">{{ item.name }}</span>
        </div>
      </div>
    </div>
    <div class="menuTab-nav-bar-right">
      <SPIcon name="search" size="30px" color="#ffffff"></SPIcon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { House } from '@element-plus/icons-vue'

/** 列表*/
const itemList = ref([])
itemList.value = [
  { name: '首页', color: '#000000', iconName: 'homeMain' },
  { name: '归档', color: '#000000', iconName: 'pigeonhole' },
  { name: '分类', color: '#000000', iconName: 'classify' },
  { name: '系统', color: '#000000', iconName: 'backOffice' },
]
/** 当前活跃页*/
const activeValue = ref(0)

/** 是否聚焦*/
const isFocus = ref(false)

/** tab点击事件*/
const tabClick = (item, index) => {
  activeValue.value = index
}
</script>
<style scoped lang="scss">
.menuTab-nav-bar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 50px;

  .menuTab-nav-bar-left {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    .blogs-name {
      width: 220px;
      text-align: center;
      font-size: 20px;
      color: aqua;
      font-family: cursive;
    }

    .item-list {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 30px;
      .item {
        height: 100%;
        display: flex;
        height: 45px;
        width: 60px;
        align-items: center;
        .item-name {
          font-size: 16px;
          margin-left: 5px;
          line-height: 24px;
          font-family: cursive;
        }
      }
      .isActive {
        border-bottom: 3px solid aqua;
        .item-name {
          color: aqua;
        }
      }
    }
  }

  .menuTab-nav-bar-right {
    width: 80px;
    height: 34px;
    background-color: aqua;
    text-align: center;
    border-radius: 17px;
  }
}
</style>
