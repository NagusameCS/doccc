/**
 * Grid Layout Generator
 */

export function generateGrid(items, options = {}) {
    const { columns = 3, gap = 16, align = 'center' } = options;

    if (items.length === 0) return '';

    const rows = [];
    for (let i = 0; i < items.length; i += columns) {
        rows.push(items.slice(i, i + columns));
    }

    const cellWidth = `${Math.floor(100 / columns)}%`;

    const tableRows = rows.map(row => {
        const cells = row.map(item =>
            `<td align="${align}" width="${cellWidth}">${item}</td>`
        ).join('\n');

        // Pad if needed
        const padding = columns - row.length;
        const padCells = Array(padding).fill(`<td width="${cellWidth}"></td>`).join('\n');

        return `<tr>\n${cells}\n${padCells}</tr>`;
    }).join('\n');

    return `<table>\n${tableRows}\n</table>`;
}
