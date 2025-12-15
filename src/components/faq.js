/**
 * FAQ Component
 */

export async function renderFaq(config, context = {}) {
    const { id = 'faq', title = 'FAQ', content = {} } = config;
    const { collapsible = true, items = [] } = content;

    const lines = [`<h2 id="${id}">${title}</h2>`, ''];

    if (items.length === 0) {
        lines.push('*No FAQ items yet.*');
        return lines.join('\n');
    }

    for (const item of items) {
        if (collapsible) {
            lines.push('<details>');
            lines.push(`<summary><strong>${item.question}</strong></summary>`);
            lines.push('', item.answer, '');
            lines.push('</details>', '');
        } else {
            lines.push(`### ${item.question}`, '', item.answer, '');
        }
    }

    return lines.join('\n');
}
