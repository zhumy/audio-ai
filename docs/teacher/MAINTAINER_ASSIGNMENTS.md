# 课程维护责任表

在增加教师后，将 `待指定` 替换为 GitHub 用户名或团队，并同步更新 `.github/CODEOWNERS`。

| 内容 | 路径 | 主维护者 | 领域审查 | 状态 |
|---|---|---|---|---|
| 课程首页与当前路径 | `index.html`、`course-data/paths/` | `@zhumy` | 待指定 | published |
| 声音物理与多域导览 | `session/sound-physics-sampling-spectrum/` | `@zhumy` | 待指定 | published |
| 时域音频 | `chapters/time-domain-audio/` | `@zhumy` | 待指定 | published |
| 空间声学特征 | `chapters/spatial-acoustic-features/` | `@zhumy` | 待指定 | published |
| 频域处理 | `chapters/frequency-domain-processing/` | `@zhumy` | 待指定 | published |
| 共享术语、符号和单位 | `course-data/glossary.json`、`notation.json`、`units.json` | `@zhumy` | 各领域负责人 | initial |
| 全站样式和交互 | `assets/` | `@zhumy` | 待指定 | active |
| 课程 Skill 与检查脚本 | `.agents/skills/build-audio-ai-course/` | `@zhumy` | 课程负责人 | active |

## 审查规则

- 章节维护者负责内容正确性和教学表达。
- 领域负责人负责跨章节概念、符号和单位一致性。
- 课程负责人处理跨领域冲突并批准共享定义变化。
- Agent 负责发现冲突、链接和结构问题，不代替教师作出学术裁决。
