# Audio AI for Human and Machine

这是“人与机器听觉 / Audio AI for Human and Machine”课程的公开静态网站仓库。仓库当前发布已经成熟的课程导览与基础主题，同时为后续大纲调整、多人维护和课程版本演进保留稳定结构。

## 当前公开内容

- [课程首页](./index.html)
- [声音物理与多域表示导览](./session/sound-physics-sampling-spectrum/)
- [时域音频](./chapters/time-domain-audio/)
- [空间声学特征](./chapters/spatial-acoustic-features/)
- [频域处理](./chapters/frequency-domain-processing/)
- [课程大纲入口](./syllabus/)

## 信息架构

```text
.
├── index.html                     # 课程首页
├── course-data/                   # 机器可读目录、路径、术语与符号
├── syllabus/                      # 人可读课程大纲
├── session/                       # 大纲驱动的宏观导览与关系组织
├── chapters/                      # 具体知识的唯一权威页面
├── labs/                          # 可复用实验
├── projects/                      # 综合项目
├── assets/                        # 全站共享样式、脚本与媒体
├── docs/                          # 架构与教师维护说明
├── .agents/skills/                # 仓库共享 Codex Skill
└── .github/                       # 审查、责任人与发布工作流
```

核心边界：Session 只解释知识点之间的宏观关系、前置与后续，并提供可见的上下文跳转；定义、公式、推导、例题和具体知识解释全部由 Chapter 负责。

## 本地预览

在仓库根目录运行：

```powershell
python -m http.server 4173
```

然后打开 `http://127.0.0.1:4173/`。不要直接双击 HTML 代替本地服务器预览，因为相对链接、模块和浏览器安全策略可能表现不同。

## 修改与审查

请先阅读：

- [CONTRIBUTING.md](./CONTRIBUTING.md)：给教师和贡献者的维护流程；
- [AGENTS.md](./AGENTS.md)：给 Codex/Agent 的仓库规则；
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)：网站长期架构；
- [docs/skill-installation.md](./docs/skill-installation.md)：课程 Skill 的安装、更新与分发；
- [.agents/skills/build-audio-ai-course/SKILL.md](./.agents/skills/build-audio-ai-course/SKILL.md)：课程专用 Skill。

所有正式修改通过分支和 Pull Request 审查。GitHub Pages 只在结构检查通过后部署。
