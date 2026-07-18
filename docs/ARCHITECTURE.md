# Audio AI 网站架构

## 目标

当前可以只发布部分成熟课程，同时保证未来更换教学顺序、增减教学单元、增加维护教师时不需要复制整个网站或重命名知识主题。

## 四层结构

1. **知识层**：`chapters/`、`labs/`、`projects/`，保存唯一权威内容。
2. **路径层**：`course-data/paths/`，选择当前学习顺序，教学周次只是可选元数据。
3. **导览层**：`session/`、`syllabus/`，解释宏观关系并跳转到权威内容。
4. **治理层**：`course-data/`、`.github/`、`.agents/skills/`、`docs/teacher/`。

## Session 与 Chapter

Session 是对大纲涉及知识点的组织和加工。它可以讲解主题之间的关系、与前一部分和后一部分的衔接、选择这些观察维度的原因，以及推荐学习顺序。

Session 不阐述具体知识点。定义、公式、推导、例题、互动解释和适用边界均链接到 Chapter。每个 Session 必须有持续可见的关系导航，并为链接提供“为什么要跳转”的上下文。

## URL

正式内容使用语义 URL，不使用章节序号或周次作为身份：

```text
chapters/time-domain-audio/
chapters/spatial-acoustic-features/
chapters/frequency-domain-processing/
session/sound-physics-sampling-spectrum/
```

路径顺序只在 `course-data/paths/current.json` 中表达。

## 版本

- Git commit 记录每次内容演进。
- `course-data/paths/archive/` 保存往期授课目录，不复制正文。
- Git tag/Release 冻结某个正式版本的全部页面、配置和 Skill。

历史路径配置会继续指向最新 Chapter；需要完整复现历史正文时使用对应 Git tag。

## 发布

Pull Request 先运行结构和链接检查。合并到 `main` 后，GitHub Actions 上传通过检查的静态站点并部署 GitHub Pages。构建或检查失败时不替换线上有效版本。
