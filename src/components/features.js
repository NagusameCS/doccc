/**
 * Features Component
 * 
 * Grid or list of feature cards
 */

/**
 * Render features section
 */
export async function renderFeatures(config, context = {}) {
    const {
        id = 'features',
        title = 'Features',
        content = {},
    } = config;

    const {
        layout = 'grid',
        columns = 3,
        items = [],
        showIcons = true,
    } = content;

    const lines = [];

    // Section header with anchor
    lines.push(`<h2 id="${id}">${title}</h2>`);
    lines.push('');

    if (items.length === 0) {
        lines.push('*No features defined yet.*');
        return lines.join('\n');
    }

    // Render based on layout
    switch (layout) {
        case 'grid':
            lines.push(...renderGrid(items, columns, showIcons));
            break;
        case 'list':
            lines.push(...renderList(items, showIcons));
            break;
        case 'cards':
            lines.push(...renderCards(items, columns, showIcons));
            break;
        default:
            lines.push(...renderList(items, showIcons));
    }

    lines.push('');

    return lines.join('\n');
}

/**
 * Render as table grid
 */
function renderGrid(items, columns, showIcons) {
    const lines = [];

    // Create table header
    const headers = Array(columns).fill('').map((_, i) => `Feature ${i + 1}`);
    lines.push(`| ${headers.join(' | ')} |`);
    lines.push(`| ${Array(columns).fill(':---:').join(' | ')} |`);

    // Fill rows
    const rows = [];
    for (let i = 0; i < items.length; i += columns) {
        const row = items.slice(i, i + columns);
        const cells = row.map(item => {
            const icon = showIcons && item.icon ? item.icon + ' ' : '';
            const title = item.title ? `**${icon}${item.title}**` : '';
            const desc = item.description ? `<br>${item.description}` : '';
            return title + desc;
        });

        // Pad row if needed
        while (cells.length < columns) {
            cells.push('');
        }

        lines.push(`| ${cells.join(' | ')} |`);
    }

    return lines;
}

/**
 * Render as bullet list
 */
function renderList(items, showIcons) {
    const lines = [];

    for (const item of items) {
        const icon = showIcons && item.icon ? item.icon + ' ' : '';
        const title = item.title ? `**${icon}${item.title}**` : '';
        const desc = item.description ? ` - ${item.description}` : '';
        lines.push(`- ${title}${desc}`);
    }

    return lines;
}

/**
 * Render as visual cards using details/table
 */
function renderCards(items, columns, showIcons) {
    const lines = [];

    lines.push('<table>');

    for (let i = 0; i < items.length; i += columns) {
        const row = items.slice(i, i + columns);

        lines.push('<tr>');

        for (const item of row) {
            const icon = showIcons && item.icon ? `<h3>${item.icon}</h3>` : '';
            const title = item.title ? `<strong>${item.title}</strong>` : '';
            const desc = item.description ? `<p>${item.description}</p>` : '';

            lines.push(`<td width="${Math.floor(100 / columns)}%" align="center">`);
            lines.push(icon);
            lines.push(title);
            lines.push(desc);
            lines.push('</td>');
        }

        // Pad row if needed
        const remaining = columns - row.length;
        for (let j = 0; j < remaining; j++) {
            lines.push(`<td width="${Math.floor(100 / columns)}%"></td>`);
        }

        lines.push('</tr>');
    }

    lines.push('</table>');

    return lines;
}
