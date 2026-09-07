# 穆朗

去读他的书，去做他的事。

这是朱云铖（穆朗）的个人博客，记录工程实践、读书思考与独立旅行。网站使用 Jekyll 构建，并托管在 GitHub Pages：<https://zhuyuncheng.github.io>。

## 本地预览

macOS 首次运行：

```bash
brew install ruby
BUNDLE_PATH=vendor/bundle /opt/homebrew/opt/ruby/bin/bundle install
npm run serve
```

然后访问 <http://127.0.0.1:4000>。修改页面、文章或样式后，Jekyll 会自动重新生成。

仅执行静态构建：

```bash
npm run build
```

## 内容结构

- `_posts/`：已发布文章
- `_drafts/travel-guide-template.md`：旅行攻略写作模板
- `tech.md`：技术频道
- `travel.md`：旅行频道
- `assets/css/modern.css`：新版视觉样式
- `_config.yml`：站点和作者配置

旅行攻略建议在 front matter 中维护 `destination`、`duration`、`season`、`budget`、`pace` 和 `cover`，首页与旅行频道会自动读取这些信息。
