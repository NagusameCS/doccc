/**
 * Navigation Generator
 */

export function generateNavigation(anchors, options = {}) {
    const { style = 'anchors' } = options;

    if (anchors.size === 0) return '';

    const items = Array.from(anchors.entries());

    if (style === 'badges') {
        const badges = items.map(([id, title]) =>
            `[![${title}](#${id})](https://img.shields.io/badge/-${encodeURIComponent(title)}-blue)`
        ).join(' ');
        return `<p align="center">${badges}</p>\n`;
    }

    if (style === 'table') {
        const cells = items.map(([id, title]) => `[${title}](#${id})`);
        return `| ${cells.join(' | ')} |\n| ${cells.map(() => ':---:').join(' | ')} |\n`;
    }

    // Default: anchor links
    const links = items.map(([id, title]) => `[${title}](#${id})`).join(' • ');
    return `<p align="center">${links}</p>\n`;
}
