/**
 * Usage Component
 */

export async function renderUsage(config, context = {}) {
    const { id = 'usage', title = 'Usage', content = {} } = config;
    const { examples = [], quickStart = null } = content;

    const lines = [`<h2 id="${id}">${title}</h2>`, ''];

    if (quickStart) {
        lines.push('### Quick Start', '', '```javascript', quickStart, '```', '');
    }

    if (examples.length > 0) {
        lines.push('### Examples', '');
        for (const ex of examples) {
            if (ex.title) lines.push(`#### ${ex.title}`, '');
            if (ex.description) lines.push(ex.description, '');
            if (ex.code) {
                lines.push(`\`\`\`${ex.language || 'javascript'}`);
                lines.push(ex.code);
                lines.push('```', '');
            }
        }
    }

    return lines.join('\n');
}
