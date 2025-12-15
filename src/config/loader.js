/**
 * Configuration Loader
 * 
 * Handles loading and validating doccc configuration files.
 * Supports: doccc.config.js, doccc.config.mjs, doccc.config.yaml, doccc.config.json
 */

import { cosmiconfig } from 'cosmiconfig';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import YAML from 'yaml';

/**
 * Default configuration
 */
export function getDefaultConfig() {
    return {
        // Project metadata
        project: {
            name: '',
            description: '',
            repository: '',
            author: '',
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
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },

        // Component sections (ordered)
        sections: [],

        // Badge configuration
        badges: {
            style: 'flat', // 'flat', 'flat-square', 'plastic', 'for-the-badge'
            position: 'top', // 'top', 'bottom', 'header', 'none'
            items: [],
        },

        // linehook integration
        linehook: {
            enabled: true,
            include: ['**/*.js', '**/*.ts', '**/*.py', '**/*.go', '**/*.rs'],
            exclude: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
            showInReadme: true,
            generateBadges: true,
            generateChart: true,
            chartType: 'languages', // 'languages', 'files', 'lines'
        },

        // knowtif integration
        knowtif: {
            enabled: false,
            events: ['push', 'release'],
            webhook: null,
            email: null,
            includeStats: true,
        },

        // GitHub Actions
        actions: {
            enabled: false,
            schedule: '0 0 * * *', // Daily at midnight
            onPush: true,
            onRelease: true,
            branches: ['main'],
        },

        // Navigation settings
        navigation: {
            enabled: true,
            style: 'anchors', // 'anchors', 'badges', 'table'
            position: 'top', // 'top', 'bottom', 'both'
            sticky: false,
        },

        // Table of contents
        toc: {
            enabled: true,
            title: 'Table of Contents',
            maxDepth: 3,
            collapsible: true,
        },

        // Asset generation
        assets: {
            optimizeImages: true,
            generateSvgFallbacks: true,
            darkModeAssets: true,
        },

        // Plugins
        plugins: [],
    };
}

/**
 * Load configuration from file
 */
export async function loadConfig(configPath = 'doccc.config.js') {
    const explorer = cosmiconfig('doccc', {
        searchPlaces: [
            'doccc.config.js',
            'doccc.config.mjs',
            'doccc.config.cjs',
            'doccc.config.json',
            'doccc.config.yaml',
            'doccc.config.yml',
            '.docccrc',
            '.docccrc.json',
            '.docccrc.yaml',
            '.docccrc.yml',
            '.docccrc.js',
        ],
        loaders: {
            '.yaml': (filepath, content) => YAML.parse(content),
            '.yml': (filepath, content) => YAML.parse(content),
        },
    });

    try {
        let result;

        // If specific path provided, load from there
        if (configPath && configPath !== 'doccc.config.js') {
            const absolutePath = resolve(process.cwd(), configPath);
            if (existsSync(absolutePath)) {
                result = await explorer.load(absolutePath);
            }
        }

        // Otherwise search for config
        if (!result) {
            result = await explorer.search();
        }

        // If no config found, return defaults
        if (!result || result.isEmpty) {
            console.warn('No configuration file found, using defaults');
            return getDefaultConfig();
        }

        // Merge with defaults
        return mergeConfig(getDefaultConfig(), result.config);
    } catch (error) {
        throw new Error(`Failed to load configuration: ${error.message}`);
    }
}

/**
 * Deep merge configuration objects
 */
function mergeConfig(defaults, overrides) {
    const result = { ...defaults };

    for (const key of Object.keys(overrides)) {
        if (overrides[key] !== null && typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
            result[key] = mergeConfig(defaults[key] || {}, overrides[key]);
        } else {
            result[key] = overrides[key];
        }
    }

    return result;
}

/**
 * Validate configuration
 */
export function validateConfig(config) {
    const errors = [];
    const warnings = [];

    // Validate required fields
    if (!config.project?.name) {
        warnings.push('project.name is not set');
    }

    // Validate sections
    if (config.sections && Array.isArray(config.sections)) {
        config.sections.forEach((section, index) => {
            if (!section.type) {
                errors.push(`Section ${index} is missing required 'type' field`);
            }
        });
    }

    // Validate badge style
    const validBadgeStyles = ['flat', 'flat-square', 'plastic', 'for-the-badge'];
    if (config.badges?.style && !validBadgeStyles.includes(config.badges.style)) {
        warnings.push(`Invalid badge style '${config.badges.style}', using 'flat'`);
        config.badges.style = 'flat';
    }

    // Validate theme color scheme
    const validColorSchemes = ['light', 'dark', 'auto'];
    if (config.theme?.colorScheme && !validColorSchemes.includes(config.theme.colorScheme)) {
        warnings.push(`Invalid color scheme '${config.theme.colorScheme}', using 'auto'`);
        config.theme.colorScheme = 'auto';
    }

    // Validate linehook patterns
    if (config.linehook?.include && !Array.isArray(config.linehook.include)) {
        errors.push('linehook.include must be an array of glob patterns');
    }

    // Validate knowtif events
    const validEvents = ['push', 'release', 'pr', 'issue', 'star', 'fork'];
    if (config.knowtif?.events) {
        const invalidEvents = config.knowtif.events.filter(e => !validEvents.includes(e));
        if (invalidEvents.length > 0) {
            warnings.push(`Invalid knowtif events: ${invalidEvents.join(', ')}`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
    }

    return { valid: true, warnings };
}

/**
 * Configuration schema for documentation/validation
 */
export const configSchema = {
    project: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Project name' },
            description: { type: 'string', description: 'Project description' },
            repository: { type: 'string', description: 'GitHub repository URL' },
            author: { type: 'string', description: 'Project author' },
            license: { type: 'string', description: 'Project license' },
        },
    },
    sections: {
        type: 'array',
        items: {
            type: 'object',
            required: ['type'],
            properties: {
                type: {
                    type: 'string',
                    enum: ['hero', 'badges', 'features', 'stats', 'installation', 'usage', 'api', 'faq', 'changelog', 'contributors', 'license', 'custom'],
                },
                id: { type: 'string', description: 'Anchor ID for navigation' },
                title: { type: 'string', description: 'Section title' },
                content: { type: 'object', description: 'Section-specific content' },
            },
        },
    },
};
