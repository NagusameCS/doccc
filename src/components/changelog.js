/**
 * Changelog Component
 */

import { readFileSync, existsSync } from 'fs';

export async function renderChangelog(config, context = {}) {
    const { id = 'changelog', title = '📝 Changelog', content = {} } = config;
    const { source = 'CHANGELOG.md', showLatest = 5, collapsible = true } = content;

    const lines = [`<h2 id="${id}">${title}</h2>`, ''];

    // Try to read changelog file
    if (existsSync(source)) {
        const changelog = readFileSync(source, 'utf-8');
        const releases = parseChangelog(changelog, showLatest);

        for (const release of releases) {
            if (collapsible) {
                lines.push('<details>');
                lines.push(`<summary><strong>${release.version}</strong> - ${release.date || 'Unreleased'}</summary>`);
                lines.push('', release.content, '');
                lines.push('</details>', '');
            } else {
                lines.push(`### ${release.version}`, '', release.content, '');
            }
        }

        if (releases.length < showLatest) {
            lines.push(`[View full changelog](${source})`);
        }
    } else {
        lines.push('*No changelog available.*');
    }

    return lines.join('\n');
}

function parseChangelog(content, limit) {
    const releases = [];
    const regex = /^##\s+\[?([\d.]+)\]?.*?(?:\(([^)]+)\))?/gm;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(content)) !== null && releases.length < limit) {
        if (releases.length > 0) {
            releases[releases.length - 1].content = content.slice(lastIndex, match.index).trim();
        }
        releases.push({
            version: match[1],
            date: match[2] || null,
            content: '',
        });
        lastIndex = match.index + match[0].length;
    }

    if (releases.length > 0) {
        releases[releases.length - 1].content = content.slice(lastIndex).split(/^##\s+/m)[0].trim();
    }

    return releases;
}
