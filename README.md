# Audio AI for Human and Machine

这是 `Audio AI` 课程的 GitHub Pages 发布目录。当前版本采用纯静态结构，适合直接从 GitHub Pages 发布。

## 发布方式

1. 将 `Audio_AI_for_Human_and_Machine/` 作为仓库根目录，或复制其内容到仓库根目录。
2. 在 GitHub 仓库中进入 `Settings -> Pages`。
3. 选择 `Deploy from a branch`。
4. 分支选择 `main`，目录选择 `/ (root)`。
5. 保存后，GitHub Pages 会从根目录的 `index.html` 发布课程入口。

如果这个目录只是大仓库中的子目录，也可以在 GitHub Actions 中把该目录作为发布源。

## 目录约定

```text
.
├── index.html                         # GitHub Pages 默认入口，跳转到 00-home
├── chapters/
│   ├── 00-home/                       # 课程首页，也作为独立章节维护
│   ├── 01-time-domain-audio/          # 第 1 章：时域音频
│   └── 02-frequency-domain-processing/# 第 2 章：频域处理
├── assets/
│   ├── css/                           # 统一视觉主题与章节样式
│   ├── js/                            # 统一交互脚本
│   ├── images/                        # 图片素材
│   ├── audio/                         # 小型音频样本
│   ├── video/                         # 小型视频或封面
│   └── data/                          # 实验数据
└── references/                        # 参考资料，可放轻量索引或外链
```

## 扩展建议

- 每个新章节都新建一个 `chapters/chXX-topic/index.html`。
- 每章如需独立音频、字幕、讲稿，可放入该章节自己的 `media/`、`notes.md`、`script.md`。
- 大型视频不建议直接放 GitHub 仓库，建议使用 Bilibili、YouTube、Vimeo 或对象存储，并在页面中嵌入。
- 共享视觉和交互能力放在 `assets/css/` 与 `assets/js/`，避免每章重复维护。

## 访问统计

GitHub Pages 本身适合发布静态课程页，但不直接提供完整的访问来源、地域、章节浏览量统计。
当前站点已经预留统一统计入口：

- `assets/js/analytics-config.js`：填写统计平台和站点 ID。
- `assets/js/analytics.js`：统一加载统计脚本，支持 Cloudflare Web Analytics、Umami、Plausible、GA4。

默认配置为关闭状态：

```js
window.AudioAIAnalytics = {
  enabled: false,
  provider: "",
  siteId: "",
  scriptSrc: "",
};
```

推荐选择：

- 面向教学发布、希望轻量和隐私友好：Cloudflare Web Analytics。
- 希望自己掌控数据：Umami，可以自托管，也可以使用云服务。
- 希望报表简洁、重视来源和页面浏览：Plausible。
- 希望和广告、搜索、复杂事件分析打通：GA4，但配置和隐私说明更复杂。

启用示例：

```js
window.AudioAIAnalytics = {
  enabled: true,
  provider: "cloudflare",
  siteId: "YOUR_CLOUDFLARE_TOKEN",
  scriptSrc: "",
};
```

为了记录“大家从哪里访问”，发布链接时建议使用 UTM 参数：

```text
https://your-name.github.io/audio-ai/?utm_source=wechat&utm_medium=share&utm_campaign=first_release
https://your-name.github.io/audio-ai/chapters/01-time-domain-audio/?utm_source=class&utm_medium=qr&utm_campaign=week1
```

这样统计平台可以区分访问来源、分享渠道、课程周次和具体章节。
