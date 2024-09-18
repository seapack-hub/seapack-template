<template>
  <div class="blogs-left-main">
    <!-- 作者信息-->
    <AuthorInfo />
    <!-- 文章分类-->
    <ArticleClassify />
    <!-- 时事热点 Hot topics of current affairs-->
    <CurrentAffairsHot />
  </div>
</template>

<script setup>
import AuthorInfo from './authorInfo.vue'
import ArticleClassify from './articleClassify.vue'
import CurrentAffairsHot from './currentAffairsHot.vue'
</script>

<style lang="scss" scoped>
.blogs-left-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  font-family: cursive;
}
</style>
