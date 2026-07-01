<template>
  <footer class="blog-footer">
    <div class="footer-inner">
      <p>© 2025 Sea Pack · 烈风逍遥</p>
      <div class="footer-links">
        <el-link
          href="https://juejin.cn/user/2071912223613783"
          target="_blank"
          :underline="false"
        >
          <SPIcon name="juejin" :size="18" class="m-r-10" color="#ffffff" /> 掘金
        </el-link>
        <el-divider direction="vertical" />
        <el-link href="https://gitee.com/zenghaifenga/seapack-template" target="_blank" underline="never">
          <SPIcon name="gitee" :size="18" class="m-r-10" color="#ffffff" /> Gitee
        </el-link>
        <el-divider direction="vertical" />
        <el-link href="https://github.com/seapack-hub" target="_blank" underline="never">
          <SPIcon name="github" :size="18" class="m-r-10" color="#ffffff" /> GitHub
        </el-link>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.blog-footer {
  background: #1a1a2e;
  padding: 24px 40px;
  text-align: center;
  flex-shrink: 0;
}

.footer-inner {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.footer-links {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  :deep(.el-link) {
    color: rgba(255, 255, 255, 0.6) !important;
    &:hover {
      color: #fff !important;
    }
  }
}
</style>
