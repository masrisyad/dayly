/**
 * Draws a shareable planner image on a canvas, in the app's "daily task" theme.
 * Content is plain data (see share/content.ts), so this file only knows about layout.
 */
import { asset, type AssetName } from './assets';

export type ShareFormat = 'story' | 'post';
export const FORMAT_SIZE: Record<ShareFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 }, // 9:16 — WhatsApp Status, Instagram Story, TikTok
  post: { w: 1080, h: 1350 }, // 4:5 — chats and feeds
};

export type Tone = 'pink' | 'lavender' | 'mint' | 'yellow' | 'blue';

export type ShareLine =
  | { kind: 'task'; text: string; done: boolean }
  | { kind: 'numbered'; n: number; text: string; done: boolean }
  | { kind: 'timed'; time: string; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'muted'; text: string };

export interface ShareSection {
  title: string;
  tone: Tone;
  icon?: AssetName;
  highlight?: boolean; // today's card
  lines?: ShareLine[];
  water?: { value: number; total: number };
  paragraph?: string;
}

export interface ShareContent {
  owner: { name: string; avatar?: string };
  ownerLabel: string; // e.g. "Planner Maya"
  title: { text: string; color: 'pink' | 'lavender' }[];
  subtitle: string;
  progress?: { percent: number; label: string };
  sections: ShareSection[];
  moreLabel: (n: number) => string; // "+3 more"
  footer: string; // "Dayly · masrisyad.github.io/dayly"
}

/* ---------- theme ---------- */

const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.2 0 3.6 1.3 4.4 2.6.8-1.3 2.2-2.6 4.4-2.6 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z';
const DISPLAY = 'Fredoka, Nunito, sans-serif';
const BODY = 'Nunito, sans-serif';

function theme() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    bg: v('--bg', '#f3e9dc'),
    paper: v('--paper', '#fbf5ec'),
    card: v('--card', '#fdf9f3'),
    border: v('--card-border', '#efe2d3'),
    line: v('--line', '#e3d2c2'),
    ink: v('--ink', '#5e4b47'),
    soft: v('--ink-soft', '#9a8580'),
    pinkDeep: v('--pink-deep', '#e5879b'),
    lavenderDeep: v('--lavender-deep', '#9c86d3'),
    green: v('--green-deep', '#78a656'),
    yellow: v('--yellow', '#f8e7a3'),
    highlight: '#f3f9ea',
    tones: {
      pink: v('--pink', '#f4b3c0'),
      lavender: v('--lavender', '#c9bbec'),
      mint: v('--mint', '#d3e5b6'),
      yellow: v('--yellow', '#f8e7a3'),
      blue: v('--blue', '#c3dcf2'),
    } as Record<Tone, string>,
  };
}
type Theme = ReturnType<typeof theme>;

/* ---------- small drawing helpers ---------- */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string, stroke: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  const p = new Path2D(HEART);
  ctx.fillStyle = fill;
  ctx.fill(p);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = stroke;
  ctx.stroke(p);
  ctx.restore();
}

function check(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.beginPath();
  ctx.moveTo(8, 12.2);
  ctx.lineTo(10.6, 14.8);
  ctx.lineTo(16, 9.6);
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.restore();
}

/** Cuts text to fit maxWidth, adding an ellipsis. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(text.slice(0, mid) + '…').width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo).trimEnd() + '…';
}

/** Word-wraps text into at most maxLines lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth) line = next;
      else {
        if (line) out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  const lines = out.filter((l, i) => l || i < out.length - 1);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = fit(ctx, `${kept[maxLines - 1]}…`, maxWidth);
    return kept;
  }
  return lines;
}

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
function loadImage(src: string): Promise<HTMLImageElement | null> {
  let p = imageCache.get(src);
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // a missing picture shouldn't block sharing
      img.src = src;
    });
    imageCache.set(src, p);
  }
  return p;
}

function drawContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, size: number, alpha = 1) {
  if (!img) return;
  const r = Math.min(size / img.naturalWidth, size / img.naturalHeight);
  const w = img.naturalWidth * r;
  const h = img.naturalHeight * r;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, x + (size - w) / 2, y + (size - h) / 2, w, h);
  ctx.restore();
}

/* ---------- section layout ---------- */

interface Metrics {
  s: number; // scale
  font: number;
  lineH: number;
  pad: number;
  labelH: number;
  glass: number;
}

const metrics = (s: number, colW: number): Metrics => ({
  s,
  font: 31 * s,
  lineH: 50 * s,
  pad: 26 * s,
  labelH: 54 * s,
  glass: Math.min(54 * s, (colW - 2 * 26 * s) / 8 - 4),
});

const PARAGRAPH_LINES = 6;

const WRAP_LINES = 2; // a long task wraps once, then gets an ellipsis
const extraRow = (m: Metrics) => m.lineH * 0.7;

/** Space before the text: heart, time or bullet. */
function lineIndent(line: ShareLine, m: Metrics): number {
  if (line.kind === 'task' || line.kind === 'numbered') return 48 * m.s;
  if (line.kind === 'timed') return 104 * m.s;
  if (line.kind === 'bullet') return 30 * m.s;
  return 0;
}

function lineRows(ctx: CanvasRenderingContext2D, line: ShareLine, inner: number, m: Metrics): string[] {
  ctx.font = `600 ${m.font}px ${BODY}`;
  return wrap(ctx, line.text, inner - lineIndent(line, m), WRAP_LINES);
}

const rowsHeight = (rows: number, m: Metrics) => m.lineH + (rows - 1) * extraRow(m);

function sectionHeight(ctx: CanvasRenderingContext2D, sec: ShareSection, colW: number, m: Metrics): number {
  const inner = colW - 2 * m.pad;
  let body = 0;
  if (sec.water) body = m.glass * 1.15 + 34 * m.s;
  else if (sec.paragraph !== undefined) {
    ctx.font = `600 ${m.font}px ${BODY}`;
    body = wrap(ctx, sec.paragraph, inner, PARAGRAPH_LINES).length * m.lineH;
  } else body = (sec.lines ?? []).reduce((sum, line) => sum + rowsHeight(lineRows(ctx, line, inner, m).length, m), 0);
  return m.labelH + m.pad * 0.5 + body + m.pad;
}

function drawSection(
  ctx: CanvasRenderingContext2D,
  th: Theme,
  sec: ShareSection,
  x: number,
  y: number,
  w: number,
  rowH: number, // cards in one row share a height
  m: Metrics,
  glassImg: HTMLImageElement | null,
  icons: Map<AssetName, HTMLImageElement | null>,
) {
  const h = Math.max(rowH, sectionHeight(ctx, sec, w, m));
  const top = y + m.labelH / 2;

  // card
  ctx.save();
  ctx.shadowColor = 'rgba(150, 110, 90, 0.14)';
  ctx.shadowBlur = 18 * m.s;
  ctx.shadowOffsetY = 6 * m.s;
  roundRect(ctx, x, top, w, h - m.labelH / 2, 30 * m.s);
  ctx.fillStyle = sec.highlight ? th.highlight : th.card;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, x, top, w, h - m.labelH / 2, 30 * m.s);
  ctx.lineWidth = (sec.highlight ? 4 : 2) * m.s;
  ctx.strokeStyle = sec.highlight ? '#9cc27a' : th.border;
  ctx.stroke();

  // label pill
  ctx.font = `500 ${30 * m.s}px ${DISPLAY}`;
  const iconSize = sec.icon ? 34 * m.s : 0;
  const labelText = fit(ctx, sec.title, w - 2 * m.pad - 40 * m.s - iconSize);
  const labelW = ctx.measureText(labelText).width + 40 * m.s + (iconSize ? iconSize + 8 * m.s : 0);
  ctx.save();
  ctx.shadowColor = 'rgba(150, 110, 90, 0.18)';
  ctx.shadowBlur = 8 * m.s;
  ctx.shadowOffsetY = 3 * m.s;
  roundRect(ctx, x + m.pad, y, labelW, m.labelH, 18 * m.s);
  ctx.fillStyle = th.tones[sec.tone];
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = th.ink;
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, x + m.pad + 20 * m.s, y + m.labelH / 2 + 1);
  if (sec.icon) drawContain(ctx, icons.get(sec.icon) ?? null, x + m.pad + labelW - 20 * m.s - iconSize, y + (m.labelH - iconSize) / 2, iconSize);

  // body
  let cy = y + m.labelH + m.pad * 0.5;
  const left = x + m.pad;
  const inner = w - 2 * m.pad;
  ctx.font = `600 ${m.font}px ${BODY}`;
  ctx.textBaseline = 'middle';

  if (sec.water) {
    const gap = (inner - 8 * m.glass) / 7;
    for (let i = 0; i < sec.water.total; i++) {
      drawContain(ctx, glassImg, left + i * (m.glass + gap), cy, m.glass, i < sec.water.value ? 1 : 0.28);
    }
    ctx.fillStyle = th.soft;
    ctx.font = `700 ${24 * m.s}px ${BODY}`;
    ctx.fillText(`${sec.water.value} / ${sec.water.total}`, left, cy + m.glass * 1.15 + 14 * m.s);
    return h;
  }

  if (sec.paragraph !== undefined) {
    ctx.fillStyle = th.ink;
    for (const l of wrap(ctx, sec.paragraph, inner, PARAGRAPH_LINES)) {
      ctx.fillText(l, left, cy + m.lineH / 2);
      cy += m.lineH;
    }
    return h;
  }

  for (const line of sec.lines ?? []) {
    const rows = lineRows(ctx, line, inner, m);
    const mid = cy + m.lineH / 2;
    let textX = left;
    let color = th.ink;
    let strike = false;
    if (line.kind === 'task' || line.kind === 'numbered') {
      const size = 34 * m.s;
      if (line.kind === 'numbered') {
        heart(ctx, left, mid - size / 2, size, th.tones.pink, th.pinkDeep);
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = `600 ${18 * m.s}px ${DISPLAY}`;
        ctx.textAlign = 'center';
        ctx.fillText(String(line.n), left + size / 2, mid - 1 * m.s);
        ctx.restore();
      } else {
        heart(ctx, left, mid - size / 2, size, line.done ? th.pinkDeep : '#fffdf9', line.done ? '#d97489' : '#e2aab5');
        if (line.done) check(ctx, left, mid - size / 2, size);
      }
      textX = left + size + 14 * m.s;
      if (line.done) {
        color = th.soft;
        strike = true;
      }
    } else if (line.kind === 'timed') {
      ctx.fillStyle = th.ink;
      ctx.font = `700 ${m.font * 0.9}px ${BODY}`;
      ctx.fillText(line.time, left, mid);
      ctx.font = `600 ${m.font}px ${BODY}`;
      textX = left + 104 * m.s;
    } else if (line.kind === 'bullet') {
      ctx.beginPath();
      ctx.arc(left + 8 * m.s, mid, 7 * m.s, 0, Math.PI * 2);
      ctx.fillStyle = th.tones.pink;
      ctx.fill();
      textX = left + 30 * m.s;
    } else {
      color = th.soft;
    }
    ctx.font = `600 ${m.font}px ${BODY}`;
    ctx.fillStyle = color;
    rows.forEach((row, i) => {
      const rowMid = mid + i * extraRow(m);
      ctx.fillText(row, textX, rowMid);
      if (strike) ctx.fillRect(textX, rowMid, ctx.measureText(row).width, 2 * m.s);
    });
    const lineBottom = cy + rowsHeight(rows.length, m);
    // dashed rule, like the paper planner
    ctx.save();
    ctx.setLineDash([8 * m.s, 7 * m.s]);
    ctx.strokeStyle = th.line;
    ctx.lineWidth = 2 * m.s;
    ctx.beginPath();
    ctx.moveTo(left, lineBottom);
    ctx.lineTo(left + inner, lineBottom);
    ctx.stroke();
    ctx.restore();
    cy = lineBottom;
  }
  return h;
}

/** Lays sections out row by row (reading order: Mon | Tue, Wed | Thu, …); a row is as tall as its tallest card. */
function placeGrid(heights: number[], gap: number, cols: number) {
  const cells: { col: number; y: number; rowH: number }[] = [];
  let y = 0;
  for (let i = 0; i < heights.length; i += cols) {
    const rowH = Math.max(...heights.slice(i, i + cols));
    heights.slice(i, i + cols).forEach((_, col) => cells.push({ col, y, rowH }));
    y += rowH + gap;
  }
  return { cells, total: Math.max(0, y - gap) };
}

/** Caps each list so a section never runs away; the rest becomes "+N more". */
function capLines(sections: ShareSection[], max: number, moreLabel: (n: number) => string): ShareSection[] {
  return sections.map((sec) => {
    if (!sec.lines || sec.lines.length <= max) return sec;
    return { ...sec, lines: [...sec.lines.slice(0, max - 1), { kind: 'muted', text: moreLabel(sec.lines.length - (max - 1)) }] };
  });
}

/* ---------- main ---------- */

export async function renderShareImage(content: ShareContent, format: ShareFormat): Promise<Blob> {
  const { w: W, h: H } = FORMAT_SIZE[format];
  const th = theme();
  await Promise.all([
    document.fonts.load(`700 64px Fredoka`),
    document.fonts.load(`500 30px Fredoka`),
    document.fonts.load(`600 18px Fredoka`),
    document.fonts.load(`600 30px Nunito`),
    document.fonts.load(`700 30px Nunito`),
  ]).catch(() => undefined);

  const iconNames = [...new Set(content.sections.map((s) => s.icon).filter((n): n is AssetName => !!n))];
  const [plant, flower, tulip, star, bear, glassImg, heartImg, avatar, ...iconImgs] = await Promise.all([
    loadImage(asset('plant')),
    loadImage(asset('purple-flower')),
    loadImage(asset('tulip')),
    loadImage(asset('star')),
    loadImage(asset('bear')),
    loadImage(asset('glass')),
    loadImage(asset('heart')),
    loadImage(content.owner.avatar ?? asset('bear')),
    ...iconNames.map((n) => loadImage(asset(n))),
  ]);
  const icons = new Map(iconNames.map((n, i) => [n, iconImgs[i]]));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.textBaseline = 'middle';

  // background + paper sheet
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, 0, W, H);
  const sheet = 34;
  ctx.save();
  ctx.shadowColor = 'rgba(150, 110, 90, 0.16)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, sheet, sheet, W - 2 * sheet, H - 2 * sheet, 56);
  ctx.fillStyle = th.paper;
  ctx.fill();
  ctx.restore();

  const isStory = format === 'story';
  let y = isStory ? 96 : 70;

  // decorations
  drawContain(ctx, plant, 58, y - 30, isStory ? 150 : 120);
  drawContain(ctx, flower, W - 150, y - 20, 84);
  drawContain(ctx, star, W - 220, y + 70, 46);

  // owner row: avatar + "Planner Maya"
  const avatarSize = isStory ? 78 : 64;
  ctx.font = `700 ${isStory ? 32 : 28}px ${BODY}`;
  const ownerText = fit(ctx, content.ownerLabel, 520);
  const ownerW = avatarSize + 16 + ctx.measureText(ownerText).width;
  const ox = (W - ownerW) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(ox + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = th.tones.pink;
  ctx.fill();
  ctx.clip();
  if (avatar) {
    if (content.owner.avatar) ctx.drawImage(avatar, ox, y, avatarSize, avatarSize);
    else drawContain(ctx, avatar, ox + avatarSize * 0.1, y + avatarSize * 0.1, avatarSize * 0.8);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(ox + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#fffdf9';
  ctx.stroke();
  ctx.fillStyle = th.ink;
  ctx.fillText(ownerText, ox + avatarSize + 16, y + avatarSize / 2);
  y += avatarSize + (isStory ? 40 : 26);

  // title, bubble style
  const titleSize = isStory ? 104 : 88;
  ctx.font = `700 ${titleSize}px ${DISPLAY}`;
  const parts = content.title;
  const gap = 22;
  const titleW = parts.reduce((sum, p) => sum + ctx.measureText(p.text).width, 0) + gap * (parts.length - 1);
  let tx = (W - Math.min(titleW, W - 160)) / 2;
  const tScale = Math.min(1, (W - 160) / titleW);
  for (const p of parts) {
    const deep = p.color === 'pink' ? th.pinkDeep : th.lavenderDeep;
    const shade = p.color === 'pink' ? '#d97489' : '#8670c2';
    ctx.save();
    ctx.translate(tx, y + titleSize / 2);
    ctx.scale(tScale, tScale);
    ctx.fillStyle = shade;
    ctx.fillText(p.text, 0, 5);
    ctx.fillStyle = deep;
    ctx.fillText(p.text, 0, 0);
    ctx.restore();
    tx += (ctx.measureText(p.text).width + gap) * tScale;
  }
  y += titleSize + (isStory ? 26 : 18);

  // subtitle pill
  ctx.font = `700 ${isStory ? 34 : 30}px ${BODY}`;
  const sub = fit(ctx, content.subtitle, W - 240);
  const subW = ctx.measureText(sub).width + 56;
  const subH = isStory ? 64 : 56;
  roundRect(ctx, (W - subW) / 2, y, subW, subH, 18);
  ctx.fillStyle = th.yellow;
  ctx.fill();
  ctx.fillStyle = th.ink;
  ctx.textAlign = 'center';
  ctx.fillText(sub, W / 2, y + subH / 2 + 1);
  ctx.textAlign = 'left';
  y += subH + (isStory ? 30 : 22);

  // progress bar
  if (content.progress) {
    const pw = W - 2 * 120;
    const ph = isStory ? 46 : 40;
    const px = 120;
    roundRect(ctx, px, y, pw, ph, ph / 2);
    ctx.fillStyle = '#e8efd9';
    ctx.fill();
    const fill = content.progress.percent ? Math.max(content.progress.percent / 100, 0.06) * pw : 0;
    if (fill) {
      roundRect(ctx, px, y, fill, ph, ph / 2);
      const grad = ctx.createLinearGradient(0, y, 0, y + ph);
      grad.addColorStop(0, '#b4d78f');
      grad.addColorStop(1, th.green);
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.fillStyle = th.ink;
    ctx.font = `700 ${isStory ? 26 : 24}px ${BODY}`;
    ctx.textAlign = 'center';
    ctx.fillText(content.progress.label, W / 2, y + ph / 2 + 1);
    ctx.textAlign = 'left';
    y += ph + (isStory ? 44 : 34);
  }

  // footer
  const footerY = H - sheet - (isStory ? 74 : 60);
  drawContain(ctx, tulip, W - 190, footerY - 150, 140);
  drawContain(ctx, bear, 64, footerY - 96, 110);
  ctx.font = `700 ${isStory ? 28 : 24}px ${BODY}`;
  const fw = ctx.measureText(content.footer).width;
  const heartSize = isStory ? 30 : 26;
  const fx = (W - fw - heartSize - 10) / 2;
  drawContain(ctx, heartImg, fx, footerY - heartSize / 2, heartSize);
  ctx.fillStyle = th.soft;
  ctx.fillText(content.footer, fx + heartSize + 10, footerY + 1);

  // Sections go in one full-width column when they fit (long text stays readable), otherwise two
  // columns; within that, the largest scale that fits above the footer, so a light day fills the
  // picture and a busy one still fits.
  const bodyTop = y;
  const bodyBottom = footerY - (isStory ? 120 : 96);
  const padX = 72;
  const colGap = 26;
  const sections = capLines(content.sections, isStory ? 8 : 6, content.moreLabel);
  const layoutAt = (cols: number, s: number) => {
    const colW = (W - 2 * padX - colGap * (cols - 1)) / cols;
    const m = metrics(s, colW);
    return { colW, m, ...placeGrid(sections.map((sec) => sectionHeight(ctx, sec, colW, m)), 30 * s, cols) };
  };
  // Prefer normal-size text: one column at full size, then two columns at full size, then shrink.
  const at = (cols: number, scales: number[]) => scales.map((s): [number, number] => [cols, s]);
  const ATTEMPTS: [number, number][] = [
    ...at(1, [1.25, 1.15, 1.05, 1]),
    ...at(2, [1.25, 1.15, 1.05, 1]),
    ...at(1, [0.94]),
    ...at(2, [0.94, 0.88, 0.82, 0.76, 0.7, 0.64, 0.58, 0.52]),
  ];
  let layout = layoutAt(2, 0.52);
  for (const [cols, s] of ATTEMPTS) {
    const attempt = layoutAt(cols, s);
    if (attempt.total <= bodyBottom - bodyTop) {
      layout = attempt;
      break;
    }
  }
  const { colW, m, cells, total } = layout;
  const offsetY = Math.max(0, (bodyBottom - bodyTop - total) / 2); // centre what's left between header and footer
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, bodyTop - 4, W, bodyBottom - bodyTop + 8);
  ctx.clip();
  sections.forEach((sec, i) => {
    const c = cells[i];
    drawSection(ctx, th, sec, padX + c.col * (colW + colGap), bodyTop + offsetY + c.y, colW, c.rowH, m, glassImg, icons);
  });
  ctx.restore();

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'),
  );
}
