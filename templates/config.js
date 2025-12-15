/**
 * doccc Configuration Template
 * 
 * README Website Generator - Compile components into GitHub-safe documentation
 * Documentation: https://github.com/NagusameCS/doccc
 */

export default {
    // Project metadata
    project: {
        name: '{{projectName}}',
        description: '{{description}}',
        repository: 'https://github.com/{{owner}}/{{repo}}',
        author: '{{author}}',
        license: 'MIT',
    },

    // Output settings
    output: {
        readme: 'README.md',
        assetsDir: './assets',
        cleanBefore: false,
    },

    // Theme configuration
    theme: {
        name: 'default',
        colorScheme: 'auto', // 'light', 'dark', 'auto'
        primaryColor: '#0366d6',
        secondaryColor: '#586069',
        accentColor: '#28a745',
    },

    // README sections (in order)
    sections: [
        {
            type: 'hero',
            id: 'hero',
            content: {
                title: '{{projectName}}',
                subtitle: '{{description}}',
                animated: true,
            },
        },
        {
            type: 'badges',
            id: 'badges',
            content: {
                style: 'flat',
                items: [
                    'github-stars',
                    'github-license',
                    'npm-version',
                    'npm-downloads',
                ],
            },
        },
        {
            type: 'features',
            id: 'features',
            title: '✨ Features',
            content: {
                layout: 'grid',
                columns: 3,
                items: [
                    { icon: '🚀', title: 'Fast', description: 'Lightning fast performance' },
                    { icon: '🔧', title: 'Configurable', description: 'Highly customizable' },
                    { icon: '📦', title: 'Modular', description: 'Use only what you need' },
                ],
            },
        },
        {
            type: 'installation',
            id: 'installation',
            title: '📦 Installation',
            content: {
                packageManager: 'auto',
                showAll: true,
            },
        },
        {
            type: 'usage',
            id: 'usage',
            title: '🚀 Usage',
            content: {
                quickStart: `import { something } from '{{projectName}}';

// Your code here`,
                examples: [],
            },
        },
        {
            type: 'license',
            id: 'license',
            title: '📄 License',
            content: {
                type: 'MIT',
                showBadge: true,
            },
        },
    ],

    // linehook integration (code statistics)
    linehook: {
        enabled: true,
        include: ['**/*.js', '**/*.ts', '**/*.py'],
        exclude: ['node_modules/**', 'dist/**', '.git/**'],
        showInReadme: true,
        generateBadges: true,
        generateChart: true,
    },

    // knowtif integration (notifications)
    knowtif: {
        enabled: false,
        events: ['push', 'release'],
        webhook: null,
    },

    // GitHub Actions
    actions: {
        enabled: true,
        schedule: '0 0 * * *',
        onPush: true,
        onRelease: true,
    },

    // Navigation
    navigation: {
        enabled: true,
        style: 'anchors',
        position: 'top',
    },

    // Table of contents
    toc: {
        enabled: true,
        title: 'Table of Contents',
        maxDepth: 3,
        collapsible: true,
    },
};
