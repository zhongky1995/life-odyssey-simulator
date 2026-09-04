#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BRAND = {
  orangeRed: '#FF4E1F',
  hopeOrange: '#FF9800',
  coral: '#FF4057',
  ivory: '#FFF8F2',
  brown: '#2B140D',
};

const GENERIC_TITLES = new Set([
  '我的职场奥德赛',
  '三条可能的五年路线',
  '三条职业路线',
  '探索职业的无限可能',
  '遇见更好的自己',
  '勇敢开启人生新篇章',
  '重新定义我的职业可能',
  '看见职业的更多可能',
  '找到属于自己的答案',
  '写给未来的自己',
]);

function usage() {
  return 'Usage: node render_odyssey_card.js --input /absolute/card.json --output /absolute/card.svg [--png /absolute/card.png] [--logo /absolute/logo.svg]';
}

function parseArgs(argv) {
  const result = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--') || i + 1 >= argv.length) throw new Error(usage());
    result[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  if (!result.input || !result.output) throw new Error(usage());
  return result;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function compact(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function visibleLength(value) {
  return Array.from(compact(value)).length;
}

function wrap(text, maxChars, maxLines, label) {
  const chars = Array.from(compact(text));
  assert(chars.length > 0, `${label} is required`);
  const lines = [];
  for (let index = 0; index < chars.length; index += maxChars) {
    lines.push(chars.slice(index, index + maxChars).join(''));
  }
  assert(
    lines.length <= maxLines,
    `${label} is too long for the mobile card (${lines.length} lines; max ${maxLines}). Shorten the card copy, not the full written report.`,
  );
  return lines;
}

function wrapBalanced(text, maxChars, maxLines, label) {
  const chars = Array.from(compact(text));
  assert(chars.length > 0, `${label} is required`);
  const lineCount = Math.ceil(chars.length / maxChars);
  assert(
    lineCount <= maxLines,
    `${label} is too long for the mobile card (${lineCount} lines; max ${maxLines}). Shorten the card copy, not the full written report.`,
  );
  if (lineCount === 1) return [chars.join('')];

  const breakAfter = new Set(['，', '。', '；', '：', '！', '？', '、']);
  const breakBefore = new Set(['但', '也', '又', '还', '却', '并', '或']);
  const lines = [];
  let remaining = chars;

  for (let lineIndex = 0; lineIndex < lineCount - 1; lineIndex += 1) {
    const remainingLines = lineCount - lineIndex;
    const target = Math.ceil(remaining.length / remainingLines);
    const minBreak = Math.max(1, remaining.length - maxChars * (remainingLines - 1), Math.floor(target * 0.55));
    const maxBreak = Math.min(maxChars, remaining.length - (remainingLines - 1));
    let chosen = target;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let index = minBreak; index <= maxBreak; index += 1) {
      let score = Math.abs(index - target);
      if (breakAfter.has(remaining[index - 1])) score -= 10;
      if (breakBefore.has(remaining[index])) score -= 8;
      if (score < bestScore) {
        bestScore = score;
        chosen = index;
      }
    }

    lines.push(remaining.slice(0, chosen).join(''));
    remaining = remaining.slice(chosen);
  }
  lines.push(remaining.join(''));
  return lines;
}

function textBlock({ x, y, lines, size, lineHeight, weight = 500, fill = BRAND.brown, anchor = 'start', opacity = 1 }) {
  const textLines = lines.map((line, index) => (
    `<text x="${x}" y="${y + index * lineHeight}" text-anchor="${anchor}" font-family="PingFang SC,Noto Sans CJK SC,Microsoft YaHei,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" opacity="${opacity}">${escapeXml(line)}</text>`
  ));
  return `<g>${textLines.join('')}</g>`;
}

function routeCard(route, index) {
  const colors = [BRAND.orangeRed, BRAND.hopeOrange, BRAND.coral];
  const pale = ['#FFF0EA', '#FFF3DE', '#FFECEF'];
  const y = 432 + index * 198;
  const nameLines = wrap(route.name, 13, 1, `routes[${index}].name`);
  const summaryLines = wrap(route.summary, 24, 2, `routes[${index}].summary`);

  return `
  <g>
    <rect x="58" y="${y}" width="964" height="176" rx="28" fill="#FFFFFF"/>
    <rect x="58" y="${y}" width="10" height="176" rx="5" fill="${colors[index]}"/>
    <circle cx="108" cy="${y + 49}" r="25" fill="${pale[index]}"/>
    ${textBlock({ x: 108, y: y + 57, lines: [`0${index + 1}`], size: 19, lineHeight: 24, weight: 750, fill: colors[index], anchor: 'middle' })}
    ${textBlock({ x: 151, y: y + 49, lines: nameLines, size: 30, lineHeight: 36, weight: 750 })}
    ${textBlock({ x: 151, y: y + 86, lines: summaryLines, size: 23, lineHeight: 30, weight: 500, fill: BRAND.brown, opacity: 0.68 })}

    <rect x="151" y="${y + 122}" width="392" height="38" rx="19" fill="${pale[index]}"/>
    ${textBlock({ x: 170, y: y + 148, lines: [`我想要｜${compact(route.gain)}`], size: 18, lineHeight: 22, weight: 650, fill: colors[index] })}
    <rect x="559" y="${y + 122}" width="435" height="38" rx="19" fill="#F7F2EE"/>
    ${textBlock({ x: 578, y: y + 148, lines: [`要承担｜${compact(route.cost)}`], size: 18, lineHeight: 22, weight: 600, fill: BRAND.brown, opacity: 0.72 })}
  </g>`;
}

function validate(data) {
  data.title = compact(data.title);
  assert(data.title, 'title is required');
  assert(!GENERIC_TITLES.has(data.title), `Generic title is not allowed: ${data.title}`);
  assert(['confirmed', 'corrected_confirmed'].includes(data.title_status), 'title_status must be confirmed or corrected_confirmed');
  assert(data.share_safe === true, 'share_safe must be true before rendering');
  wrapBalanced(data.title, 14, 2, 'title');

  assert(Array.isArray(data.routes) && data.routes.length === 3, 'routes must contain exactly three routes');
  data.routes.forEach((route, index) => {
    ['name', 'summary', 'gain', 'cost'].forEach((key) => {
      assert(compact(route[key]), `routes[${index}].${key} is required`);
    });
    wrap(route.name, 13, 1, `routes[${index}].name`);
    wrap(route.summary, 24, 2, `routes[${index}].summary`);
    assert(visibleLength(route.gain) <= 16, `routes[${index}].gain is too long; max 16 visible characters`);
    assert(visibleLength(route.cost) <= 18, `routes[${index}].cost is too long; max 18 visible characters`);
  });

  assert(compact(data.insight), 'insight is required');
  wrapBalanced(data.insight, 21, 3, 'insight');
}

function renderPng(svgPath, pngPath) {
  fs.mkdirSync(path.dirname(pngPath), { recursive: true });
  const attempts = [
    ['sips', ['-s', 'format', 'png', svgPath, '--out', pngPath]],
    ['magick', [svgPath, pngPath]],
    ['rsvg-convert', ['-o', pngPath, svgPath]],
  ];

  for (const [command, args] of attempts) {
    const result = spawnSync(command, args, { encoding: 'utf8' });
    if (result.status === 0 && fs.existsSync(pngPath)) return;
  }
  throw new Error('SVG was created, but PNG conversion is unavailable. Install sips, ImageMagick, or rsvg-convert.');
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);
  const pngPath = args.png ? path.resolve(args.png) : null;
  const logoPath = path.resolve(args.logo || path.join(__dirname, '..', 'assets', 'sansan-main-logo.svg'));
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  validate(data);

  const logo = fs.readFileSync(logoPath);
  const logoHref = `data:image/svg+xml;base64,${logo.toString('base64')}`;
  const titleLines = wrapBalanced(data.title, 14, 2, 'title');
  const insightLines = wrapBalanced(data.insight, 21, 3, 'insight');
  const eyebrow = compact(data.eyebrow || '职场奥德赛');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440" role="img" aria-label="${escapeXml(data.title)}">
  <rect width="1080" height="1440" fill="${BRAND.ivory}"/>
  <circle cx="1012" cy="110" r="178" fill="${BRAND.hopeOrange}" opacity="0.055"/>
  <circle cx="1000" cy="1316" r="245" fill="${BRAND.coral}" opacity="0.04"/>

  <image href="${logoHref}" x="58" y="43" width="190" height="77" preserveAspectRatio="xMinYMid meet"/>
  ${textBlock({ x: 278, y: 99, lines: [eyebrow], size: 21, lineHeight: 26, weight: 700, fill: BRAND.orangeRed })}

  ${textBlock({ x: 58, y: 205, lines: titleLines, size: 56, lineHeight: 72, weight: 760 })}
  <line x1="58" y1="365" x2="1022" y2="365" stroke="${BRAND.brown}" stroke-opacity="0.12"/>
  ${textBlock({ x: 58, y: 407, lines: ['三种走法'], size: 20, lineHeight: 26, weight: 700, fill: BRAND.brown, opacity: 0.5 })}

  ${data.routes.map(routeCard).join('\n')}

  <rect x="58" y="1048" width="964" height="276" rx="34" fill="${BRAND.brown}"/>
  ${textBlock({ x: 92, y: 1098, lines: ['不管走哪条，我都在意'], size: 20, lineHeight: 26, weight: 700, fill: BRAND.hopeOrange })}
  ${textBlock({ x: 92, y: 1172, lines: insightLines, size: 34, lineHeight: 50, weight: 650, fill: BRAND.ivory })}

  </svg>`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, svg, 'utf8');
  if (pngPath) renderPng(outputPath, pngPath);

  process.stdout.write(`${outputPath}\n`);
  if (pngPath) process.stdout.write(`${pngPath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`Card rendering failed: ${error.message}\n`);
  process.exitCode = 1;
}
