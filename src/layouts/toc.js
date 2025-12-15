/**
 * Table of Contents Generator
 */

export function generateToc(sections, options = {}) {
    const { title = 'Table of Contents', maxDepth = 3, collapsible = true } = options;

    // Extract headers from rendered sections
    const headers = [];
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;

    for (const section of sections) {
        let match;
        while ((match = headerRegex.exec(section)) !== null) {
            const level = match[1].length;
            if (level <= maxDepth) {
                const text = match[2].replace(/<[^>]+>/g, '').trim();
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                headers.push({ level, text, id });
            }
        }
    }

    if (headers.length === 0) return '';

    const tocLines = headers.map(h => {
        const indent = '  '.repeat(h.level - 1);
        return `${indent}- [${h.text}](#${h.id})`;
    });

    if (collapsible) {
        return `<details>
<summary><strong>${title}</strong></summary>

${tocLines.join('\n')}

</details>\n`;
    }

    return `## ${title}\n\n${tocLines.join('\n')}\n`;
}
