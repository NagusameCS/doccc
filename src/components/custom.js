/**
 * Custom Component
 */

import { readFileSync, existsSync } from 'fs';

export async function renderCustom(config, context = {}) {
    const { id = 'custom', title = '', content = {} } = config;
    const { markdown = '', file = null } = content;

    const lines = [];

    if (title) {
        lines.push(`<h2 id="${id}">${title}</h2>`, '');
    }

    if (file && existsSync(file)) {
        lines.push(readFileSync(file, 'utf-8'));
    } else if (markdown) {
        lines.push(markdown);
    }

    lines.push('');
    return lines.join('\n');
}
