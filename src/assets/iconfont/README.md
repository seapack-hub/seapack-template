# Iconfont 图标管理

## 如何更新图标

1. 打开 https://www.iconfont.cn → 登录 → 进入「我的项目」
2. 选择对应的图标项目
3. 点击「Symbol」→「下载至本地」
4. 解压下载的 zip 包
5. 将 `iconfont.js` 和 `iconfont.json` 复制到本目录，覆盖旧文件
6. 提交 Git

## 注意事項

- 仅替换 `iconfont.js` 和 `iconfont.json`，不要删除其他文件
- `setup.ts` 通过 `?raw` 导入 `iconfont.js`，正则提取 SVG sprite 字符串后直接注入 DOM（浏览器无异步等待）
- **新图标即时生效**，无需重启 Vite（HMR 重新评估 `setup.ts` 时会重新注入）
- 图标 Symbol ID 格式必须为 `#icon-xxx`，与 `vite-plugin-svg-icons` 兼容
- 如需修改 Symbol 前缀，在 Iconfont 项目设置 → FontClass/Symbol 前缀 中配置
