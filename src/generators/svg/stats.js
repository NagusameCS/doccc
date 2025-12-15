/**
 * Stats SVG Generator
 * 
 * Creates badges and charts for code statistics
 */

import { getLanguageColor, formatLineCount } from '../../integrations/linehook.js';

/**
 * Generate stat badges
 */
export async function generateStatsBadges(stats, options = {}) {
    const { style = 'flat', theme = 'auto' } = options;
    const badges = {};

    // Total lines badge
    badges['lines-of-code'] = generateBadge({
        label: 'Lines of Code',
        message: formatLineCount(stats.totalLines),
        color: '007ec6',
        style,
    });

    // Files badge
    badges['total-files'] = generateBadge({
        label: 'Files',
        message: stats.totalFiles.toString(),
        color: '28a745',
        style,
    });

    // Top language badge
    const topLang = Object.entries(stats.languages || {})
        .sort((a, b) => b[1].lines - a[1].lines)[0];

    if (topLang) {
        const color = getLanguageColor(topLang[0]).replace('#', '');
        badges['top-language'] = generateBadge({
            label: 'Top Language',
            message: topLang[0],
            color,
            style,
        });
    }

    // Code vs comments badge
    const codePercent = ((stats.codeLines / stats.totalLines) * 100).toFixed(0);
    badges['code-ratio'] = generateBadge({
        label: 'Code',
        message: `${codePercent}%`,
        color: '6f42c1',
        style,
    });

    return badges;
}

/**
 * Generate stats chart SVG
 */
export async function generateStatsChart(stats, options = {}) {
    const { type = 'languages', width = 400, height = 200, theme = 'auto' } = options;

    switch (type) {
        case 'languages':
            return generateLanguageChart(stats, width, height, theme);
        case 'pie':
            return generatePieChart(stats, width, height, theme);
        case 'bar':
            return generateBarChart(stats, width, height, theme);
        default:
            return generateLanguageChart(stats, width, height, theme);
    }
}

/**
 * Generate language breakdown chart
 */
function generateLanguageChart(stats, width, height, theme) {
    const languages = Object.entries(stats.languages || {})
        .sort((a, b) => b[1].lines - a[1].lines)
        .slice(0, 8);

    if (languages.length === 0) {
        return generateEmptyChart(width, height);
    }

    const total = languages.reduce((sum, [, data]) => sum + data.lines, 0);
    const barHeight = 24;
    const padding = 20;
    const chartHeight = languages.length * (barHeight + 8) + padding * 2;

    const isDark = theme === 'dark';
    const textColor = isDark ? '#c9d1d9' : '#24292e';
    const bgColor = isDark ? '#0d1117' : '#ffffff';
    const barBg = isDark ? '#21262d' : '#f6f8fa';

    const bars = languages.map(([lang, data], i) => {
        const percent = (data.lines / total) * 100;
        const barWidth = (percent / 100) * (width - 150);
        const y = padding + i * (barHeight + 8);
        const color = getLanguageColor(lang);

        return `
      <!-- ${lang} -->
      <rect x="100" y="${y}" width="${width - 150}" height="${barHeight}" fill="${barBg}" rx="4"/>
      <rect x="100" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4"/>
      <text x="95" y="${y + barHeight / 2 + 5}" text-anchor="end" fill="${textColor}" font-size="12">${lang}</text>
      <text x="${width - 10}" y="${y + barHeight / 2 + 5}" text-anchor="end" fill="${textColor}" font-size="11">${percent.toFixed(1)}%</text>
    `;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${chartHeight}" width="${width}" height="${chartHeight}">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  </style>
  <rect width="100%" height="100%" fill="${bgColor}" rx="8"/>
  ${bars}
</svg>`;
}

/**
 * Generate pie chart
 */
function generatePieChart(stats, width, height, theme) {
    const languages = Object.entries(stats.languages || {})
        .sort((a, b) => b[1].lines - a[1].lines)
        .slice(0, 6);

    if (languages.length === 0) {
        return generateEmptyChart(width, height);
    }

    const total = languages.reduce((sum, [, data]) => sum + data.lines, 0);
    const cx = width / 3;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 20;

    let startAngle = 0;
    const slices = languages.map(([lang, data]) => {
        const percent = data.lines / total;
        const angle = percent * 360;
        const endAngle = startAngle + angle;

        const x1 = cx + radius * Math.cos((startAngle - 90) * Math.PI / 180);
        const y1 = cy + radius * Math.sin((startAngle - 90) * Math.PI / 180);
        const x2 = cx + radius * Math.cos((endAngle - 90) * Math.PI / 180);
        const y2 = cy + radius * Math.sin((endAngle - 90) * Math.PI / 180);

        const largeArc = angle > 180 ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        startAngle = endAngle;

        return { lang, path, color: getLanguageColor(lang), percent };
    });

    const isDark = theme === 'dark';
    const textColor = isDark ? '#c9d1d9' : '#24292e';
    const bgColor = isDark ? '#0d1117' : '#ffffff';

    const paths = slices.map(s =>
        `<path d="${s.path}" fill="${s.color}" stroke="${bgColor}" stroke-width="2"/>`
    ).join('');

    const legend = slices.map((s, i) => `
    <rect x="${width * 0.65}" y="${20 + i * 24}" width="12" height="12" fill="${s.color}" rx="2"/>
    <text x="${width * 0.65 + 18}" y="${20 + i * 24 + 10}" fill="${textColor}" font-size="12">${s.lang} (${(s.percent * 100).toFixed(1)}%)</text>
  `).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  </style>
  <rect width="100%" height="100%" fill="${bgColor}" rx="8"/>
  ${paths}
  ${legend}
</svg>`;
}

/**
 * Generate bar chart
 */
function generateBarChart(stats, width, height, theme) {
    return generateLanguageChart(stats, width, height, theme);
}

/**
 * Generate empty chart placeholder
 */
function generateEmptyChart(width, height) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#f6f8fa" rx="8"/>
  <text x="50%" y="50%" text-anchor="middle" fill="#586069" font-size="14">No data available</text>
</svg>`;
}

/**
 * Generate a single badge SVG
 */
function generateBadge(options) {
    const { label, message, color = '007ec6', style = 'flat' } = options;

    const labelWidth = label.length * 7 + 10;
    const messageWidth = message.length * 7 + 10;
    const totalWidth = labelWidth + messageWidth;
    const height = style === 'for-the-badge' ? 28 : 20;

    const fontSize = style === 'for-the-badge' ? 11 : 11;
    const textY = style === 'for-the-badge' ? 18 : 14;
    const radius = style === 'flat-square' ? 0 : 3;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="${radius}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="#${color}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${fontSize}">
    <text x="${labelWidth / 2}" y="${textY}" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="${textY - 1}" fill="#fff">${label}</text>
    <text x="${labelWidth + messageWidth / 2}" y="${textY}" fill="#010101" fill-opacity=".3">${message}</text>
    <text x="${labelWidth + messageWidth / 2}" y="${textY - 1}" fill="#fff">${message}</text>
  </g>
</svg>`;
}
