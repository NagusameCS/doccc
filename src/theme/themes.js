/**
 * Theme Definitions and Application
 */

export const themes = {
    default: {
        name: 'Default',
        colors: {
            primary: '#0366d6',
            secondary: '#586069',
            accent: '#28a745',
            background: '#ffffff',
            text: '#24292e',
            border: '#e1e4e8',
        },
    },
    dark: {
        name: 'Dark',
        colors: {
            primary: '#58a6ff',
            secondary: '#8b949e',
            accent: '#3fb950',
            background: '#0d1117',
            text: '#c9d1d9',
            border: '#30363d',
        },
    },
    ocean: {
        name: 'Ocean',
        colors: {
            primary: '#0077b6',
            secondary: '#90e0ef',
            accent: '#00b4d8',
            background: '#caf0f8',
            text: '#03045e',
            border: '#48cae4',
        },
    },
    forest: {
        name: 'Forest',
        colors: {
            primary: '#2d6a4f',
            secondary: '#74c69d',
            accent: '#40916c',
            background: '#d8f3dc',
            text: '#1b4332',
            border: '#95d5b2',
        },
    },
    sunset: {
        name: 'Sunset',
        colors: {
            primary: '#e76f51',
            secondary: '#f4a261',
            accent: '#e9c46a',
            background: '#fff8f0',
            text: '#264653',
            border: '#2a9d8f',
        },
    },
    minimal: {
        name: 'Minimal',
        colors: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#333333',
            background: '#ffffff',
            text: '#000000',
            border: '#eeeeee',
        },
    },
};

export function getTheme(name) {
    return themes[name] || themes.default;
}

export function applyTheme(markdown, themeConfig = {}) {
    // Theme application is mostly handled at SVG generation time
    // This function can add theme-specific wrappers or comments

    const { colorScheme = 'auto' } = themeConfig;

    // Add dark/light mode comment for reference
    if (colorScheme === 'auto') {
        const header = '<!-- Supports both light and dark mode -->\n';
        if (!markdown.startsWith('<!--')) {
            markdown = header + markdown;
        }
    }

    return markdown;
}
