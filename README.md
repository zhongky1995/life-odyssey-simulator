# 人生奥德赛模拟器

一个陪用户试走三种五年生活的 Codex Skill。它不会给出“理想人生答案”，而是从眼前的一件难题开始，把真正相关的生活方面放在一起看，再通过几次具体选择，比较每种生活的日常、吸引力和代价。

![手机竖版总结卡示例](assets/sample-card-preview.png)

## 它能做什么

- 从换城市、换工作、休息一段时间、照顾家人、留学、退休、副业或创业等现实问题开始。
- 只了解这次问题会牵动的生活方面，不把工作、关系、健康、金钱和成长做成一张长问卷。
- 写出三种确实不同、也都与用户经历和现实条件有关的生活版本。
- 把每种生活推进到 6～12 个月、第三年和第五年的普通星期，让用户亲自做选择。
- 整理完整文字结果，并生成一张 1080×1440 的三三品牌竖版总结卡。

卡片只保留用户确认的标题、三种生活、各自想要的部分与需要承担的代价，以及一句最终总结。时间线、评分、行动清单和“下一步”不会塞进图片。

## 适合怎样的问题

可以直接这样开始：

```text
帮我做一次人生奥德赛。我想换个城市生活，但又舍不得现在的关系和积累。
```

或者：

```text
我想休息半年。不要只帮我分析该不该辞职，我想看看几种不同的生活会怎样展开。
```

普通简历修改、职位搜索、旅行攻略、投资产品、疾病治疗、法律处置或关系判责不需要启动这套完整流程。

## 安装

```bash
git clone https://github.com/zhongky1995/life-odyssey-simulator.git
mkdir -p ~/.codex/skills
cp -R life-odyssey-simulator ~/.codex/skills/life-odyssey-simulator
```

安装后可在 Codex 中直接提到“人生奥德赛”，或显式调用：

```text
$life-odyssey-simulator
```

## 生成总结卡

渲染器只使用 Node.js 自带模块。准备好符合 [卡片数据格式](references/output-contract.md) 的 JSON 后运行：

```bash
node scripts/render_odyssey_card.js \
  --input /absolute/path/to/odyssey-card.json \
  --output /absolute/path/to/odyssey-card.svg \
  --png /absolute/path/to/odyssey-card.png
```

PNG 转换依次尝试 macOS `sips`、ImageMagick 或 `rsvg-convert`。即使当前环境没有这些工具，SVG 仍会先生成。

## 项目结构

```text
life-odyssey-simulator/
├── SKILL.md
├── assets/
│   ├── sansan-main-logo.svg
│   └── sample-card-preview.png
├── references/
│   ├── conversation-routing.md
│   ├── life-context-schema.md
│   ├── life-version-and-simulation-rules.md
│   ├── output-contract.md
│   ├── brand-contract.md
│   ├── sample-card.json
│   └── sample-card.svg
└── scripts/
    └── render_odyssey_card.js
```

## 使用边界

- 这不是人生测评、心理诊断或未来预测。
- 不替用户决定离职、搬家、分手、结婚、生育、停药、投资或负债。
- 只展开当前问题真正会影响的生活方面，不替用户规定什么才算完整人生。
- 不把 AI 的猜测写成用户的稳定人格或命运。
- 默认只使用当前对话的信息，不写入长期记忆。
- 分享卡不放公司、人名、住址、精确资产、疾病或关系隐私。
- 三三正式 Logo 不得拉伸、重画、变色或拆解。

完整规则见 [SKILL.md](SKILL.md)。

## 开源许可

代码和文档采用 [MIT License](LICENSE)。三三名称及 Logo 的使用还需遵守 [商标说明](TRADEMARKS.md)；MIT License 不授予任何暗示官方合作、认证或背书的商标权利。
