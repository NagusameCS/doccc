/**
 * Theme Command
 */

import chalk from 'chalk';
import { themes, getTheme } from '../theme/themes.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

export async function theme(name, options = {}) {
    if (options.list || !name) {
        listThemes();
        return;
    }

    if (options.preview) {
        previewTheme(name);
        return;
    }

    // Apply theme
    applyThemeToConfig(name);
}

function listThemes() {
    console.log(chalk.bold('\n🎨 Available Themes\n'));

    for (const [key, t] of Object.entries(themes)) {
        const colors = Object.entries(t.colors)
            .slice(0, 3)
            .map(([, color]) => chalk.hex(color)('●'))
            .join(' ');

        console.log(`  ${chalk.cyan(key.padEnd(12))} ${t.name.padEnd(15)} ${colors}`);
    }

    console.log('\n  Use:', chalk.gray('doccc theme <name>'), 'to apply');
    console.log('  Preview:', chalk.gray('doccc theme <name> --preview'));
    console.log();
}

function previewTheme(name) {
    const t = getTheme(name);

    console.log(chalk.bold(`\n🎨 ${t.name} Theme\n`));

    for (const [key, color] of Object.entries(t.colors)) {
        const swatch = chalk.bgHex(color)('    ');
        console.log(`  ${key.padEnd(12)} ${swatch} ${chalk.gray(color)}`);
    }

    console.log();
}

function applyThemeToConfig(name) {
    if (!themes[name]) {
        console.log(chalk.red(`Unknown theme: ${name}`));
        listThemes();
        return;
    }

    const configPath = 'doccc.config.js';
    if (!existsSync(configPath)) {
        console.log(chalk.yellow('No doccc.config.js found. Run `doccc init` first.'));
        return;
    }

    let content = readFileSync(configPath, 'utf-8');

    // Update theme name in config
    content = content.replace(
        /theme:\s*\{[\s\S]*?name:\s*['"][\w]+['"]/,
        `theme: {\n    name: '${name}'`
    );

    writeFileSync(configPath, content, 'utf-8');
    console.log(chalk.green(`✓ Theme set to: ${name}`));
}
