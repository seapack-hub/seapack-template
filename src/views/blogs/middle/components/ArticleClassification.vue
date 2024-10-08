<template>
  <div class="article-classification">
    <!-- 文章分类 -->
    <div class="article-classification-top">文章分类</div>
    <div class="article-classification-hr"></div>
    <!--子节点数据-->
    <el-tree
      class="article-classification-tree"
      :data="dataSource"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span> {{ data.number }} </span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
//import type Node from 'element-plus/es/components/tree/src/model/node'

interface Tree {
  id: string
  label: string
  number: number
  children?: Tree[]
}

const dataSource = ref<Tree[]>([
  {
    id: '01001',
    label: 'JAVA',
    number:15,
    children: [
      {
        id: '01002',
        label: '基础',
        number:4,
      },
      {
        id: '01003',
        label: '多线程',
        number:5,
      },
      {
        id: '01004',
        label: '集合',
        number:6,
      },
    ],
  },
  {
    id: '02001',
    label: '前端',
    number:21,
    children: [
      {
        id: '02002',
        label: 'HTML',
        number:3,
      },
      {
        id: '02003',
        label: 'CSS',
        number:6,
      },
      {
        id: '02004',
        label: 'JavaScript',
        number:15,
      },
    ],
  },
])
</script>

<style lang="scss" scoped>
.article-classification {
  background-color: #ffffff;
  border-radius: 10px;
  height: 100%;
  padding: 20px;
  position: relative;

  &-top {
    height: 35px;
    width: 120px;
    line-height: 35px;
    font-family: cursive;
    font-size: 18px;
    font-weight: 700px;
    text-align: center;
    background-color: #50bfff;
    color: #ffffff;
    position: absolute;
    left: -15px;
    border-radius: 2px;
    &::after {
      content: '';
      width: 0;
      border-top: 15px solid #31b1fb;
      border-left: 15px solid transparent;
      left: 0;
      position: absolute; /*使伪元素脱离文档流，使伪元素不受div内容的影响,便于计算位置，此时after相对于div的左上角进行定位*/
      top: 35px;
    }
  }

  &-hr {
    margin-top: 55px;
    border-bottom: 0.5px solid gray;
  }

  &-tree{
    margin-top: 20px;
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;
    }
  }
}
</style>
