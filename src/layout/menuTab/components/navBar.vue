<template>
  <div class="menuTab-nav-bar-wrapper">
    <div class="menuTab-nav-bar-left">
    </div>
    <NavRight></NavRight>
  </div>
</template>
<script setup lang="ts">
import NavRight from "@/layout/components/NavRight.vue";
</script>
<style scoped lang="scss">
.menuTab-nav-bar-wrapper{
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 50px;

  .menuTab-nav-bar-left{
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }
}

</style>