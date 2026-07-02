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
  padding: 15px 10px;
  gap: 0;
}

.blog-articles {
  flex: 4;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 20px;
}

.blog-projects {
  flex: 1;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 20px;
  margin-left: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 10%;
    width: 1px;
    height: 80%;
    background: linear-gradient(
      180deg,
      transparent 0%,
      var(--el-border-color-light) 15%,
      var(--el-border-color-light) 85%,
      transparent 100%
    );
  }
}
</style>
