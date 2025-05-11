<template>
  <div class="article-classify">
    <!--头部 -->
    <div class="article-classify-top">
      <!--分类-->
      <div class="classification">
        <SPIcon name="classify" size="20px" color="aqua"></SPIcon>
        <div class="classification-text">分类</div>
      </div>
      <!--更多-->
      <div class="more">
        <div class="more-text">更多</div>
        <SPIcon name="more" size="16px" color="#8a8a8a"></SPIcon>
      </div>
    </div>

    <!--列表-->
    <div class="article-classify-main">
      <div class="item" v-for="(item, index) in classifyList" :key="index">
        <div class="item-name">{{ item.name }}</div>
        <div class="item-number">{{ item.number }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const classifyList = ref([
  { name: 'Html', number: '5' },
  { name: 'Css', number: '2' },
  { name: 'JavaScript', number: '15' },
  { name: 'Vue', number: '25' },
  { name: 'Vite', number: '4' },
  { name: 'Node.js', number: '8' },
  { name: 'Webpack', number: '3' },
  { name: 'Git', number: '3' },
  { name: '浏览器', number: '2' },
  { name: '其他', number: '5' }
]);
</script>

<style lang="scss" scoped>
.article-classify {
  background-color: #ffffff;
  border-radius: 10px;
  &-top {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid gray;
    .classification {
      display: flex;
      align-items: center;
      &-text {
        margin-left: 5px;
        font-weight: 600;
      }
    }
    .more {
      display: flex;
      align-items: center;
      &-text {
        font-size: 16px;
        color: #8a8a8a;
      }
    }
  }
  &-main {
    padding: 10px;
    display: flex;
    flex-direction: column;
    .item {
      display: flex;
      font-family: cursive;
      padding: 10px;
      border-radius: 4px;
      &-name {
        width: 100%;
      }
      &-number {
        width: 100%;
        text-align: right;
        padding-right: 15px;
      }
      &:hover {
        background-color: #ccc;
      }
    }
  }
}
</style>
