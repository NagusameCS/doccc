/**
 * Generate Command
 * 
 * Generate new component configurations
 */

import inquirer from 'inquirer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';

const COMPONENT_TEMPLATES = {
    hero: {
        name: 'Hero Section',
        description: 'Large header with title, subtitle, and optional logo',
        defaultConfig: {
            type: 'hero',
            id: 'hero',
            content: {
                title: '',
                subtitle: '',
                logo: null,
                animated: true,
                align: 'center',
            },
        },
        prompts: [
            { type: 'input', name: 'title', message: 'Title:', default: 'Project Name' },
            { type: 'input', name: 'subtitle', message: 'Subtitle:', default: '' },
            { type: 'input', name: 'logo', message: 'Logo path (optional):', default: '' },
            { type: 'confirm', name: 'animated', message: 'Animated SVG hero?', default: true },
        ],
    },

    badges: {
        name: 'Badges Section',
        description: 'Collection of status badges',
        defaultConfig: {
            type: 'badges',
            id: 'badges',
            content: {
                style: 'flat',
                items: [],
            },
        },
        prompts: [
            {
                type: 'list',
                name: 'style',
                message: 'Badge style:',
                choices: ['flat', 'flat-square', 'plastic', 'for-the-badge'],
                default: 'flat',
            },
            {
                type: 'checkbox',
                name: 'badges',
                message: 'Select badges to include:',
                choices: [
                    { name: 'GitHub Stars', value: 'github-stars' },
                    { name: 'GitHub Forks', value: 'github-forks' },
                    { name: 'GitHub Issues', value: 'github-issues' },
                    { name: 'GitHub License', value: 'github-license' },
                    { name: 'npm Version', value: 'npm-version' },
                    { name: 'npm Downloads', value: 'npm-downloads' },
                    { name: 'Build Status', value: 'build-status' },
                    { name: 'Code Coverage', value: 'coverage' },
                ],
            },
        ],
    },

    features: {
        name: 'Features Grid',
        description: 'Grid of feature cards with icons',
        defaultConfig: {
            type: 'features',
            id: 'features',
            title: '✨ Features',
            content: {
                layout: 'grid',
                columns: 3,
                items: [],
            },
        },
        prompts: [
            { type: 'input', name: 'title', message: 'Section title:', default: '✨ Features' },
            { type: 'list', name: 'layout', message: 'Layout:', choices: ['grid', 'list', 'cards'], default: 'grid' },
            { type: 'list', name: 'columns', message: 'Columns:', choices: ['2', '3', '4'], default: '3' },
        ],
    },

    stats: {
        name: 'Statistics Panel',
        description: 'Code statistics with charts (linehook)',
        defaultConfig: {
            type: 'stats',
            id: 'stats',
            title: '📊 Statistics',
            content: {
                showLanguages: true,
                showLineCount: true,
                showFileCount: true,
                chartType: 'languages',
            },
        },
        prompts: [
            { type: 'confirm', name: 'showLanguages', message: 'Show language breakdown?', default: true },
            { type: 'confirm', name: 'showLineCount', message: 'Show line count?', default: true },
            { type: 'confirm', name: 'showFileCount', message: 'Show file count?', default: true },
            { type: 'list', name: 'chartType', message: 'Chart type:', choices: ['languages', 'files', 'timeline'], default: 'languages' },
        ],
    },

    installation: {
        name: 'Installation Section',
        description: 'Package installation instructions',
        defaultConfig: {
            type: 'installation',
            id: 'installation',
            title: '📦 Installation',
            content: {
                packageManager: 'auto',
                showAll: true,
                customSteps: [],
            },
        },
        prompts: [
            {
                type: 'list',
                name: 'packageManager',
                message: 'Primary package manager:',
                choices: [
                    { name: 'Auto-detect', value: 'auto' },
                    { name: 'npm', value: 'npm' },
                    { name: 'yarn', value: 'yarn' },
                    { name: 'pnpm', value: 'pnpm' },
                ],
                default: 'auto',
            },
            { type: 'confirm', name: 'showAll', message: 'Show all package managers?', default: true },
        ],
    },

    usage: {
        name: 'Usage Examples',
        description: 'Code examples and usage guide',
        defaultConfig: {
            type: 'usage',
            id: 'usage',
            title: '🚀 Usage',
            content: {
                examples: [],
            },
        },
        prompts: [
            { type: 'input', name: 'title', message: 'Section title:', default: '🚀 Usage' },
        ],
    },

    api: {
        name: 'API Documentation',
        description: 'API reference documentation',
        defaultConfig: {
            type: 'api',
            id: 'api',
            title: '📖 API',
            content: {
                source: 'jsdoc', // 'jsdoc', 'typescript', 'manual'
                sections: [],
            },
        },
        prompts: [
            {
                type: 'list',
                name: 'source',
                message: 'API documentation source:',
                choices: [
                    { name: 'JSDoc comments', value: 'jsdoc' },
                    { name: 'TypeScript types', value: 'typescript' },
                    { name: 'Manual', value: 'manual' },
                ],
                default: 'jsdoc',
            },
        ],
    },

    faq: {
        name: 'FAQ Section',
        description: 'Frequently asked questions with collapsible answers',
        defaultConfig: {
            type: 'faq',
            id: 'faq',
            title: '❓ FAQ',
            content: {
                collapsible: true,
                items: [],
            },
        },
        prompts: [
            { type: 'confirm', name: 'collapsible', message: 'Make answers collapsible?', default: true },
        ],
    },

    changelog: {
        name: 'Changelog',
        description: 'Version history and changes',
        defaultConfig: {
            type: 'changelog',
            id: 'changelog',
            title: '📝 Changelog',
            content: {
                source: 'CHANGELOG.md',
                showLatest: 5,
                collapsible: true,
            },
        },
        prompts: [
            { type: 'input', name: 'source', message: 'Changelog file:', default: 'CHANGELOG.md' },
            { type: 'input', name: 'showLatest', message: 'Number of releases to show:', default: '5' },
        ],
    },

    contributors: {
        name: 'Contributors',
        description: 'Project contributors with avatars',
        defaultConfig: {
            type: 'contributors',
            id: 'contributors',
            title: '👥 Contributors',
            content: {
                source: 'github',
                showAvatars: true,
                columns: 7,
            },
        },
        prompts: [
            {
                type: 'list',
                name: 'source',
                message: 'Contributor source:',
                choices: [
                    { name: 'GitHub API', value: 'github' },
                    { name: 'Manual list', value: 'manual' },
                    { name: 'all-contributors spec', value: 'all-contributors' },
                ],
                default: 'github',
            },
            { type: 'confirm', name: 'showAvatars', message: 'Show avatars?', default: true },
            { type: 'input', name: 'columns', message: 'Avatars per row:', default: '7' },
        ],
    },

    license: {
        name: 'License',
        description: 'License information',
        defaultConfig: {
            type: 'license',
            id: 'license',
            title: '📄 License',
            content: {
                type: 'MIT',
                showBadge: true,
                showFullText: false,
            },
        },
        prompts: [
            {
                type: 'list',
                name: 'type',
                message: 'License type:',
                choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Other'],
                default: 'MIT',
            },
            { type: 'confirm', name: 'showBadge', message: 'Show license badge?', default: true },
        ],
    },

    timeline: {
        name: 'Timeline',
        description: 'Project timeline or roadmap',
        defaultConfig: {
            type: 'timeline',
            id: 'timeline',
            title: '🗓️ Roadmap',
            content: {
                style: 'vertical',
                items: [],
            },
        },
        prompts: [
            { type: 'input', name: 'title', message: 'Section title:', default: '🗓️ Roadmap' },
            { type: 'list', name: 'style', message: 'Timeline style:', choices: ['vertical', 'horizontal', 'table'], default: 'vertical' },
        ],
    },

    gallery: {
        name: 'Image Gallery',
        description: 'Screenshot or image gallery',
        defaultConfig: {
            type: 'gallery',
            id: 'gallery',
            title: '📸 Screenshots',
            content: {
                layout: 'grid',
                columns: 2,
                images: [],
            },
        },
        prompts: [
            { type: 'input', name: 'title', message: 'Section title:', default: '📸 Screenshots' },
            { type: 'list', name: 'columns', message: 'Columns:', choices: ['1', '2', '3', '4'], default: '2' },
        ],
    },

    custom: {
        name: 'Custom Section',
        description: 'Custom markdown section',
        defaultConfig: {
            type: 'custom',
            id: 'custom',
            title: '',
            content: {
                markdown: '',
                file: null,
            },
        },
        prompts: [
            { type: 'input', name: 'id', message: 'Section ID:', default: 'custom' },
            { type: 'input', name: 'title', message: 'Section title:', default: '' },
            { type: 'input', name: 'file', message: 'Markdown file (optional):', default: '' },
        ],
    },
};

/**
 * Generate component configuration
 */
export async function generate(component, options = {}) {
    const template = COMPONENT_TEMPLATES[component];

    if (!template) {
        const available = Object.keys(COMPONENT_TEMPLATES).join(', ');
        throw new Error(`Unknown component: ${component}\nAvailable: ${available}`);
    }

    console.log(chalk.bold(`\n${template.name}`));
    console.log(chalk.gray(template.description));
    console.log();

    // Get user input
    const answers = await inquirer.prompt(template.prompts);

    // Build config
    const config = {
        ...template.defaultConfig,
        content: {
            ...template.defaultConfig.content,
            ...answers,
        },
    };

    if (answers.title) {
        config.title = answers.title;
    }

    if (options.name) {
        config.id = options.name;
    }

    // Output or append
    if (options.append) {
        await appendToConfig(config);
        console.log(chalk.green(`\n✓ Added ${component} to doccc.config.js`));
    } else {
        console.log(chalk.bold('\nGenerated configuration:'));
        console.log(chalk.cyan(JSON.stringify(config, null, 2)));
        console.log(chalk.gray('\nAdd this to your doccc.config.js sections array'));
    }

    return config;
}

/**
 * Append component to existing config
 */
async function appendToConfig(componentConfig) {
    const configPath = 'doccc.config.js';

    if (!existsSync(configPath)) {
        throw new Error('No doccc.config.js found. Run `doccc init` first.');
    }

    // Read and parse config
    let content = readFileSync(configPath, 'utf-8');

    // Find sections array and append
    const sectionsRegex = /sections:\s*\[/;
    if (!sectionsRegex.test(content)) {
        throw new Error('Could not find sections array in config');
    }

    // Insert new component
    const insertion = JSON.stringify(componentConfig, null, 2)
        .split('\n')
        .map((line, i) => i === 0 ? line : '    ' + line)
        .join('\n');

    content = content.replace(
        /sections:\s*\[/,
        `sections: [\n    ${insertion},`
    );

    writeFileSync(configPath, content, 'utf-8');
}

/**
 * List available components
 */
export function listComponents() {
    console.log(chalk.bold('\nAvailable Components:\n'));

    for (const [name, template] of Object.entries(COMPONENT_TEMPLATES)) {
        console.log(`  ${chalk.cyan(name.padEnd(15))} ${template.name}`);
        console.log(`  ${' '.repeat(15)} ${chalk.gray(template.description)}\n`);
    }
}
