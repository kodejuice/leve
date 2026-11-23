import path from "path";
import { Resvg } from "@resvg/resvg-js";
import { site_details as details } from "../../site_config";

const FONT_FILES = [
  path.join(process.cwd(), "assets", "fonts", "og", "Newsreader-SemiBold.ttf"),
  path.join(process.cwd(), "assets", "fonts", "og", "Newsreader-Italic.ttf"),
  path.join(process.cwd(), "assets", "fonts", "og", "SourceSans3-Regular.ttf"),
  path.join(process.cwd(), "assets", "fonts", "FiraCode-Regular.ttf"),
];

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxCharsPerLine, maxLines) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return [];

  const words = clean.split(" ");
  const lines = [];
  let current = "";

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
      } else {
        lines.push(word.slice(0, maxCharsPerLine));
      }
      current = current ? word : "";

      if (lines.length === maxLines - 1) {
        const remaining = [current, ...words.slice(i + 1)]
          .filter(Boolean)
          .join(" ");
        if (remaining.length > maxCharsPerLine) {
          const cut = remaining.slice(0, maxCharsPerLine - 3);
          const lastSpace = cut.lastIndexOf(" ");
          const safeCut = lastSpace > 12 ? cut.slice(0, lastSpace) : cut;
          lines.push(`${safeCut.replace(/[,;:\-–]+$/, "").trim()}...`);
        } else if (remaining) {
          lines.push(remaining);
        }
        return lines;
      }
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

export function buildArticleOgSvg({
  title = details.name,
  topic = "ESSAY",
  excerpt = "",
  date = "",
  readTime = "",
}) {
  const cleanTitle = String(title || details.name).trim();
  const cleanTopic = String(topic || "ESSAY")
    .trim()
    .toUpperCase()
    .slice(0, 26);
  const cleanExcerpt = String(excerpt || "").trim();

  // Pick title scale based on length so short titles look bold and long titles fit cleanly
  const isLongTitle = cleanTitle.length > 48;
  const titleFontSize = isLongTitle ? 52 : 62;
  const titleLineHeight = isLongTitle ? 64 : 74;
  const titleLines = wrapText(
    cleanTitle,
    isLongTitle ? 34 : 27,
    isLongTitle ? 3 : 2
  );

  const excerptLines = cleanExcerpt ? wrapText(cleanExcerpt, 76, 2) : [];

  // Dynamic pill width for topic badge
  const pillWidth = Math.max(96, Math.round(cleanTopic.length * 10.6 + 38));
  const metaParts = [date, readTime]
    .map((s) =>
      String(s || "")
        .trim()
        .toUpperCase()
    )
    .filter(Boolean);
  const metaText = metaParts.join("  ·  ");

  // Compute vertical rhythm so title + rule + excerpt sit balanced between y=146 and y=504
  const blockHeight =
    titleLines.length * titleLineHeight +
    (excerptLines.length > 0 ? 34 + excerptLines.length * 34 : 18);
  const centerY = 325;
  const titleStartY = Math.round(
    centerY - blockHeight / 2 + titleFontSize * 0.78
  );
  const ruleY = titleStartY + (titleLines.length - 1) * titleLineHeight + 34;
  const excerptStartY = ruleY + 46;

  const titleSvg = titleLines
    .map(
      (line, idx) =>
        `<text x="0" y="${
          titleStartY + idx * titleLineHeight
        }" font-family="Newsreader" font-size="${titleFontSize}" font-weight="600" letter-spacing="-0.6" fill="#1c1a17">${escapeXml(
          line
        )}</text>`
    )
    .join("\n    ");

  const excerptSvg = excerptLines
    .map(
      (line, idx) =>
        `<text x="0" y="${
          excerptStartY + idx * 34
        }" font-family="Source Sans 3" font-size="24" font-weight="400" fill="#58534b">${escapeXml(
          line
        )}</text>`
    )
    .join("\n    ");

  const authorHandle = details?.handle?.twitter
    ? `@${details.handle.twitter}`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" fill="none">
  <defs>
    <linearGradient id="postBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fcfaf6"/>
      <stop offset="60%" stop-color="#faf7f2"/>
      <stop offset="100%" stop-color="#f2ece0"/>
    </linearGradient>
    <clipPath id="postFrameClip">
      <rect x="28" y="28" width="1144" height="574" rx="12"/>
    </clipPath>
  </defs>

  <!-- Base archival parchment canvas -->
  <rect width="1200" height="630" fill="url(#postBg)"/>

  <!-- Subtle drafting lines & terracotta spine clipped cleanly inside frame -->
  <g clip-path="url(#postFrameClip)">
    <g stroke="#9e472a" stroke-opacity="0.05" stroke-width="1">
      <line x1="88" y1="28" x2="88" y2="602"/>
      <line x1="1112" y1="28" x2="1112" y2="602"/>
      <line x1="28" y1="146" x2="1172" y2="146"/>
      <line x1="28" y1="504" x2="1172" y2="504"/>
    </g>

    <!-- Subtle scholarly section watermark -->
    <text x="1088" y="476" text-anchor="end" font-family="Newsreader" font-size="220" font-weight="600" fill="#9e472a" fill-opacity="0.045">&#167;</text>

    <!-- Terracotta book-spine edge -->
    <rect x="28" y="28" width="8" height="574" fill="#9e472a" fill-opacity="0.9"/>
  </g>

  <!-- Outer archival border -->
  <rect x="28" y="28" width="1144" height="574" rx="12" stroke="#dcd4c6" stroke-width="1.5"/>

  <!-- Top Row: Topic Pill + Date/Reading Time + SB Seal -->
  <g transform="translate(88, 72)">
    <rect x="0" y="6" width="${pillWidth}" height="34" rx="6" fill="#9e472a" fill-opacity="0.1" stroke="#9e472a" stroke-opacity="0.3" stroke-width="1"/>
    <text x="${
      pillWidth / 2
    }" y="28" text-anchor="middle" font-family="Fira Code" font-size="13" font-weight="400" letter-spacing="1.6" fill="#9e472a">${escapeXml(
    cleanTopic
  )}</text>

    ${
      metaText
        ? `<text x="${
            pillWidth + 22
          }" y="28" font-family="Fira Code" font-size="13" font-weight="400" letter-spacing="1.2" fill="#847d73">${escapeXml(
            metaText
          )}</text>`
        : ""
    }

    <!-- Compact SB Bookplate Seal (Top Right) -->
    <g transform="translate(972, -2)">
      <rect x="0" y="0" width="52" height="52" rx="7" fill="#1c1a17"/>
      <rect x="3.5" y="3.5" width="45" height="45" rx="4.5" stroke="#faf7f2" stroke-opacity="0.22" stroke-width="1"/>
      <text x="26" y="35" text-anchor="middle" font-family="Newsreader" font-size="24" font-weight="600" letter-spacing="1.2" fill="#faf7f2">SB</text>
    </g>
  </g>

  <!-- Main Dynamic Article Title + Excerpt -->
  <g transform="translate(88, 0)">
    ${titleSvg}
    <line x1="0" y1="${ruleY}" x2="96" y2="${ruleY}" stroke="#9e472a" stroke-width="3"/>
    ${excerptSvg}
  </g>

  <!-- Bottom Author Colophon Bar -->
  <g>
    <line x1="88" y1="504" x2="1112" y2="504" stroke="#dcd4c6" stroke-width="1"/>
    <text x="88" y="553" font-family="Newsreader" font-size="25" font-weight="600" fill="#1c1a17">${escapeXml(
      details.name
    )}</text>
    <text x="304" y="551" font-family="Fira Code" font-size="13" font-weight="400" letter-spacing="1.2" fill="#847d73">·  ESSAYS &amp; RESEARCH</text>
    <text x="1112" y="551" text-anchor="end" font-family="Fira Code" font-size="14" font-weight="400" letter-spacing="1" fill="#9e472a">${escapeXml(
      authorHandle
    )}</text>
  </g>
</svg>`;
}

export default function handler(req, res) {
  try {
    const {
      title = details.name,
      topic = "ESSAY",
      excerpt = "",
      date = "",
      readTime = "",
    } = req.query || {};

    const svg = buildArticleOgSvg({
      title: Array.isArray(title) ? title[0] : title,
      topic: Array.isArray(topic) ? topic[0] : topic,
      excerpt: Array.isArray(excerpt) ? excerpt[0] : excerpt,
      date: Array.isArray(date) ? date[0] : date,
      readTime: Array.isArray(readTime) ? readTime[0] : readTime,
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      font: {
        fontFiles: FONT_FILES,
        loadSystemFonts: false,
        defaultFontFamily: "Source Sans 3",
      },
    });

    const pngBuffer = resvg.render().asPng();

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Cache-Control",
      "public, immutable, no-transform, s-maxage=31536000, max-age=31536000"
    );
    res.status(200).send(pngBuffer);
  } catch (err) {
    res.redirect(302, "/og-image.png");
  }
}
