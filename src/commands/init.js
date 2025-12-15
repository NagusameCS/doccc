/**
 * Init Command
 * 
 * Initialize a new doccc project with configuration and templates
 */

import inquirer from 'inquirer';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getDefaultConfig } from '../config/loader.js';

const TEMPLATES = {
    minimal: {
        description: 'Basic README with hero and badges',
        sections: [
            { type: 'hero' },
            { type: 'badges' },
            { type: 'installation' },
            { type: 'usage' },
            { type: 'license' },
        ],
    },
    standard: {
        description: 'Full-featured README with all common sections',
        sections: [
            { type: 'hero' },
            { type: 'badges' },
            { type: 'features' },
            { type: 'installation' },
            { type: 'usage' },
            { type: 'api' },
            { type: 'faq' },
            { type: 'contributors' },
            { type: 'license' },
        ],
    },
    full: {
        description: 'Everything including stats, changelog, and advanced features',
        sections: [
            { type: 'hero' },
            { type: 'badges' },
            { type: 'stats' },
            { type: 'features' },
            { type: 'installation' },
            { type: 'usage' },
            { type: 'api' },
            { type: 'changelog' },
            { type: 'faq' },
            { type: 'contributors' },
            { type: 'license' },
        ],
        linehook: { enabled: true },
        actions: { enabled: true },
    },
};

/**
 * Initialize project
 */
export async function init(options = {}) {
    let answers = {};

    // Interactive mode
    if (!options.yes) {
        answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'Project name:',
                default: getProjectNameFromPackageJson() || 'my-project',
            },
            {
                type: 'input',
                name: 'description',
                message: 'Project description:',
                default: getDescriptionFromPackageJson() || '',
            },
            {
                type: 'input',
                name: 'repository',
                message: 'GitHub repository (owner/repo):',
                default: getRepoFromGit() || '',
            },
            {
                type: 'list',
                name: 'template',
                message: 'Choose a template:',
                choices: Object.entries(TEMPLATES).map(([name, tmpl]) => ({
                    name: `${name} - ${tmpl.description}`,
                    value: name,
                })),
                default: options.template || 'standard',
            },
            {
                type: 'list',
                name: 'theme',
                message: 'Color scheme:',
                choices: [
                    { name: 'Auto (light/dark based on user preference)', value: 'auto' },
                    { name: 'Light', value: 'light' },
                    { name: 'Dark', value: 'dark' },
                ],
                default: 'auto',
            },
            {
                type: 'confirm',
                name: 'linehook',
                message: 'Enable code statistics with linehook?',
                default: true,
            },
            {
                type: 'confirm',
                name: 'knowtif',
                message: 'Enable GitHub notifications with knowtif?',
                default: false,
            },
            {
                type: 'confirm',
                name: 'actions',
                message: 'Generate GitHub Actions workflow for auto-regeneration?',
                default: options.withActions || false,
            },
        ]);
    } else {
        // Use defaults with CLI options
        answers = {
            projectName: getProjectNameFromPackageJson() || 'my-project',
            description: getDescriptionFromPackageJson() || '',
            repository: getRepoFromGit() || '',
            template: options.template || 'standard',
            theme: 'auto',
            linehook: true,
            knowtif: options.withNotifications || false,
            actions: options.withActions || false,
        };
    }

    // Build configuration
    const template = TEMPLATES[answers.template];
    const config = {
        ...getDefaultConfig(),
        project: {
            name: answers.projectName,
            description: answers.description,
            repository: answers.repository ? `https://github.com/${answers.repository}` : '',
            author: '',
            license: 'MIT',
        },
        theme: {
            ...getDefaultConfig().theme,
            colorScheme: answers.theme,
        },
        sections: buildSections(template.sections, answers),
        linehook: {
            ...getDefaultConfig().linehook,
            enabled: answers.linehook,
        },
        knowtif: {
            ...getDefaultConfig().knowtif,
            enabled: answers.knowtif,
        },
        actions: {
            ...getDefaultConfig().actions,
            enabled: answers.actions,
        },
    };

    // Write config file
    const configContent = generateConfigFile(config);
    writeFileSync('doccc.config.js', configContent, 'utf-8');

    // Create assets directory
    mkdirSync('assets', { recursive: true });

    // Generate GitHub Actions workflow if enabled
    if (answers.actions) {
        await generateActionsWorkflow(config);
    }

    // Generate initial section files if using component DSL
    await generateSectionFiles(config.sections);

    return { config, template: answers.template };
}

/**
 * Build sections with default content
 */
function buildSections(sectionTypes, answers) {
    return sectionTypes.map(section => {
        const base = {
            type: section.type,
            id: section.type,
        };

        switch (section.type) {
            case 'hero':
                return {
                    ...base,
                    content: {
                        title: answers.projectName,
                        subtitle: answers.description,
                        logo: null, // Will be auto-detected
                        animated: true,
                    },
                };

            case 'badges':
                return {
                    ...base,
                    content: {
                        items: generateDefaultBadges(answers),
                    },
                };

            case 'features':
                return {
                    ...base,
                    title: 'Features',
                    content: {
                        layout: 'grid',
                        columns: 3,
                        items: [
                            { icon: 'speed', title: 'Fast', description: 'Lightning fast performance' },
                            { icon: 'tune', title: 'Configurable', description: 'Highly customizable' },
                            { icon: 'widgets', title: 'Modular', description: 'Use only what you need' },
                        ],
                    },
                };

            case 'installation':
                return {
                    ...base,
                    title: 'Installation',
                    content: {
                        packageManager: 'auto', // npm, yarn, pnpm
                        showAll: true,
                    },
                };

            case 'usage':
                return {
                    ...base,
                    title: 'Usage',
                    content: {
                        examples: [],
                    },
                };

            case 'api':
                return {
                    ...base,
                    title: 'API',
                    content: {
                        sections: [],
                    },
                };

            case 'stats':
                return {
                    ...base,
                    title: 'Statistics',
                    content: {
                        showLanguages: true,
                        showLineCount: true,
                        showFileCount: true,
                        chartType: 'languages',
                    },
                };

            case 'faq':
                return {
                    ...base,
                    title: 'FAQ',
                    content: {
                        collapsible: true,
                        items: [],
                    },
                };

            case 'changelog':
                return {
                    ...base,
                    title: 'Changelog',
                    content: {
                        source: 'CHANGELOG.md',
                        showLatest: 5,
                    },
                };

            case 'contributors':
                return {
                    ...base,
                    title: 'Contributors',
                    content: {
                        source: 'github', // 'github', 'manual'
                        showAvatars: true,
                        columns: 7,
                    },
                };

            case 'license':
                return {
                    ...base,
                    title: 'License',
                    content: {
                        type: 'MIT',
                        showBadge: true,
                    },
                };

            default:
                return base;
        }
    });
}

/**
 * Generate default badges based on project
 */
function generateDefaultBadges(answers) {
    const badges = [];
    const repo = answers.repository;

    if (repo) {
        badges.push(
            { type: 'github-stars', repo },
            { type: 'github-forks', repo },
            { type: 'github-issues', repo },
            { type: 'github-license', repo },
        );
    }

    // Check for npm package
    if (existsSync('package.json')) {
        const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
        if (pkg.name && !pkg.private) {
            badges.push(
                { type: 'npm-version', package: pkg.name },
                { type: 'npm-downloads', package: pkg.name },
            );
        }
    }

    return badges;
}

/**
 * Generate config file content
 */
function generateConfigFile(config) {
    return `/**
 * doccc Configuration
 * 
 * README Website Generator - Compile components into GitHub-safe documentation
 * Documentation: https://github.com/NagusameCS/doccc
 */

export default ${JSON.stringify(config, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;
}

/**
 * Generate GitHub Actions workflow
 */
async function generateActionsWorkflow(config) {
    const workflowDir = '.github/workflows';
    mkdirSync(workflowDir, { recursive: true });

    const workflow = `name: Update README

on:
  push:
    branches: [main]
  release:
    types: [published]
  schedule:
    - cron: '${config.actions.schedule}'
  workflow_dispatch:

jobs:
  update-readme:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build README
        run: npx doccc build
      
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'docs: auto-update README [skip ci]'
          file_pattern: 'README.md assets/*'
`;

    writeFileSync(join(workflowDir, 'doccc.yml'), workflow, 'utf-8');
}

/**
 * Generate section component files
 */
async function generateSectionFiles(sections) {
    const sectionsDir = 'docs/sections';
    mkdirSync(sectionsDir, { recursive: true });

    // Generate a sample custom section file
    const sampleSection = `# Custom Section

This is a custom section that you can edit.
It supports full Markdown and will be included in your README.

## Subsection

Add your content here!
`;

    writeFileSync(join(sectionsDir, 'custom.md'), sampleSection, 'utf-8');
}

/**
 * Helper: Get project name from package.json
 */
function getProjectNameFromPackageJson() {
    try {
        const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
        return pkg.name;
    } catch {
        return null;
    }
}

/**
 * Helper: Get description from package.json
 */
function getDescriptionFromPackageJson() {
    try {
        const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
        return pkg.description;
    } catch {
        return null;
    }
}

/**
 * Helper: Get repository from git remote
 */
function getRepoFromGit() {
    try {
        const { execSync } = require('child_process');
        const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
        const match = remote.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
        return match ? match[1].replace(/\.git$/, '') : null;
    } catch {
        return null;
    }
}
