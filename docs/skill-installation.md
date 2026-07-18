# Audio AI 课程 Skill：安装与使用

## 唯一权威源

课程 Skill 的唯一权威源位于：

```text
.agents/skills/build-audio-ai-course/
```

不要在仓库内保存第二份 Skill 或生成后的 ZIP。修改课程规则时只编辑这个目录，并通过 Pull Request 审查文本差异。

## 仓库内使用

教师克隆仓库后，Codex/Agent 应先读取：

```text
.agents/skills/build-audio-ai-course/SKILL.md
```

仓库根目录的 `AGENTS.md` 也会要求 Agent 在修改课程页面前读取该 Skill 及其必要参考文件。

## 安装到个人 Codex

需要在其他仓库使用这套课程规则时，将权威目录复制到个人 Codex Skill 目录。

Windows：

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item -Recurse -Force ".agents\skills\build-audio-ai-course" "$env:USERPROFILE\.codex\skills\"
```

macOS / Linux：

```bash
mkdir -p ~/.codex/skills
cp -R .agents/skills/build-audio-ai-course ~/.codex/skills/
```

安装或更新后重新打开 Codex，或新建任务，使 Skill 重新载入。

## GitHub 下载包

仓库不跟踪生成后的 ZIP。需要给教师提供单独下载包时，运行 GitHub Actions 中的 `Package course skill`，或推送符合 `course-*` 的版本标签。工作流会从权威目录临时生成 `build-audio-ai-course.zip` 并上传为构建产物。

下载包是发布产物，不是编辑源。任何修改都应回到 `.agents/skills/build-audio-ai-course/` 完成。

## 使用示例

```text
$build-audio-ai-course
请检查这个 Session 是否只组织宏观关系，是否通过可访问的悬浮导航链接到完整 Chapter。
```

```text
$build-audio-ai-course
请修改频域 Chapter，保留完整推导，并检查与 notation.json 的符号是否一致。
```

提交前运行：

```powershell
python .agents/skills/build-audio-ai-course/scripts/audit_course_pages.py . --strict
```

结构检查通过后，仍需按照 `.agents/skills/build-audio-ai-course/references/visual-acceptance.md` 进行真实浏览器检查。
