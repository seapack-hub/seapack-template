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
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api/, "")
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
      // 自动处理Cesium资源、Web Worker、Base URL
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
    define: {
      // 解决Cesium全局变量问题（vite-plugin-cesium已处理，保留备用）
      CESIUM_BASE_URL: JSON.stringify("")
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxuZXdUZW1wbGF0ZVxcXFxzZWFwYWNrLXRlbXBsYXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxuZXdUZW1wbGF0ZVxcXFxzZWFwYWNrLXRlbXBsYXRlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9uZXdUZW1wbGF0ZS9zZWFwYWNrLXRlbXBsYXRlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXHJcbmltcG9ydCBFbGVtZW50UGx1cyBmcm9tICd1bnBsdWdpbi1lbGVtZW50LXBsdXMvdml0ZSdcclxuLy9lbGVtZW50LXBsdXNcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuLy9cdTVGMTVcdTUxNjVcdTVERTVcdTUxNzdcdTYzRDJcdTRFRjZcclxuaW1wb3J0IFZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcclxuLy9cdTkxNERcdTdGNkVVbm9DU1NcclxuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSdcclxuLy9cdTkxNERcdTdGNkVTVkdcclxuaW1wb3J0IHsgY3JlYXRlU3ZnSWNvbnNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zdmctaWNvbnMnXHJcbi8vXHU1RjE1XHU1MTY1XHU1NzMwXHU1NkZFXHU3RUM0XHU0RUY2XHJcbmltcG9ydCBjZXNpdW0gZnJvbSAndml0ZS1wbHVnaW4tY2VzaXVtJ1xyXG4vL0B0cy1pZ25vcmVcclxuLy9pbXBvcnQgZXNsaW50UGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWVzbGludCdcclxuaW1wb3J0IGVzbGludCBmcm9tICd2aXRlLXBsdWdpbi1lc2xpbnQnO1xyXG5pbXBvcnQgeyB0eXBlIENvbmZpZ0VudiwgdHlwZSBVc2VyQ29uZmlnRXhwb3J0LCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcblxyXG4vL1x1NUYxNVx1NTE2NW1vY2tcdTY3MERcdTUyQTFcclxuLy9pbXBvcnQgbW9ja0RldlNlcnZlclBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1tb2NrLWRldi1zZXJ2ZXInXHJcbmltcG9ydCB7IHZpdGVNb2NrU2VydmUgfSBmcm9tICd2aXRlLXBsdWdpbi1tb2NrJztcclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7bW9kZX06Q29uZmlnRW52KSA9PiB7XHJcbiAgY29uc3Qgdml0ZUVudiA9IGxvYWRFbnYobW9kZSxwcm9jZXNzLmN3ZCgpKTtcclxuICBjb25zdCB7IFZJVEVfUFVCTElDX1BBVEgsVklURV9NT0NLX0RFVl9TRVJWRVIsVklURV9CQVNFX0FQSSxWSVRFX0FQUF9BUElfVVJMLE5PREVfRU5WIH0gPSB2aXRlRW52O1xyXG4gIHJldHVybiB7XHJcbiAgICBiYXNlOlZJVEVfUFVCTElDX1BBVEgsXHJcbiAgICBzZXJ2ZXI6e1xyXG4gICAgICAvKiogXHU4QkJFXHU3RjZFIGhvc3Q6IHRydWUgXHU2MjREXHU1M0VGXHU0RUU1XHU0RjdGXHU3NTI4IE5ldHdvcmsgXHU3Njg0XHU1RjYyXHU1RjBGXHVGRjBDXHU0RUU1IElQIFx1OEJCRlx1OTVFRVx1OTg3OVx1NzZFRSAqL1xyXG4gICAgICBob3N0OnRydWUsXHJcbiAgICAgIC8qKiBcdTdBRUZcdTUzRTNcdTUzRjcgKi9cclxuICAgICAgcG9ydDo0NDQ0LFxyXG4gICAgICAvKiogXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU2MjUzXHU1RjAwXHU2RDRGXHU4OUM4XHU1NjY4ICovXHJcbiAgICAgIG9wZW46ZmFsc2UsXHJcbiAgICAgIC8qKiBcdTY2MkZcdTU0MjZcdTUxNDFcdThCQjhcdThERThcdTU3REYgKi9cclxuICAgICAgY29yczp0cnVlLFxyXG4gICAgICAvKiogXHU3QUVGXHU1M0UzXHU1M0Y3XHU4OEFCXHU1MzYwXHU3NTI4XHU2NUY2XHVGRjBDXHU2NjJGXHU1NDI2XHU3NkY0XHU2M0E1XHU5MDAwXHU1MUZBICovXHJcbiAgICAgIHN0cmljdFBvcnQ6ZmFsc2UsXHJcbiAgICAgIC8qKiBcdTYzQTVcdTUzRTNcdTRFRTNcdTc0MDYgKi9cclxuICAgICAgcHJveHk6e1xyXG4gICAgICAgIFwiL2FwaVwiOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IFZJVEVfQVBQX0FQSV9VUkwsXHJcbiAgICAgICAgICB3czogdHJ1ZSxcclxuICAgICAgICAgIC8qKiBcdTY2MkZcdTU0MjZcdTUxNDFcdThCQjhcdThERThcdTU3REYgKi9cclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICB2dWUoKSxcclxuICAgICAgVklURV9NT0NLX0RFVl9TRVJWRVIgPT09IFwidHJ1ZVwiID8gdml0ZU1vY2tTZXJ2ZSh7XHJcbiAgICAgICAgaWdub3JlOiAvXlxcXy8sXHJcbiAgICAgICAgbW9ja1BhdGg6ICdtb2NrJywgICAvLyBNb2NrIFx1NjU4N1x1NEVGNlx1NUI1OFx1NjUzRVx1NzZFRVx1NUY1NVx1RkYwOFx1OUVEOFx1OEJBNCBgbW9ja2BcdUZGMDlcclxuICAgICAgICBsb2NhbEVuYWJsZWQ6IGZhbHNlLCAgICAgLy8gXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU1NDJGXHU3NTI4IE1vY2tcclxuICAgICAgICBwcm9kRW5hYmxlZDogdHJ1ZSwgICAgIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1Nzk4MVx1NzUyOCBNb2NrXHJcbiAgICAgICAgc3VwcG9ydFRzOiB0cnVlLCAgICAgICAvLyBcdTY1MkZcdTYzMDEgVHlwZVNjcmlwdCBcdTY1ODdcdTRFRjZcclxuICAgICAgICBsb2dnZXI6IHRydWUsICAgICAgICAgICAvLyBcdTYzQTdcdTUyMzZcdTUzRjBcdTY2M0VcdTc5M0FcdThCRjdcdTZDNDJcdTY1RTVcdTVGRDdcclxuICAgICAgICB3YXRjaEZpbGVzOiB0cnVlLCAgICAgICAvLyBcdTc2RDFcdTU0MkMgTW9jayBcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzlcdTgxRUFcdTUyQThcdTY2RjRcdTY1QjBcclxuICAgICAgICBpbmplY3RDb2RlOiBgaW1wb3J0IHsgc2V0dXBQcm9kTW9ja1NlcnZlciB9IGZyb20gJy4uL21vY2svbW9ja1Byb2RTZXJ2ZXIudHMnOyBzZXR1cFByb2RNb2NrU2VydmVyKCk7YCwgXHJcbiAgICAgIH0pIDogbnVsbCxcclxuICAgICAgLy8gXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2Q2VzaXVtXHU4RDQ0XHU2RTkwXHUzMDAxV2ViIFdvcmtlclx1MzAwMUJhc2UgVVJMXHJcbiAgICAgIGNlc2l1bSgpLFxyXG4gICAgICAvL1x1OTE0RFx1N0Y2RUVsZW1lbnRQbHVzLFx1ODFFQVx1NTJBOFx1NUYxNVx1NTE2NVxyXG4gICAgICBFbGVtZW50UGx1cyh7fSksXHJcbiAgICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICAgICAgaW1wb3J0czogWyd2dWUnLCd2dWUtcm91dGVyJywnQHZ1ZXVzZS9jb3JlJ10sIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NSBWdWUgXHU3NkY4XHU1MTczXHU1MUZEXHU2NTcwXHJcbiAgICAgICAgZHRzOiAnLi9hdXRvLWltcG9ydHMuZC50cycsIC8vIFx1NzUxRlx1NjIxMFx1N0M3Qlx1NTc4Qlx1NThGMFx1NjYwRVx1NjU4N1x1NEVGNlx1NzY4NFx1OERFRlx1NUY4NFxyXG4gICAgICAgIGVzbGludHJjOiB7XHJcbiAgICAgICAgICBlbmFibGVkOiBmYWxzZSwgIC8vIDFcdTMwMDFcdTY1MzlcdTRFM0F0cnVlXHU3NTI4XHU0RThFXHU3NTFGXHU2MjEwZXNsaW50XHU5MTREXHU3RjZFXHUzMDAyMlx1MzAwMVx1NzUxRlx1NjIxMFx1NTQwRVx1NjUzOVx1NTZERWZhbHNlXHVGRjBDXHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHU3NTFGXHU2MjEwXHU2RDg4XHU4MDE3XHJcbiAgICAgICAgfSxcclxuICAgICAgfSksXHJcbiAgICAgIFVub0NTUygpLFxyXG4gICAgICBDb21wb25lbnRzKHtcclxuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxyXG4gICAgICAgIC8vIFx1NjMwN1x1NUI5QVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NzY4NFx1N0VDNFx1NEVGNlx1NEY0RFx1N0Y2RVx1RkYwQ1x1OUVEOFx1OEJBNFx1NjYyRiBzcmMvY29tcG9uZW50c1xyXG4gICAgICAgIGRpcnM6WydzcmMvY29tcG9uZW50cyddLFxyXG4gICAgICB9KSxcclxuICAgICAgLy8gU1ZHXHU5MTREXHU3RjZFXHJcbiAgICAgIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcclxuICAgICAgICAvLyBcdTYzMDdcdTVCOUFcdTk3MDBcdTg5ODFcdTdGMTNcdTVCNThcdTc2ODRcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTU5MzlcclxuICAgICAgICBpY29uRGlyczogW3Jlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9hc3NldHMvaWNvbnMnKV0sXHJcbiAgICAgICAgLy8gXHU2MzA3XHU1QjlBc3ltYm9sSWRcdTY4M0NcdTVGMEZcclxuICAgICAgICBzeW1ib2xJZDogJ2ljb24tW2Rpcl0tW25hbWVdJyxcclxuICAgICAgfSksXHJcbiAgICAgIFZ1ZURldlRvb2xzKCksXHJcbiAgICAgIGVzbGludCh7XHJcbiAgICAgICAgaW5jbHVkZTogWydzcmMvKiovKi50cycsICdzcmMvKiovKi5qcycsICdzcmMvKiovKi52dWUnLCAnc3JjLyoudHMnLCAnc3JjLyouanMnLCAnc3JjLyoudnVlJ11cclxuICAgICAgfSlcclxuICAgIF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCdzcmMnKSxcclxuICAgICAgICAnQHAnOnBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsJ3B1YmxpYycpLFxyXG4gICAgICAgICdAY2VzJzpwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3ZpZXdzL3dvcmxkRGF0YS9jZXNpdW0nKVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICAvLyBcdTg5RTNcdTUxQjNDZXNpdW1cdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0ZcdTk1RUVcdTk4OThcdUZGMDh2aXRlLXBsdWdpbi1jZXNpdW1cdTVERjJcdTU5MDRcdTc0MDZcdUZGMENcdTRGRERcdTc1NTlcdTU5MDdcdTc1MjhcdUZGMDlcclxuICAgICAgQ0VTSVVNX0JBU0VfVVJMOiBKU09OLnN0cmluZ2lmeSgnJylcclxuICAgIH0sXHJcbiAgICAvLyBcdTk4ODRcdTUyQTBcdThGN0RcdTk4NzlcdTc2RUVcdTVGQzVcdTk3MDBcdTc2ODRcdTdFQzRcdTRFRjZcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICBpbmNsdWRlOltcclxuICAgICAgICBcIkB3YW5nZWRpdG9yL2VkaXRvclwiLFxyXG4gICAgICAgIFwiQHdhbmdlZGl0b3IvZWRpdG9yLWZvci12dWVcIixcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGxpbnRPblNhdmU6IGZhbHNlLCAgLy8gXHU2REZCXHU1MkEwXHU4RkQ5XHU0RTAwXHU4ODRDXHU0RUUzXHU3ODAxXHJcbiAgICBidWlsZDp7XHJcbiAgICAgIHRhcmdldDogJ2VzMjAyMCdcclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVIsU0FBUyxvQkFBb0I7QUFDbFQsT0FBTyxTQUFTO0FBQ2hCLFlBQVksVUFBVTtBQUN0QixTQUFTLFdBQUFBLGdCQUFlO0FBQ3hCLE9BQU8saUJBQWlCO0FBRXhCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBRXBDLE9BQU8saUJBQWlCO0FBRXhCLE9BQU8sWUFBWTtBQUVuQixTQUFTLDRCQUE0QjtBQUVyQyxPQUFPLFlBQVk7QUFHbkIsT0FBTyxZQUFZO0FBQ25CLFNBQWdELGVBQWU7QUFJL0QsU0FBUyxxQkFBcUI7QUF4QjlCLElBQU0sbUNBQW1DO0FBeUJ6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFDLEtBQUksTUFBZ0I7QUFDaEQsUUFBTSxVQUFVLFFBQVEsTUFBSyxRQUFRLElBQUksQ0FBQztBQUMxQyxRQUFNLEVBQUUsa0JBQWlCLHNCQUFxQixlQUFjLGtCQUFpQixTQUFTLElBQUk7QUFDMUYsU0FBTztBQUFBLElBQ0wsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBO0FBQUEsTUFFTCxNQUFLO0FBQUE7QUFBQSxNQUVMLE1BQUs7QUFBQTtBQUFBLE1BRUwsTUFBSztBQUFBO0FBQUEsTUFFTCxNQUFLO0FBQUE7QUFBQSxNQUVMLFlBQVc7QUFBQTtBQUFBLE1BRVgsT0FBTTtBQUFBLFFBQ0osUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsSUFBSTtBQUFBO0FBQUEsVUFFSixjQUFjO0FBQUEsVUFDZCxTQUFTLENBQUNDLFVBQVNBLE1BQUssUUFBUSxVQUFVLEVBQUU7QUFBQSxRQUM5QztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxJQUFJO0FBQUEsTUFDSix5QkFBeUIsU0FBUyxjQUFjO0FBQUEsUUFDOUMsUUFBUTtBQUFBLFFBQ1IsVUFBVTtBQUFBO0FBQUEsUUFDVixjQUFjO0FBQUE7QUFBQSxRQUNkLGFBQWE7QUFBQTtBQUFBLFFBQ2IsV0FBVztBQUFBO0FBQUEsUUFDWCxRQUFRO0FBQUE7QUFBQSxRQUNSLFlBQVk7QUFBQTtBQUFBLFFBQ1osWUFBWTtBQUFBLE1BQ2QsQ0FBQyxJQUFJO0FBQUE7QUFBQSxNQUVMLE9BQU87QUFBQTtBQUFBLE1BRVAsWUFBWSxDQUFDLENBQUM7QUFBQSxNQUNkLFdBQVc7QUFBQSxRQUNULFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQztBQUFBLFFBQ2pDLFNBQVMsQ0FBQyxPQUFNLGNBQWEsY0FBYztBQUFBO0FBQUEsUUFDM0MsS0FBSztBQUFBO0FBQUEsUUFDTCxVQUFVO0FBQUEsVUFDUixTQUFTO0FBQUE7QUFBQSxRQUNYO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQTtBQUFBLFFBRWpDLE1BQUssQ0FBQyxnQkFBZ0I7QUFBQSxNQUN4QixDQUFDO0FBQUE7QUFBQSxNQUVELHFCQUFxQjtBQUFBO0FBQUEsUUFFbkIsVUFBVSxDQUFDQyxTQUFRLFFBQVEsSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQUE7QUFBQSxRQUVyRCxVQUFVO0FBQUEsTUFDWixDQUFDO0FBQUEsTUFDRCxZQUFZO0FBQUEsTUFDWixPQUFPO0FBQUEsUUFDTCxTQUFTLENBQUMsZUFBZSxlQUFlLGdCQUFnQixZQUFZLFlBQVksV0FBVztBQUFBLE1BQzdGLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFVLGFBQVEsa0NBQVUsS0FBSztBQUFBLFFBQ2pDLE1BQVUsYUFBUSxrQ0FBVSxRQUFRO0FBQUEsUUFDcEMsUUFBWSxhQUFRLGtDQUFXLDRCQUE0QjtBQUFBLE1BQzdEO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBO0FBQUEsTUFFTixpQkFBaUIsS0FBSyxVQUFVLEVBQUU7QUFBQSxJQUNwQztBQUFBO0FBQUEsSUFFQSxjQUFjO0FBQUEsTUFDWixTQUFRO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsWUFBWTtBQUFBO0FBQUEsSUFDWixPQUFNO0FBQUEsTUFDSixRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJyZXNvbHZlIiwgInBhdGgiLCAicmVzb2x2ZSJdCn0K
