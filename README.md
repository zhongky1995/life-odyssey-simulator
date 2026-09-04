# 职场奥德赛模拟器

一个面向职场用户的 Codex Skill。它不会替用户选工作，而是从一个真实难题出发，一起写出三种五年走法，再通过几次具体选择，比较每条路的日常、吸引力和代价。

![手机竖版总结卡示例](assets/sample-card-preview.png)

## 它能做什么

- 从辞职、转型、晋升、Offer、副业或创业等现实问题开始对话。
- 一点点补齐用户的经历、偏好、限制和试错空间，不做机械问卷。
- 写出三条确实不同、也都与用户经历有关的职业路线。
- 把路线推进到 6～12 个月、第三年和第五年的普通工作日，让用户亲自做选择。
- 整理完整文字结果，并生成一张 1080×1440 的三三品牌竖版总结卡。

卡片只保留用户确认的标题、三条走法、各自的吸引点与代价，以及一句最终总结。时间线、评分、行动清单和“下一步”不会塞进图片。

## 适合怎样的问题

可以直接这样开始：

```text
帮我做一次职场奥德赛。我最近在纠结要不要离开现在的工作。
```

或者：

```text
我手上有两个 Offer，但我不只想比工资，想看看它们会把我带向怎样不同的工作生活。
```

普通简历修改、职位搜索、薪资查询和面试回答润色不需要启动这套完整流程。

## 安装

```bash
git clone https://github.com/zhongky1995/career-odyssey-simulator.git
mkdir -p ~/.codex/skills
cp -R career-odyssey-simulator ~/.codex/skills/career-odyssey-simulator
```

安装后可在 Codex 中直接提到“职场奥德赛”，或显式调用：

```text
$career-odyssey-simulator
```

## 生成总结卡

渲染器只使用 Node.js 自带模块。准备好符合 [卡片数据格式](references/output-contract.md) 的 JSON 后运行：

```bash
node scripts/render_odyssey_card.js \
  --input /absolute/path/to/odyssey-card.json \
  --output /absolute/path/to/odyssey-card.svg \
  --png /absolute/path/to/odyssey-card.png
```

PNG 转换依次尝试 macOS `sips`、ImageMagick 或 `rsvg-convert`。即使当前环境没有这些工具，SVG 仍会正常生成。

## 项目结构

```text
career-odyssey-simulator/
├── SKILL.md
├── assets/
│   ├── sansan-main-logo.svg
│   └── sample-card-preview.png
├── references/
│   ├── conversation-routing.md
│   ├── career-profile-schema.md
│   ├── route-and-simulation-rules.md
│   ├── output-contract.md
│   ├── brand-contract.md
│   ├── sample-card.json
│   └── sample-card.svg
└── scripts/
    └── render_odyssey_card.js
```

## 使用边界

- 这不是职业测评、岗位推荐或未来预测。
- 不因用户疲惫就推断其应该辞职或转行。
- 不把 AI 的猜测写成用户的稳定人格。
- 默认只使用当前对话的信息，不写入长期记忆。
- 分享卡不放公司、人名、精确薪资或未公开项目。
- 三三正式 Logo 不得拉伸、重画、变色或拆解。

完整规则见 [SKILL.md](SKILL.md)。

## 开源许可

代码和文档采用 [MIT License](LICENSE)。三三名称及 Logo 的使用还需遵守 [商标说明](TRADEMARKS.md)；MIT License 不授予任何暗示官方合作、认证或背书的商标权利。

