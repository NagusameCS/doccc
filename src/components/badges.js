/**
 * Badges Component
 * 
 * Render status badges from various sources
 */

/**
 * Badge definitions
 */
const BADGE_TYPES = {
    // GitHub badges
    'github-stars': (repo, style) =>
        `![GitHub Stars](https://img.shields.io/github/stars/${repo}?style=${style}&logo=github)`,
    'github-forks': (repo, style) =>
        `![GitHub Forks](https://img.shields.io/github/forks/${repo}?style=${style}&logo=github)`,
    'github-issues': (repo, style) =>
        `![GitHub Issues](https://img.shields.io/github/issues/${repo}?style=${style}&logo=github)`,
    'github-prs': (repo, style) =>
        `![GitHub PRs](https://img.shields.io/github/issues-pr/${repo}?style=${style}&logo=github)`,
    'github-license': (repo, style) =>
        `![License](https://img.shields.io/github/license/${repo}?style=${style})`,
    'github-release': (repo, style) =>
        `![GitHub Release](https://img.shields.io/github/v/release/${repo}?style=${style}&logo=github)`,
    'github-last-commit': (repo, style) =>
        `![Last Commit](https://img.shields.io/github/last-commit/${repo}?style=${style}&logo=github)`,
    'github-contributors': (repo, style) =>
        `![Contributors](https://img.shields.io/github/contributors/${repo}?style=${style}&logo=github)`,
    'github-repo-size': (repo, style) =>
        `![Repo Size](https://img.shields.io/github/repo-size/${repo}?style=${style})`,
    'github-code-size': (repo, style) =>
        `![Code Size](https://img.shields.io/github/languages/code-size/${repo}?style=${style})`,
    'github-top-language': (repo, style) =>
        `![Top Language](https://img.shields.io/github/languages/top/${repo}?style=${style})`,

    // npm badges
    'npm-version': (pkg, style) =>
        `![npm Version](https://img.shields.io/npm/v/${pkg}?style=${style}&logo=npm)`,
    'npm-downloads': (pkg, style) =>
        `![npm Downloads](https://img.shields.io/npm/dm/${pkg}?style=${style}&logo=npm)`,
    'npm-downloads-total': (pkg, style) =>
        `![npm Total Downloads](https://img.shields.io/npm/dt/${pkg}?style=${style}&logo=npm)`,
    'npm-license': (pkg, style) =>
        `![npm License](https://img.shields.io/npm/l/${pkg}?style=${style})`,
    'npm-bundle-size': (pkg, style) =>
        `![Bundle Size](https://img.shields.io/bundlephobia/min/${pkg}?style=${style})`,

    // CI/Build badges
    'build-status': (repo, style) =>
        `![Build Status](https://img.shields.io/github/actions/workflow/status/${repo}/ci.yml?style=${style}&logo=github-actions)`,
    'coverage': (repo, style) =>
        `![Coverage](https://img.shields.io/codecov/c/github/${repo}?style=${style}&logo=codecov)`,

    // Other badges
    'node-version': (version, style) =>
        `![Node Version](https://img.shields.io/badge/node->=${version}-green?style=${style}&logo=node.js)`,
    'typescript': (_, style) =>
        `![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=${style}&logo=typescript)`,
    'prs-welcome': (_, style) =>
        `![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=${style})`,
    'maintained': (_, style) =>
        `![Maintained](https://img.shields.io/badge/Maintained-yes-green?style=${style})`,

    // Custom
    'custom': (config, style) => {
        const { label, message, color = 'blue', logo = '' } = config;
        const logoParam = logo ? `&logo=${logo}` : '';
        return `![${label}](https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=${style}${logoParam})`;
    },
};

/**
 * Render badges section
 */
export async function renderBadges(config, context = {}) {
    const {
        id = 'badges',
        content = {},
    } = config;

    const {
        style = 'flat',
        items = [],
        align = 'center',
        separator = ' ',
    } = content;

    // Get repo from context or config
    const repo = extractRepo(context.config?.project?.repository);
    const pkg = context.config?.project?.name;

    const badges = [];

    for (const item of items) {
        let badge;

        if (typeof item === 'string') {
            // Simple badge type reference
            const generator = BADGE_TYPES[item];
            if (generator) {
                const param = item.startsWith('npm-') ? pkg : repo;
                badge = generator(param, style);
            }
        } else if (typeof item === 'object') {
            // Object with type and options
            const generator = BADGE_TYPES[item.type];
            if (generator) {
                const param = item.repo || item.package ||
                    (item.type.startsWith('npm-') ? pkg : repo);
                badge = generator(param, item.style || style);
            }

            // Custom badge
            if (item.type === 'custom') {
                badge = BADGE_TYPES.custom(item, item.style || style);
            }

            // Direct URL badge
            if (item.url) {
                badge = `![${item.alt || 'Badge'}](${item.url})`;
            }

            // Add link wrapper
            if (badge && item.link) {
                badge = `[${badge}](${item.link})`;
            }
        }

        if (badge) {
            badges.push(badge);
        }
    }

    if (badges.length === 0) {
        return '';
    }

    // Format output
    const lines = [];

    if (align === 'center') {
        lines.push('<p align="center">');
        lines.push(`  ${badges.join(separator)}`);
        lines.push('</p>');
    } else {
        lines.push(badges.join(separator));
    }

    lines.push('');

    return lines.join('\n');
}

/**
 * Extract owner/repo from GitHub URL
 */
function extractRepo(url) {
    if (!url) return '';
    const match = url.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
    return match ? match[1].replace(/\.git$/, '') : url;
}

/**
 * Generate badge URL
 */
export function generateBadgeUrl(options) {
    const {
        label,
        message,
        color = 'blue',
        style = 'flat',
        logo = '',
        logoColor = '',
    } = options;

    let url = `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=${style}`;

    if (logo) url += `&logo=${logo}`;
    if (logoColor) url += `&logoColor=${logoColor}`;

    return url;
}
