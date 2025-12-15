/**
 * Badge Generator
 */

export function generateBadgeSection(config, stats) {
    const { badges = {}, project = {} } = config;
    const { items = [], style = 'flat', position = 'top' } = badges;

    if (items.length === 0 || position === 'none') return '';

    const repo = extractRepo(project.repository);
    const pkg = project.name;

    const rendered = items.map(item => {
        if (typeof item === 'string') {
            return renderBadge(item, { repo, pkg, style });
        }
        return renderBadge(item.type, { ...item, repo, pkg, style: item.style || style });
    }).filter(Boolean);

    return `<p align="center">\n  ${rendered.join(' ')}\n</p>\n`;
}

function renderBadge(type, opts) {
    const { repo, pkg, style } = opts;

    const badges = {
        'github-stars': `![Stars](https://img.shields.io/github/stars/${repo}?style=${style})`,
        'github-forks': `![Forks](https://img.shields.io/github/forks/${repo}?style=${style})`,
        'github-issues': `![Issues](https://img.shields.io/github/issues/${repo}?style=${style})`,
        'github-license': `![License](https://img.shields.io/github/license/${repo}?style=${style})`,
        'npm-version': `![npm](https://img.shields.io/npm/v/${pkg}?style=${style})`,
        'npm-downloads': `![Downloads](https://img.shields.io/npm/dm/${pkg}?style=${style})`,
    };

    return badges[type] || null;
}

function extractRepo(url) {
    if (!url) return '';
    const match = url.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
    return match ? match[1].replace(/\.git$/, '') : '';
}
