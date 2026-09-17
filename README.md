# 郝浩 · Personal Website

课程作业 —— 使用纯 **HTML / CSS / JavaScript** 手工搭建的响应式个人主页，无任何前端框架。

🔗 在线预览：https://sweethaohao.github.io/personalweb/

## ✨ 功能

- 响应式布局（桌面 / 平板 / 手机自适应）
- 深色主题 + 渐变视觉风格
- 打字机文字动画、滚动入场动画、技能进度条
- 顶部导航高亮当前分区、移动端汉堡菜单
- 关于我 / 技能 / 项目 / 联系表单 / 页脚

## 📁 目录结构

```
PersonalWeb/
├── index.html      # 页面结构
├── style.css       # 样式与响应式
├── script.js       # 交互逻辑
├── favicon.svg     # 站点图标
└── README.md
```

## 🚀 本地运行

直接用浏览器打开 `index.html` 即可；或启动本地服务器：

```bash
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 🌐 部署到 GitHub Pages

1. 推送代码到 GitHub 仓库
2. 仓库 **Settings → Pages**
3. Source 选择 **Deploy from a branch**，Branch 选 `main` / `root`
4. 稍等 1~2 分钟，访问 `https://<用户名>.github.io/personalweb/`

## 🛠 技术栈

HTML5 · CSS3（Flexbox / Grid / 自定义属性） · 原生 JavaScript（IntersectionObserver）

## 📄 授权

MIT License
