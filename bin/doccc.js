#!/usr/bin/env node

/**
 * doccc - README Website Generator CLI
 * 
 * Compiles config-driven components into GitHub-safe, visually rich documentation.
 * Treats README as a compiled artifact, not a hand-written document.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import figures from 'figures';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

import { loadConfig, validateConfig } from '../src/config/loader.js';
import { build } from '../src/commands/build.js';
import { init } from '../src/commands/init.js';
import { watch } from '../src/commands/watch.js';
import { preview } from '../src/commands/preview.js';
import { generate } from '../src/commands/generate.js';
import { stats } from '../src/commands/stats.js';
import { notify } from '../src/commands/notify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

// ASCII banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('doccc')} ${chalk.gray('- README Website Generator')}                        ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Compile components into GitHub-safe documentation')}        ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
`;

program
    .name('doccc')
    .description('A README website generator that compiles config-driven components into GitHub-safe documentation')
    .version(pkg.version, '-v, --version', 'Display version number')
    .addHelpText('beforeAll', banner);

// ============================================================================
// INIT COMMAND
// ============================================================================
program
    .command('init')
    .description('Initialize a new doccc project with config and templates')
    .option('-t, --template <template>', 'Project template (minimal, standard, full)', 'standard')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .option('--with-actions', 'Include GitHub Actions for auto-regeneration')
    .option('--with-notifications', 'Setup knowtif notifications')
    .action(async (options) => {
        console.log(banner);
        const spinner = ora('Initializing doccc project...').start();
        try {
            await init(options);
            spinner.succeed(chalk.green('Project initialized successfully!'));
            console.log(`\n${figures.pointer} Run ${chalk.cyan('doccc build')} to generate your README`);
        } catch (error) {
            spinner.fail(chalk.red('Initialization failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// ============================================================================
// BUILD COMMAND
// ============================================================================
program
    .command('build')
    .description('Compile components into README.md and assets')
    .option('-c, --config <path>', 'Path to config file', 'doccc.config.js')
    .option('-o, --output <path>', 'Output directory', '.')
    .option('--clean', 'Clean output directory before building')
    .option('--no-assets', 'Skip asset generation (SVGs, images)')
    .option('--no-stats', 'Skip linehook stats generation')
    .option('--minify', 'Minify output markdown')
    .option('--validate', 'Validate GitHub compatibility after build')
    .action(async (options) => {
        const spinner = ora('Building README...').start();
        try {
            const config = await loadConfig(options.config);
            validateConfig(config);
            const result = await build(config, options);
            spinner.succeed(chalk.green(`README built successfully!`));
            console.log(`\n${figures.tick} Generated: ${chalk.cyan(result.files.join(', '))}`);
            if (result.warnings.length > 0) {
                console.log(`\n${figures.warning} Warnings:`);
                result.warnings.forEach(w => console.log(chalk.yellow(`  ${figures.pointer} ${w}`)));
            }
        } catch (error) {
            spinner.fail(chalk.red('Build failed'));
            console.error(chalk.red(error.message));
            if (process.env.DEBUG) console.error(error.stack);
            process.exit(1);
        }
    });

// ============================================================================
// WATCH COMMAND
// ============================================================================
program
    .command('watch')
    .description('Watch for changes and rebuild automatically')
    .option('-c, --config <path>', 'Path to config file', 'doccc.config.js')
    .option('-o, --output <path>', 'Output directory', '.')
    .action(async (options) => {
        console.log(banner);
        console.log(chalk.gray('Watching for changes... Press Ctrl+C to stop\n'));
        try {
            const config = await loadConfig(options.config);
            await watch(config, options);
        } catch (error) {
            console.error(chalk.red('Watch failed:', error.message));
            process.exit(1);
        }
    });

// ============================================================================
// PREVIEW COMMAND
// ============================================================================
program
    .command('preview')
    .description('Start a local preview server with live reload')
    .option('-p, --port <port>', 'Preview server port', '3000')
    .option('-c, --config <path>', 'Path to config file', 'doccc.config.js')
    .option('--open', 'Open browser automatically')
    .action(async (options) => {
        console.log(banner);
        try {
            const config = await loadConfig(options.config);
            await preview(config, options);
        } catch (error) {
            console.error(chalk.red('Preview failed:', error.message));
            process.exit(1);
        }
    });

// ============================================================================
// GENERATE COMMAND (Component Generator)
// ============================================================================
program
    .command('generate <component>')
    .alias('g')
    .description('Generate a new component (hero, stats, features, faq, etc.)')
    .option('-n, --name <name>', 'Component instance name')
    .option('--append', 'Append to existing config instead of creating new')
    .action(async (component, options) => {
        const spinner = ora(`Generating ${component} component...`).start();
        try {
            await generate(component, options);
            spinner.succeed(chalk.green(`Component ${component} generated!`));
        } catch (error) {
            spinner.fail(chalk.red('Generation failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// ============================================================================
// STATS COMMAND (linehook integration)
// ============================================================================
program
    .command('stats')
    .description('Generate code statistics and badges using linehook')
    .option('-f, --format <format>', 'Output format (badge, svg, json, markdown)', 'badge')
    .option('-o, --output <path>', 'Output path for generated files', './assets')
    .option('--include <patterns>', 'File patterns to include (comma-separated)')
    .option('--exclude <patterns>', 'File patterns to exclude (comma-separated)')
    .option('--theme <theme>', 'Badge/SVG theme (light, dark, auto)', 'auto')
    .option('--style <style>', 'Badge style (flat, flat-square, plastic, for-the-badge)', 'flat')
    .action(async (options) => {
        const spinner = ora('Generating code statistics...').start();
        try {
            const result = await stats(options);
            spinner.succeed(chalk.green('Statistics generated!'));
            console.log(`\n${chalk.bold('Code Statistics:')}`);
            console.log(`  ${figures.pointer} Total Files: ${chalk.cyan(result.totalFiles)}`);
            console.log(`  ${figures.pointer} Total Lines: ${chalk.cyan(result.totalLines)}`);
            console.log(`  ${figures.pointer} Code Lines: ${chalk.cyan(result.codeLines)}`);
            console.log(`  ${figures.pointer} Languages: ${chalk.cyan(Object.keys(result.languages).join(', '))}`);
            if (result.outputFiles.length > 0) {
                console.log(`\n${figures.tick} Generated: ${chalk.cyan(result.outputFiles.join(', '))}`);
            }
        } catch (error) {
            spinner.fail(chalk.red('Stats generation failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// ============================================================================
// NOTIFY COMMAND (knowtif integration)
// ============================================================================
program
    .command('notify')
    .description('Configure GitHub event notifications using knowtif')
    .option('--setup', 'Interactive notification setup')
    .option('--test', 'Send a test notification')
    .option('--events <events>', 'Events to monitor (push, release, pr, issue)', 'push,release')
    .option('--webhook <url>', 'Webhook URL for notifications')
    .option('--email <email>', 'Email for notifications')
    .action(async (options) => {
        const spinner = ora('Configuring notifications...').start();
        try {
            if (options.setup) {
                spinner.stop();
                await notify({ ...options, interactive: true });
            } else {
                await notify(options);
                spinner.succeed(chalk.green('Notifications configured!'));
            }
        } catch (error) {
            spinner.fail(chalk.red('Notification setup failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// ============================================================================
// ACTIONS COMMAND (GitHub Actions generator)
// ============================================================================
program
    .command('actions')
    .description('Generate GitHub Actions workflow for auto-regeneration')
    .option('-s, --schedule <cron>', 'Cron schedule for regeneration', '0 0 * * *')
    .option('--on-push', 'Regenerate on push to main')
    .option('--on-release', 'Regenerate on new release')
    .option('--with-stats', 'Include linehook stats regeneration')
    .option('--with-notify', 'Include knowtif notifications')
    .action(async (options) => {
        const spinner = ora('Generating GitHub Actions workflow...').start();
        try {
            const { generateActions } = await import('../src/commands/actions.js');
            await generateActions(options);
            spinner.succeed(chalk.green('GitHub Actions workflow generated!'));
            console.log(`\n${figures.tick} Created: ${chalk.cyan('.github/workflows/doccc.yml')}`);
        } catch (error) {
            spinner.fail(chalk.red('Actions generation failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// ============================================================================
// VALIDATE COMMAND
// ============================================================================
program
    .command('validate [file]')
    .description('Validate README for GitHub compatibility')
    .option('--strict', 'Fail on warnings')
    .action(async (file = 'README.md', options) => {
        const spinner = ora('Validating README...').start();
        try {
            const { validate } = await import('../src/commands/validate.js');
            const result = await validate(file, options);
            if (result.errors.length > 0) {
                spinner.fail(chalk.red('Validation failed'));
                result.errors.forEach(e => console.log(chalk.red(`  ${figures.cross} ${e}`)));
                process.exit(1);
            } else if (result.warnings.length > 0 && options.strict) {
                spinner.warn(chalk.yellow('Validation passed with warnings'));
                result.warnings.forEach(w => console.log(chalk.yellow(`  ${figures.warning} ${w}`)));
                process.exit(1);
            } else {
                spinner.succeed(chalk.green('README is GitHub-compatible!'));
                if (result.warnings.length > 0) {
                    result.warnings.forEach(w => console.log(chalk.yellow(`  ${figures.warning} ${w}`)));
                }
            }
        } catch (error) {
            spinner.fail(chalk.red('Validation failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// ============================================================================
// THEME COMMAND
// ============================================================================
program
    .command('theme [name]')
    .description('List, preview, or apply themes')
    .option('-l, --list', 'List available themes')
    .option('-p, --preview', 'Preview theme colors')
    .action(async (name, options) => {
        try {
            const { theme } = await import('../src/commands/theme.js');
            await theme(name, options);
        } catch (error) {
            console.error(chalk.red('Theme command failed:', error.message));
            process.exit(1);
        }
    });

// Parse and execute
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
    console.log(banner);
    program.outputHelp();
}
