/**
 * doccc Configuration Example
 * 
 * This is an example configuration file showing all available options.
 * Copy this to your project root as `doccc.config.js` and customize it.
 */

export default {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PROJECT METADATA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    project: {
        name: 'my-project',
        description: 'An awesome project built with doccc',
        version: '1.0.0',
        repository: 'https://github.com/username/my-project',
        homepage: 'https://my-project.dev',
        author: 'Your Name',
        license: 'MIT',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OUTPUT CONFIGURATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    output: {
        readme: 'README.md',
        assets: './assets',
        badges: './.linehook/badges',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // THEME CONFIGURATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    theme: {
        name: 'default', // default, dark, ocean, forest, sunset, minimal
        colors: {
            primary: '#0366d6',
            secondary: '#586069',
            accent: '#28a745',
        },
        darkMode: {
            enabled: true,
            // Uses GitHub's prefers-color-scheme detection
        },
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // README SECTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    sections: [
        // Hero Section - Animated header with gradient
        {
            type: 'hero',
            content: {
                title: 'My Awesome Project',
                subtitle: 'Building the future, one commit at a time',
                animated: true,
                gradient: {
                    from: '#667eea',
                    to: '#764ba2',
                    angle: 135,
                },
                darkMode: true, // Generate separate dark mode SVG
            },
        },

        // Badge Row
        {
            type: 'badges',
            content: {
                style: 'for-the-badge',
                align: 'center',
                items: [
                    { type: 'github-stars', repo: 'username/repo' },
                    { type: 'npm-version', package: 'my-project' },
                    { type: 'npm-downloads', package: 'my-project' },
                    { type: 'license', license: 'MIT' },
                    { type: 'build-status', repo: 'username/repo' },
                ],
            },
        },

        // Code Statistics (powered by linehook)
        {
            type: 'stats',
            content: {
                showLanguages: true,
                showLineCount: true,
                showFileCount: true,
                chartType: 'breakdown', // breakdown, pie, treemap
                animated: true,
                theme: 'github',
            },
        },

        // Feature Grid
        {
            type: 'features',
            title: '✨ Features',
            content: {
                layout: 'grid',
                columns: 3,
                items: [
                    {
                        icon: '🚀',
                        title: 'Lightning Fast',
                        description: 'Built for performance with zero runtime overhead',
                    },
                    {
                        icon: '🎨',
                        title: 'Beautiful Output',
                        description: 'Animated SVGs, dark mode, GitHub-optimized',
                    },
                    {
                        icon: '⚡',
                        title: 'Easy to Use',
                        description: 'Simple config, powerful results',
                    },
                ],
            },
        },

        // Installation Section
        {
            type: 'installation',
            content: {
                managers: ['npm', 'yarn', 'pnpm', 'bun'],
                global: true,
                animated: true, // Animated terminal SVG
            },
        },

        // Usage Examples
        {
            type: 'usage',
            content: {
                quickStart: `import { build } from 'my-project';

const result = await build({
  input: './src',
  output: './dist'
});

console.log('Build complete!');`,
                examples: [
                    {
                        title: 'Basic Usage',
                        description: 'Get started with a simple configuration',
                        language: 'javascript',
                        code: `import { init } from 'my-project';
await init();`,
                    },
                    {
                        title: 'Advanced Configuration',
                        description: 'Full control over the build process',
                        language: 'javascript',
                        code: `import { build } from 'my-project';
await build({
  mode: 'production',
  sourceMaps: true,
  minify: true,
});`,
                    },
                ],
            },
        },

        // API Documentation
        {
            type: 'api',
            content: {
                source: 'manual', // or 'jsdoc' for auto-generation
                sections: [
                    {
                        name: 'build(options)',
                        description: 'Compiles the project with the given options.',
                        signature: 'function build(options: BuildOptions): Promise<BuildResult>',
                        params: [
                            { name: 'options', type: 'BuildOptions', description: 'Build configuration object' },
                        ],
                        returns: 'Promise<BuildResult>',
                        example: `await build({ minify: true });`,
                    },
                ],
            },
        },

        // FAQ Section
        {
            type: 'faq',
            content: {
                collapsible: true,
                items: [
                    {
                        question: 'How do I get started?',
                        answer: 'Install the package with `npm install -g my-project`, then run `my-project init` in your project directory.',
                    },
                    {
                        question: 'Does it support TypeScript?',
                        answer: 'Yes! Full TypeScript support is included out of the box.',
                    },
                    {
                        question: 'Can I customize the output?',
                        answer: 'Absolutely. Check the configuration section for all available options.',
                    },
                ],
            },
        },

        // Roadmap/Timeline
        {
            type: 'timeline',
            title: '📅 Roadmap',
            content: {
                style: 'table', // or 'vertical'
                items: [
                    { title: 'Initial release', date: 'Q1 2024', done: true },
                    { title: 'Plugin system', date: 'Q2 2024', inProgress: true },
                    { title: 'Web editor', date: 'Q3 2024', done: false },
                    { title: 'AI integration', date: 'Q4 2024', done: false },
                ],
            },
        },

        // Contributors Section
        {
            type: 'contributors',
            content: {
                source: 'github', // Uses contrib.rocks
                columns: 7,
            },
        },

        // License Section
        {
            type: 'license',
            content: {
                type: 'MIT',
                showBadge: true,
                showFullText: false,
            },
        },
    ],

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LINEHOOK INTEGRATION (Code Statistics)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    linehook: {
        enabled: true,
        badges: {
            enabled: true,
            style: 'for-the-badge',
            animated: true,
            theme: 'github',
            types: ['lines', 'code', 'files', 'languages'],
        },
        charts: {
            enabled: true,
            types: ['breakdown', 'pie', 'treemap'],
            theme: 'github',
        },
        include: ['src/**/*', 'lib/**/*'],
        exclude: ['node_modules/**', 'dist/**', 'coverage/**'],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // KNOWTIF INTEGRATION (Notifications)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    knowtif: {
        enabled: false, // Enable to set up notifications
        events: ['push', 'release', 'star'],
        webhooks: {
            discord: process.env.DISCORD_WEBHOOK,
            slack: process.env.SLACK_WEBHOOK,
        },
        email: {
            enabled: false,
            smtp: {
                host: 'smtp.example.com',
                port: 587,
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            recipients: ['dev@example.com'],
        },
        includeStats: true,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GITHUB ACTIONS INTEGRATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    actions: {
        enabled: true,
        events: ['push', 'schedule'],
        schedule: '0 0 * * 0', // Weekly on Sunday at midnight
        branch: 'main',
        commitMessage: 'chore: regenerate README [skip ci]',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NAVIGATION & TOC
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    navigation: {
        enabled: true,
        style: 'anchors', // anchors, badges, table
        position: 'top',
    },

    toc: {
        enabled: true,
        title: 'Table of Contents',
        maxDepth: 3,
        collapsible: true,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PLUGIN SYSTEM
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    plugins: [
        // Plugins extend doccc functionality
        // Example: 'doccc-plugin-changelog',
        // Example: ['doccc-plugin-custom', { option: 'value' }],
    ],
};
