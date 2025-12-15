/**
 * Badge SVG Generator
 */

export function generateBadgeSvg(options = {}) {
    const {
        label = 'label',
        message = 'message',
        color = '007ec6',
        labelColor = '555',
        style = 'flat',
        logo = null,
        logoWidth = 14,
    } = options;

    const logoOffset = logo ? logoWidth + 6 : 0;
    const labelWidth = label.length * 6.5 + 10 + logoOffset;
    const messageWidth = message.length * 6.5 + 10;
    const totalWidth = labelWidth + messageWidth;
    const height = style === 'for-the-badge' ? 28 : 20;
    const fontSize = style === 'for-the-badge' ? 10 : 11;
    const textY = height / 2 + fontSize / 3;
    const radius = style === 'flat-square' ? 0 : 3;

    let logoSvg = '';
    if (logo) {
        logoSvg = `<image x="5" y="${(height - logoWidth) / 2}" width="${logoWidth}" height="${logoWidth}" href="${logo}"/>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <linearGradient id="grad" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="clip">
    <rect width="${totalWidth}" height="${height}" rx="${radius}"/>
  </clipPath>
  <g clip-path="url(#clip)">
    <rect width="${labelWidth}" height="${height}" fill="#${labelColor}"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="#${color}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#grad)"/>
  </g>
  ${logoSvg}
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="${fontSize}">
    <text x="${(labelWidth + logoOffset) / 2}" y="${textY}" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${(labelWidth + logoOffset) / 2}" y="${textY - 1}">${label}</text>
    <text x="${labelWidth + messageWidth / 2}" y="${textY}" fill="#010101" fill-opacity=".3">${message}</text>
    <text x="${labelWidth + messageWidth / 2}" y="${textY - 1}">${message}</text>
  </g>
</svg>`;
}
