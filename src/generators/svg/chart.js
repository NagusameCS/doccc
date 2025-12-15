/**
 * Chart SVG Generator
 */

export function generateChartSvg(data, options = {}) {
    const { type = 'bar', width = 400, height = 200, theme = 'light' } = options;

    switch (type) {
        case 'bar':
            return generateBarChartSvg(data, width, height, theme);
        case 'line':
            return generateLineChartSvg(data, width, height, theme);
        case 'donut':
            return generateDonutChartSvg(data, width, height, theme);
        default:
            return generateBarChartSvg(data, width, height, theme);
    }
}

function generateBarChartSvg(data, width, height, theme) {
    const isDark = theme === 'dark';
    const bg = isDark ? '#0d1117' : '#ffffff';
    const text = isDark ? '#c9d1d9' : '#24292e';
    const grid = isDark ? '#30363d' : '#e1e4e8';

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const items = Array.isArray(data) ? data : [];
    const maxValue = Math.max(...items.map(d => d.value), 1);
    const barWidth = (chartWidth / items.length) * 0.8;
    const barGap = (chartWidth / items.length) * 0.2;

    const bars = items.map((d, i) => {
        const barHeight = (d.value / maxValue) * chartHeight;
        const x = padding.left + i * (barWidth + barGap) + barGap / 2;
        const y = padding.top + chartHeight - barHeight;
        const color = d.color || '#0366d6';

        return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="2"/>
      <text x="${x + barWidth / 2}" y="${height - 10}" text-anchor="middle" fill="${text}" font-size="10">${d.label || ''}</text>
    `;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <style>text { font-family: -apple-system, sans-serif; }</style>
  <rect width="100%" height="100%" fill="${bg}" rx="8"/>
  <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="${grid}"/>
  ${bars}
</svg>`;
}

function generateLineChartSvg(data, width, height, theme) {
    const isDark = theme === 'dark';
    const bg = isDark ? '#0d1117' : '#ffffff';
    const text = isDark ? '#c9d1d9' : '#24292e';
    const line = isDark ? '#58a6ff' : '#0366d6';

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const items = Array.isArray(data) ? data : [];
    const maxValue = Math.max(...items.map(d => d.value), 1);

    const points = items.map((d, i) => {
        const x = padding.left + (i / (items.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <style>text { font-family: -apple-system, sans-serif; }</style>
  <rect width="100%" height="100%" fill="${bg}" rx="8"/>
  <polyline points="${points}" fill="none" stroke="${line}" stroke-width="2"/>
  ${items.map((d, i) => {
        const x = padding.left + (i / (items.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
        return `<circle cx="${x}" cy="${y}" r="4" fill="${line}"/>`;
    }).join('')}
</svg>`;
}

function generateDonutChartSvg(data, width, height, theme) {
    const isDark = theme === 'dark';
    const bg = isDark ? '#0d1117' : '#ffffff';
    const text = isDark ? '#c9d1d9' : '#24292e';

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 30;
    const innerRadius = radius * 0.6;

    const items = Array.isArray(data) ? data : [];
    const total = items.reduce((sum, d) => sum + d.value, 0) || 1;

    let startAngle = -90;
    const arcs = items.map(d => {
        const angle = (d.value / total) * 360;
        const endAngle = startAngle + angle;

        const x1 = cx + radius * Math.cos(startAngle * Math.PI / 180);
        const y1 = cy + radius * Math.sin(startAngle * Math.PI / 180);
        const x2 = cx + radius * Math.cos(endAngle * Math.PI / 180);
        const y2 = cy + radius * Math.sin(endAngle * Math.PI / 180);
        const ix1 = cx + innerRadius * Math.cos(startAngle * Math.PI / 180);
        const iy1 = cy + innerRadius * Math.sin(startAngle * Math.PI / 180);
        const ix2 = cx + innerRadius * Math.cos(endAngle * Math.PI / 180);
        const iy2 = cy + innerRadius * Math.sin(endAngle * Math.PI / 180);

        const largeArc = angle > 180 ? 1 : 0;
        const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;

        startAngle = endAngle;
        return `<path d="${path}" fill="${d.color || '#0366d6'}"/>`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}" rx="8"/>
  ${arcs}
</svg>`;
}
