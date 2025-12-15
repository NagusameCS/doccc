/**
 * Timeline Component
 */

export async function renderTimeline(config, context = {}) {
    const { id = 'timeline', title = '🗓️ Roadmap', content = {} } = config;
    const { style = 'vertical', items = [] } = content;

    const lines = [`<h2 id="${id}">${title}</h2>`, ''];

    if (items.length === 0) {
        lines.push('*Roadmap coming soon*');
        return lines.join('\n');
    }

    if (style === 'table') {
        lines.push('| Status | Milestone | Target |');
        lines.push('|:------:|-----------|--------|');
        for (const item of items) {
            const status = item.done ? '✅' : item.inProgress ? '🔄' : '📋';
            lines.push(`| ${status} | ${item.title} | ${item.date || 'TBD'} |`);
        }
    } else {
        for (const item of items) {
            const icon = item.done ? '✅' : item.inProgress ? '🔄' : '⏳';
            const dateStr = item.date ? ` (${item.date})` : '';
            lines.push(`- ${icon} **${item.title}**${dateStr}`);
            if (item.description) lines.push(`  - ${item.description}`);
        }
    }

    lines.push('');
    return lines.join('\n');
}
