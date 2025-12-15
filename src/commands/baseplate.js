/**
 * Baseplate CLI Command
 * 
 * Commands for managing and using baseplates.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import baseplates from '../baseplates/index.js';

/**
 * Create the baseplate command
 * @returns {Command} The baseplate command
 */
export function createBaseplateCommand() {
    const command = new Command('baseplate');

    command
        .description('Manage and use baseplate templates')
        .addCommand(createListCommand())
        .addCommand(createInfoCommand())
        .addCommand(createUseCommand())
        .addCommand(createCategoriesCommand());

    return command;
}

/**
 * List baseplates command
 */
function createListCommand() {
    return new Command('list')
        .alias('ls')
        .description('List available baseplates')
        .option('-c, --category <category>', 'Filter by category')
        .option('-j, --json', 'Output as JSON')
        .action(async (options) => {
            try {
                const list = baseplates.listBaseplates({
                    category: options.category
                });

                if (options.json) {
                    console.log(JSON.stringify(list, null, 2));
                    return;
                }

                if (list.length === 0) {
                    console.log(chalk.yellow('No baseplates found.'));
                    return;
                }

                console.log(chalk.bold('\nAvailable Baseplates:\n'));

                // Group by category
                const grouped = {};
                for (const bp of list) {
                    if (!grouped[bp.category]) {
                        grouped[bp.category] = [];
                    }
                    grouped[bp.category].push(bp);
                }

                for (const [category, bps] of Object.entries(grouped)) {
                    console.log(chalk.cyan.bold(`  ${category.toUpperCase()}`));

                    for (const bp of bps) {
                        console.log(`    ${chalk.green(bp.id.padEnd(25))} ${chalk.gray(bp.description || '')}`);
                    }
                    console.log();
                }

                console.log(chalk.gray(`Total: ${list.length} baseplates`));

            } catch (error) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });
}

/**
 * Show baseplate info command
 */
function createInfoCommand() {
    return new Command('info')
        .description('Show detailed information about a baseplate')
        .argument('<id>', 'Baseplate ID')
        .option('-j, --json', 'Output as JSON')
        .action(async (id, options) => {
            try {
                const info = baseplates.getBaseplateInfo(id);

                if (!info) {
                    console.error(chalk.red(`Baseplate not found: ${id}`));
                    console.log(chalk.gray('Use "doccc baseplate list" to see available baseplates.'));
                    process.exit(1);
                }

                if (options.json) {
                    console.log(JSON.stringify(info, null, 2));
                    return;
                }

                console.log(chalk.bold(`\n${info.name}\n`));
                console.log(`  ${chalk.cyan('ID:')}          ${info.id}`);
                console.log(`  ${chalk.cyan('Category:')}    ${info.category}`);
                console.log(`  ${chalk.cyan('Description:')} ${info.description || 'N/A'}`);
                console.log(`  ${chalk.cyan('File:')}        ${info.file}`);
                console.log(`  ${chalk.cyan('Dimensions:')}  ${info.width}x${info.height}`);

                if (info.customizable && info.customizable.length > 0) {
                    console.log(`  ${chalk.cyan('Customizable Fields:')}`);
                    for (const field of info.customizable) {
                        console.log(`    - ${chalk.green(field.name)} (${field.type}): ${chalk.gray(field.description || '')}`);
                    }
                }

                if (info.animations && info.animations.length > 0) {
                    console.log(`  ${chalk.cyan('Animations:')} ${info.animations.join(', ')}`);
                }

                console.log();

            } catch (error) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });
}

/**
 * Use baseplate command
 */
function createUseCommand() {
    return new Command('use')
        .description('Use a baseplate in your project')
        .argument('<id>', 'Baseplate ID')
        .option('-o, --output <path>', 'Output file path')
        .option('-i, --interactive', 'Interactive customization mode')
        .option('--data-url', 'Output as data URL')
        .action(async (id, options) => {
            try {
                const info = baseplates.getBaseplateInfo(id);

                if (!info) {
                    console.error(chalk.red(`Baseplate not found: ${id}`));
                    process.exit(1);
                }

                let customizations = {};

                // Interactive mode
                if (options.interactive && info.customizable) {
                    console.log(chalk.bold(`\nCustomize ${info.name}:\n`));

                    const questions = info.customizable.map(field => ({
                        type: field.type === 'color' ? 'input' : 'input',
                        name: field.name,
                        message: field.description || field.name,
                        default: field.default
                    }));

                    customizations = await inquirer.prompt(questions);
                }

                const spinner = ora('Loading baseplate...').start();

                let output;
                if (options.dataUrl) {
                    output = baseplates.getBaseplateDataUrl(id, customizations);
                } else {
                    output = Object.keys(customizations).length > 0
                        ? baseplates.useBaseplate(id, customizations)
                        : baseplates.loadBaseplate(id);
                }

                if (options.output) {
                    await fs.outputFile(options.output, output);
                    spinner.succeed(`Saved to ${chalk.green(options.output)}`);
                } else {
                    spinner.stop();
                    console.log(output);
                }

            } catch (error) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });
}

/**
 * List categories command
 */
function createCategoriesCommand() {
    return new Command('categories')
        .description('List baseplate categories')
        .option('-j, --json', 'Output as JSON')
        .action(async (options) => {
            try {
                const categories = baseplates.getCategories();

                if (options.json) {
                    console.log(JSON.stringify(categories, null, 2));
                    return;
                }

                console.log(chalk.bold('\nBaseplate Categories:\n'));

                for (const cat of categories) {
                    console.log(`  ${chalk.cyan(cat.id.padEnd(15))} ${cat.name}`);
                    if (cat.description) {
                        console.log(`  ${' '.repeat(15)} ${chalk.gray(cat.description)}`);
                    }
                }

                console.log();

            } catch (error) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });
}

export default createBaseplateCommand;
