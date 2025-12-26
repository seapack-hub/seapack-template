// vite.config.ts
import { defineConfig } from "file:///E:/newTemplate/seapack-template/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/newTemplate/seapack-template/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import * as path from "path";
import { resolve as resolve2 } from "path";
import ElementPlus from "file:///E:/newTemplate/seapack-template/node_modules/unplugin-element-plus/dist/vite.mjs";
import AutoImport from "file:///E:/newTemplate/seapack-template/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///E:/newTemplate/seapack-template/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///E:/newTemplate/seapack-template/node_modules/unplugin-vue-components/dist/resolvers.js";
import VueDevTools from "file:///E:/newTemplate/seapack-template/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import UnoCSS from "file:///E:/newTemplate/seapack-template/node_modules/unocss/dist/vite.mjs";
import { createSvgIconsPlugin } from "file:///E:/newTemplate/seapack-template/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import cesium from "file:///E:/newTemplate/seapack-template/node_modules/vite-plugin-cesium/dist/index.mjs";
import eslint from "file:///E:/newTemplate/seapack-template/node_modules/vite-plugin-eslint/dist/index.mjs";
import { loadEnv } from "file:///E:/newTemplate/seapack-template/node_modules/vite/dist/node/index.js";
import { viteMockServe } from "file:///E:/newTemplate/seapack-template/node_modules/vite-plugin-mock/dist/index.js";
var __vite_injected_original_dirname = "E:\\newTemplate\\seapack-template";
var vite_config_default = defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, process.cwd());
  const { VITE_PUBLIC_PATH, VITE_MOCK_DEV_SERVER, VITE_BASE_API, VITE_APP_API_URL, NODE_ENV } = viteEnv;
  return {
    base: VITE_PUBLIC_PATH,
    server: {
      /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
      host: true,
      /** 端口号 */
      port: 4444,
      /** 是否自动打开浏览器 */
      open: false,
      /** 是否允许跨域 */
      cors: true,
      /** 端口号被占用时，是否直接退出 */
      strictPort: false,
      /** 接口代理 */
      proxy: {
        "/api": {
          target: VITE_APP_API_URL,
          // ws: true,
          // /** 是否允许跨域 */
          // changeOrigin: true,
          rewrite: (path2) => path2.replace(new RegExp("^" + VITE_BASE_API), "")
        }
      }
    },
    plugins: [
      vue(),
      VITE_MOCK_DEV_SERVER === "true" ? viteMockServe({
        ignore: /^\_/,
        mockPath: "mock",
        // Mock 文件存放目录（默认 `mock`）
        localEnabled: false,
        // 开发环境启用 Mock
        prodEnabled: true,
        // 生产环境禁用 Mock
        supportTs: true,
        // 支持 TypeScript 文件
        logger: true,
        // 控制台显示请求日志
        watchFiles: true,
        // 监听 Mock 文件修改自动更新
        injectCode: `import { setupProdMockServer } from '../mock/mockProdServer.ts'; setupProdMockServer();`
      }) : null,
      cesium(),
      //配置ElementPlus,自动引入
      ElementPlus({}),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ["vue", "vue-router", "@vueuse/core"],
        // 自动导入 Vue 相关函数
        dts: "./auto-imports.d.ts",
        // 生成类型声明文件的路径
        eslintrc: {
          enabled: false
          // 1、改为true用于生成eslint配置。2、生成后改回false，避免重复生成消耗
        }
      }),
      UnoCSS(),
      Components({
        resolvers: [ElementPlusResolver()],
        // 指定自动导入的组件位置，默认是 src/components
        dirs: ["src/components"]
      }),
      // SVG配置
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve2(process.cwd(), "src/assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]"
      }),
      VueDevTools(),
      eslint({
        include: ["src/**/*.ts", "src/**/*.js", "src/**/*.vue", "src/*.ts", "src/*.js", "src/*.vue"]
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "src"),
        "@p": path.resolve(__vite_injected_original_dirname, "public"),
        "@ces": path.resolve(__vite_injected_original_dirname, "src/views/worldData/cesium")
      }
    },
    // 预加载项目必需的组件
    optimizeDeps: {
      include: [
        "@wangeditor/editor",
        "@wangeditor/editor-for-vue"
      ]
    },
    lintOnSave: false,
    // 添加这一行代码
    build: {
      target: "es2020"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxuZXdUZW1wbGF0ZVxcXFxzZWFwYWNrLXRlbXBsYXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxuZXdUZW1wbGF0ZVxcXFxzZWFwYWNrLXRlbXBsYXRlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9uZXdUZW1wbGF0ZS9zZWFwYWNrLXRlbXBsYXRlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXHJcbmltcG9ydCBFbGVtZW50UGx1cyBmcm9tICd1bnBsdWdpbi1lbGVtZW50LXBsdXMvdml0ZSdcclxuLy9lbGVtZW50LXBsdXNcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuLy9cdTVGMTVcdTUxNjVcdTVERTVcdTUxNzdcdTYzRDJcdTRFRjZcclxuaW1wb3J0IFZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcclxuLy9cdTkxNERcdTdGNkVVbm9DU1NcclxuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSdcclxuLy9cdTkxNERcdTdGNkVTVkdcclxuaW1wb3J0IHsgY3JlYXRlU3ZnSWNvbnNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zdmctaWNvbnMnXHJcbi8vXHU1RjE1XHU1MTY1XHU1NzMwXHU1NkZFXHU3RUM0XHU0RUY2XHJcbmltcG9ydCBjZXNpdW0gZnJvbSAndml0ZS1wbHVnaW4tY2VzaXVtJ1xyXG4vL0B0cy1pZ25vcmVcclxuLy9pbXBvcnQgZXNsaW50UGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWVzbGludCdcclxuaW1wb3J0IGVzbGludCBmcm9tICd2aXRlLXBsdWdpbi1lc2xpbnQnO1xyXG5pbXBvcnQgeyB0eXBlIENvbmZpZ0VudiwgdHlwZSBVc2VyQ29uZmlnRXhwb3J0LCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcblxyXG4vL1x1NUYxNVx1NTE2NW1vY2tcdTY3MERcdTUyQTFcclxuLy9pbXBvcnQgbW9ja0RldlNlcnZlclBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1tb2NrLWRldi1zZXJ2ZXInXHJcbmltcG9ydCB7IHZpdGVNb2NrU2VydmUgfSBmcm9tICd2aXRlLXBsdWdpbi1tb2NrJztcclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7bW9kZX06Q29uZmlnRW52KSA9PiB7XHJcbiAgY29uc3Qgdml0ZUVudiA9IGxvYWRFbnYobW9kZSxwcm9jZXNzLmN3ZCgpKTtcclxuICBjb25zdCB7IFZJVEVfUFVCTElDX1BBVEgsVklURV9NT0NLX0RFVl9TRVJWRVIsVklURV9CQVNFX0FQSSxWSVRFX0FQUF9BUElfVVJMLE5PREVfRU5WIH0gPSB2aXRlRW52O1xyXG4gIHJldHVybiB7XHJcbiAgICBiYXNlOlZJVEVfUFVCTElDX1BBVEgsXHJcbiAgICBzZXJ2ZXI6e1xyXG4gICAgICAvKiogXHU4QkJFXHU3RjZFIGhvc3Q6IHRydWUgXHU2MjREXHU1M0VGXHU0RUU1XHU0RjdGXHU3NTI4IE5ldHdvcmsgXHU3Njg0XHU1RjYyXHU1RjBGXHVGRjBDXHU0RUU1IElQIFx1OEJCRlx1OTVFRVx1OTg3OVx1NzZFRSAqL1xyXG4gICAgICBob3N0OnRydWUsXHJcbiAgICAgIC8qKiBcdTdBRUZcdTUzRTNcdTUzRjcgKi9cclxuICAgICAgcG9ydDo0NDQ0LFxyXG4gICAgICAvKiogXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU2MjUzXHU1RjAwXHU2RDRGXHU4OUM4XHU1NjY4ICovXHJcbiAgICAgIG9wZW46ZmFsc2UsXHJcbiAgICAgIC8qKiBcdTY2MkZcdTU0MjZcdTUxNDFcdThCQjhcdThERThcdTU3REYgKi9cclxuICAgICAgY29yczp0cnVlLFxyXG4gICAgICAvKiogXHU3QUVGXHU1M0UzXHU1M0Y3XHU4OEFCXHU1MzYwXHU3NTI4XHU2NUY2XHVGRjBDXHU2NjJGXHU1NDI2XHU3NkY0XHU2M0E1XHU5MDAwXHU1MUZBICovXHJcbiAgICAgIHN0cmljdFBvcnQ6ZmFsc2UsXHJcbiAgICAgIC8qKiBcdTYzQTVcdTUzRTNcdTRFRTNcdTc0MDYgKi9cclxuICAgICAgcHJveHk6e1xyXG4gICAgICAgIFwiL2FwaVwiOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IFZJVEVfQVBQX0FQSV9VUkwsXHJcbiAgICAgICAgICAvLyB3czogdHJ1ZSxcclxuICAgICAgICAgIC8vIC8qKiBcdTY2MkZcdTU0MjZcdTUxNDFcdThCQjhcdThERThcdTU3REYgKi9cclxuICAgICAgICAgIC8vIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UobmV3IFJlZ0V4cChcIl5cIiArIFZJVEVfQkFTRV9BUEkpLCBcIlwiKSxcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHZ1ZSgpLFxyXG4gICAgICBWSVRFX01PQ0tfREVWX1NFUlZFUiA9PT0gXCJ0cnVlXCIgPyB2aXRlTW9ja1NlcnZlKHtcclxuICAgICAgICBpZ25vcmU6IC9eXFxfLyxcclxuICAgICAgICBtb2NrUGF0aDogJ21vY2snLCAgIC8vIE1vY2sgXHU2NTg3XHU0RUY2XHU1QjU4XHU2NTNFXHU3NkVFXHU1RjU1XHVGRjA4XHU5RUQ4XHU4QkE0IGBtb2NrYFx1RkYwOVxyXG4gICAgICAgIGxvY2FsRW5hYmxlZDogZmFsc2UsICAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTU0MkZcdTc1MjggTW9ja1xyXG4gICAgICAgIHByb2RFbmFibGVkOiB0cnVlLCAgICAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU3OTgxXHU3NTI4IE1vY2tcclxuICAgICAgICBzdXBwb3J0VHM6IHRydWUsICAgICAgIC8vIFx1NjUyRlx1NjMwMSBUeXBlU2NyaXB0IFx1NjU4N1x1NEVGNlxyXG4gICAgICAgIGxvZ2dlcjogdHJ1ZSwgICAgICAgICAgIC8vIFx1NjNBN1x1NTIzNlx1NTNGMFx1NjYzRVx1NzkzQVx1OEJGN1x1NkM0Mlx1NjVFNVx1NUZEN1xyXG4gICAgICAgIHdhdGNoRmlsZXM6IHRydWUsICAgICAgIC8vIFx1NzZEMVx1NTQyQyBNb2NrIFx1NjU4N1x1NEVGNlx1NEZFRVx1NjUzOVx1ODFFQVx1NTJBOFx1NjZGNFx1NjVCMFxyXG4gICAgICAgIGluamVjdENvZGU6IGBpbXBvcnQgeyBzZXR1cFByb2RNb2NrU2VydmVyIH0gZnJvbSAnLi4vbW9jay9tb2NrUHJvZFNlcnZlci50cyc7IHNldHVwUHJvZE1vY2tTZXJ2ZXIoKTtgLCBcclxuICAgICAgfSkgOiBudWxsLFxyXG4gICAgICBjZXNpdW0oKSxcclxuICAgICAgLy9cdTkxNERcdTdGNkVFbGVtZW50UGx1cyxcdTgxRUFcdTUyQThcdTVGMTVcdTUxNjVcclxuICAgICAgRWxlbWVudFBsdXMoe30pLFxyXG4gICAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxyXG4gICAgICAgIGltcG9ydHM6IFsndnVlJywndnVlLXJvdXRlcicsJ0B2dWV1c2UvY29yZSddLCAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjUgVnVlIFx1NzZGOFx1NTE3M1x1NTFGRFx1NjU3MFxyXG4gICAgICAgIGR0czogJy4vYXV0by1pbXBvcnRzLmQudHMnLCAvLyBcdTc1MUZcdTYyMTBcdTdDN0JcdTU3OEJcdTU4RjBcdTY2MEVcdTY1ODdcdTRFRjZcdTc2ODRcdThERUZcdTVGODRcclxuICAgICAgICBlc2xpbnRyYzoge1xyXG4gICAgICAgICAgZW5hYmxlZDogZmFsc2UsICAvLyAxXHUzMDAxXHU2NTM5XHU0RTNBdHJ1ZVx1NzUyOFx1NEU4RVx1NzUxRlx1NjIxMGVzbGludFx1OTE0RFx1N0Y2RVx1MzAwMjJcdTMwMDFcdTc1MUZcdTYyMTBcdTU0MEVcdTY1MzlcdTU2REVmYWxzZVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTFDRFx1NTkwRFx1NzUxRlx1NjIxMFx1NkQ4OFx1ODAxN1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pLFxyXG4gICAgICBVbm9DU1MoKSxcclxuICAgICAgQ29tcG9uZW50cyh7XHJcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcclxuICAgICAgICAvLyBcdTYzMDdcdTVCOUFcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTc2ODRcdTdFQzRcdTRFRjZcdTRGNERcdTdGNkVcdUZGMENcdTlFRDhcdThCQTRcdTY2MkYgc3JjL2NvbXBvbmVudHNcclxuICAgICAgICBkaXJzOlsnc3JjL2NvbXBvbmVudHMnXSxcclxuICAgICAgfSksXHJcbiAgICAgIC8vIFNWR1x1OTE0RFx1N0Y2RVxyXG4gICAgICBjcmVhdGVTdmdJY29uc1BsdWdpbih7XHJcbiAgICAgICAgLy8gXHU2MzA3XHU1QjlBXHU5NzAwXHU4OTgxXHU3RjEzXHU1QjU4XHU3Njg0XHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1OTM5XHJcbiAgICAgICAgaWNvbkRpcnM6IFtyZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvYXNzZXRzL2ljb25zJyldLFxyXG4gICAgICAgIC8vIFx1NjMwN1x1NUI5QXN5bWJvbElkXHU2ODNDXHU1RjBGXHJcbiAgICAgICAgc3ltYm9sSWQ6ICdpY29uLVtkaXJdLVtuYW1lXScsXHJcbiAgICAgIH0pLFxyXG4gICAgICBWdWVEZXZUb29scygpLFxyXG4gICAgICBlc2xpbnQoe1xyXG4gICAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoudHMnLCAnc3JjLyoqLyouanMnLCAnc3JjLyoqLyoudnVlJywgJ3NyYy8qLnRzJywgJ3NyYy8qLmpzJywgJ3NyYy8qLnZ1ZSddXHJcbiAgICAgIH0pXHJcbiAgICBdLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwnc3JjJyksXHJcbiAgICAgICAgJ0BwJzpwYXRoLnJlc29sdmUoX19kaXJuYW1lLCdwdWJsaWMnKSxcclxuICAgICAgICAnQGNlcyc6cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy92aWV3cy93b3JsZERhdGEvY2VzaXVtJylcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICAvLyBcdTk4ODRcdTUyQTBcdThGN0RcdTk4NzlcdTc2RUVcdTVGQzVcdTk3MDBcdTc2ODRcdTdFQzRcdTRFRjZcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICBpbmNsdWRlOltcclxuICAgICAgICBcIkB3YW5nZWRpdG9yL2VkaXRvclwiLFxyXG4gICAgICAgIFwiQHdhbmdlZGl0b3IvZWRpdG9yLWZvci12dWVcIixcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGxpbnRPblNhdmU6IGZhbHNlLCAgLy8gXHU2REZCXHU1MkEwXHU4RkQ5XHU0RTAwXHU4ODRDXHU0RUUzXHU3ODAxXHJcbiAgICBidWlsZDp7XHJcbiAgICAgIHRhcmdldDogJ2VzMjAyMCdcclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVIsU0FBUyxvQkFBb0I7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
