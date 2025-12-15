/**
 * Watch Command
 * 
 * Watch for file changes and rebuild automatically
 */

import { watch as fsWatch } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';
import { build } from './build.js';

/**
 * Watch for changes and rebuild
 */
export async function watch(config, options = {}) {
    const watchPaths = [
        'doccc.config.js',
        'doccc.config.mjs',
        'doccc.config.yaml',
        'docs/**/*',
        'assets/**/*',
    ];

    let isBuilding = false;
    let pendingBuild = false;

    const doBuild = async () => {
        if (isBuilding) {
            pendingBuild = true;
            return;
        }

        isBuilding = true;
        console.log(chalk.blue('Building...'));

        try {
            const result = await build(config, options);
            console.log(chalk.green(`✓ Built ${result.files.length} file(s)`));

            if (result.warnings.length > 0) {
                result.warnings.forEach(w => console.log(chalk.yellow(`  ⚠ ${w}`)));
            }
        } catch (error) {
            console.error(chalk.red(`✗ Build failed: ${error.message}`));
        }

        isBuilding = false;

        if (pendingBuild) {
            pendingBuild = false;
            doBuild();
        }
    };

    // Initial build
    await doBuild();

    // Watch for changes
    console.log(chalk.gray('\nWatching for changes...\n'));

    const watcher = fsWatch('.', { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // Ignore generated files and hidden directories
        if (
            filename.startsWith('.git') ||
            filename.startsWith('node_modules') ||
            filename === 'README.md'
        ) {
            return;
        }

        // Check if file matches watch patterns
        const shouldRebuild = watchPaths.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(
                    '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
                );
                return regex.test(filename);
            }
            return filename === pattern;
        });

        if (shouldRebuild) {
            console.log(chalk.gray(`  → ${filename} changed`));
            doBuild();
        }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log(chalk.gray('\n\nStopping watch...\n'));
        watcher.close();
        process.exit(0);
    });

    // Keep process alive
    return new Promise(() => { });
}
