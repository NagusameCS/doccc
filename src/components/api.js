/**
 * API Component
 */

export async function renderApi(config, context = {}) {
    const { id = 'api', title = '📖 API', content = {} } = config;
    const { sections = [], source = 'manual' } = content;

    const lines = [`<h2 id="${id}">${title}</h2>`, ''];

    for (const section of sections) {
        if (section.name) {
            lines.push(`### \`${section.name}\``, '');
        }
        if (section.description) {
            lines.push(section.description, '');
        }
        if (section.signature) {
            lines.push('```typescript', section.signature, '```', '');
        }
        if (section.params?.length > 0) {
            lines.push('**Parameters:**', '');
            lines.push('| Name | Type | Description |');
            lines.push('|------|------|-------------|');
            for (const p of section.params) {
                lines.push(`| \`${p.name}\` | \`${p.type}\` | ${p.description || ''} |`);
            }
            lines.push('');
        }
        if (section.returns) {
            lines.push(`**Returns:** \`${section.returns}\``, '');
        }
        if (section.example) {
            lines.push('**Example:**', '', '```javascript', section.example, '```', '');
        }
    }

    return lines.join('\n');
}
