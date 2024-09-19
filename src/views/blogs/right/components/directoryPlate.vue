<template>
  <!--目录板块-->
  <div class="directory-plate">
    <!-- -->
    <div class="directory-plate-top">
      <div class="top-icon">
        <SPIcon name="mulu" size="20px" color="aqua"></SPIcon>
      </div>
      <div class="top-title">
        目录
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.directory-plate{
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  &-top{
    display: flex;
    justify-content: left;
    align-items: center;
    .top-icon{
      height: 20px;
    }
    .top-title{
      margin-left: 5px;
      font-size: 16px;
      line-height: 20px;
      font-weight: 600;
    }
  }
}
</style>