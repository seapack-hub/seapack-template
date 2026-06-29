<template>
  <div class="blog-page">
    <BlogHero />
    <div class="blog-main">
      <div class="blog-articles"><BlogArticles /></div>
      <div class="blog-projects"><BlogProjects /></div>
    </div>
    <BlogFooter />
  </div>
</template>

<script setup lang="ts">
import BlogHero from './components/BlogHero.vue'
import BlogArticles from './components/BlogArticles.vue'
import BlogProjects from './components/BlogProjects.vue'
import BlogFooter from './components/BlogFooter.vue'
</script>

<style lang="scss" scoped>
.blog-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

.blog-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 15px 20px;
  gap: 20px;
}

.blog-articles {
  flex: 4;
  overflow: hidden;
}

.blog-projects {
  flex: 1;
  overflow: hidden;
}
</style>
