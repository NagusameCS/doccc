/**
 * Stats Component
 * 
 * Code statistics panel using linehook integration
 */

import { generateLinehookStats, formatLineCount, getLanguageColor } from '../integrations/linehook.js';

/**
 * Render stats section
 */
export async function renderStats(config, context = {}) {
    const {
        id = 'stats',
        title = 'Statistics',
        content = {},
    } = config;

    const {
        showLanguages = true,
        showLineCount = true,
        showFileCount = true,
        chartType = 'languages',
        showChart = true,
    } = content;

    const lines = [];

    // Section header with anchor
    lines.push(`<h2 id="${id}">${title}</h2>`);
    lines.push('');

    // Get stats from context or generate
    let stats = context.stats;
    if (!stats) {
        try {
            stats = await generateLinehookStats(
                context.config?.linehook || {},
                context.assetsDir
            );
        } catch (error) {
            lines.push('*Statistics unavailable*');
            return lines.join('\n');
        }
    }

    // Stats overview table
    if (showLineCount || showFileCount) {
        lines.push('<table>');
        lines.push('<tr>');

        if (showFileCount) {
            lines.push(`<td align="center"><strong>Files</strong><br>${stats.totalFiles}</td>`);
        }
        if (showLineCount) {
            lines.push(`<td align="center"><strong>Lines</strong><br>${formatLineCount(stats.totalLines)}</td>`);
            lines.push(`<td align="center"><strong>Code</strong><br>${formatLineCount(stats.codeLines)}</td>`);
            lines.push(`<td align="center"><strong>Comments</strong><br>${formatLineCount(stats.commentLines)}</td>`);
        }

        lines.push('</tr>');
        lines.push('</table>');
        lines.push('');
    }

    // Language breakdown
    if (showLanguages && stats.languages) {
        lines.push('### Languages');
        lines.push('');

        // Sort by lines descending
        const sortedLangs = Object.entries(stats.languages)
            .sort((a, b) => b[1].lines - a[1].lines)
            .slice(0, 10); // Top 10

        // Visual bar chart using Unicode
        const maxLines = sortedLangs[0]?.[1].lines || 1;

        for (const [lang, data] of sortedLangs) {
            const percent = ((data.lines / stats.totalLines) * 100).toFixed(1);
            const barLength = Math.round((data.lines / maxLines) * 20);
            const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
            const color = getLanguageColor(lang);

            lines.push(`\`${lang.padEnd(15)}\` ${bar} ${percent}%`);
        }

        lines.push('');
    }

    // Chart image reference
    if (showChart && context.assetsDir) {
        lines.push(`<details>`);
        lines.push(`<summary>View Chart</summary>`);
        lines.push('');
        lines.push(`![Language Stats](${context.assetsDir}/stats-${chartType}.svg)`);
        lines.push('');
        lines.push(`</details>`);
        lines.push('');
    }

    // Generated timestamp
    if (stats.generated) {
        lines.push(`<sub>Last updated: ${new Date(stats.generated).toLocaleDateString()}</sub>`);
        lines.push('');
    }

    return lines.join('\n');
}
