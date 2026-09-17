# 倪永昊 · Personal Website

个人主页 —— 使用纯 **HTML / CSS / JavaScript** 手工搭建的几何简约风响应式网站，无任何前端框架。
背景的「几何海浪」由 Canvas 实时绘制，并跟随鼠标产生起伏与旋转变形。

🔗 在线预览：<https://sweethaohao.github.io/personalweb/>

## ✨ 特性

- 浅蓝亮色主题，几何简约设计
- **点线网格背景**：鼠标移动时产生排斥 / 旋涡状的动态海浪效果
- 完整响应式布局（桌面 / 平板 / 手机）
- 打字机文字、滚动入场动画、技能进度条
- 导航高亮当前分区、移动端汉堡菜单
- 关于我 / 技能 / 项目 / 兴趣 / 联系表单

## 📁 目录结构

```
PersonalWeb/
├── index.html          # 页面结构
├── style.css           # 样式与响应式布局
├── script.js           # 交互逻辑（含 Canvas 背景）
├── favicon.svg         # 站点图标
├── assets/img/         # 图片资源
├── LICENSE             # MIT 授权
└── README.md
```

## 🚀 本地运行

方式一：直接用浏览器打开 `index.html`。

方式二：启动一个本地静态服务器（推荐）：

```bash
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 🌐 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. **Source** 选择 `Deploy from a branch`
4. **Branch** 选择 `main`，目录选择 `/ (root)`，点击 **Save**
5. 稍等 1~2 分钟，访问 `https://<你的用户名>.github.io/personalweb/`

## 🛠 技术栈

HTML5 · CSS3（Flexbox / Grid / 自定义属性） · 原生 JavaScript（Canvas / IntersectionObserver）

## 📄 授权

本项目基于 [MIT License](LICENSE) 开源。
