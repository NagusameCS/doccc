/**
 * linehook Integration
 * 
 * Code statistics, badges, and graphs for any project
 * Integrates with the linehook npm package
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import fg from 'fast-glob';

/**
 * Language detection by file extension
 */
const LANGUAGE_MAP = {
    '.js': 'JavaScript',
    '.mjs': 'JavaScript',
    '.cjs': 'JavaScript',
    '.jsx': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.kt': 'Kotlin',
    '.swift': 'Swift',
    '.c': 'C',
    '.cpp': 'C++',
    '.cc': 'C++',
    '.h': 'C/C++ Header',
    '.hpp': 'C++ Header',
    '.cs': 'C#',
    '.php': 'PHP',
    '.vue': 'Vue',
    '.svelte': 'Svelte',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'Sass',
    '.less': 'Less',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.md': 'Markdown',
    '.sql': 'SQL',
    '.sh': 'Shell',
    '.bash': 'Shell',
    '.zsh': 'Shell',
    '.ps1': 'PowerShell',
    '.r': 'R',
    '.lua': 'Lua',
    '.ex': 'Elixir',
    '.exs': 'Elixir',
    '.erl': 'Erlang',
    '.hs': 'Haskell',
    '.ml': 'OCaml',
    '.fs': 'F#',
    '.clj': 'Clojure',
    '.scala': 'Scala',
    '.pl': 'Perl',
    '.dart': 'Dart',
    '.nim': 'Nim',
    '.zig': 'Zig',
    '.v': 'V',
    '.sol': 'Solidity',
};

/**
 * Language colors for charts
 */
const LANGUAGE_COLORS = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Java': '#b07219',
    'Kotlin': '#A97BFF',
    'Swift': '#F05138',
    'C': '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Vue': '#41b883',
    'Svelte': '#ff3e00',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'SCSS': '#c6538c',
    'JSON': '#292929',
    'YAML': '#cb171e',
    'Markdown': '#083fa1',
    'Shell': '#89e051',
    'R': '#198CE7',
    'Elixir': '#6e4a7e',
    'Haskell': '#5e5086',
    'Scala': '#c22d40',
    'Dart': '#00B4AB',
    'Solidity': '#AA6746',
};

/**
 * Generate code statistics using linehook
 */
export async function generateLinehookStats(config, outputDir) {
    const include = config.include || ['**/*.js', '**/*.ts', '**/*.py', '**/*.go', '**/*.rs'];
    const exclude = config.exclude || ['node_modules/**', 'dist/**', '.git/**', 'build/**'];

    try {
        // Try to use linehook CLI if available
        const linehookStats = await tryLinehookCLI(include, exclude);
        if (linehookStats) {
            return processLinehookOutput(linehookStats, config, outputDir);
        }
    } catch (e) {
        // Fall back to internal implementation
    }

    // Internal implementation
    return await calculateStats(include, exclude, config, outputDir);
}

/**
 * Try to use linehook CLI
 */
async function tryLinehookCLI(include, exclude) {
    try {
        const result = execSync('npx linehook stats --json 2>/dev/null', {
            encoding: 'utf-8',
            timeout: 30000,
        });
        return JSON.parse(result);
    } catch {
        return null;
    }
}

/**
 * Process linehook output
 */
function processLinehookOutput(stats, config, outputDir) {
    // linehook returns stats in its own format, normalize it
    return {
        totalFiles: stats.totalFiles || stats.files || 0,
        totalLines: stats.totalLines || stats.lines || 0,
        codeLines: stats.codeLines || stats.code || 0,
        commentLines: stats.commentLines || stats.comments || 0,
        blankLines: stats.blankLines || stats.blank || 0,
        languages: stats.languages || stats.byLanguage || {},
        generated: new Date().toISOString(),
    };
}

/**
 * Calculate stats internally (fallback)
 */
async function calculateStats(include, exclude, config, outputDir) {
    const { readFileSync } = await import('fs');
    const { extname } = await import('path');

    // Find all matching files
    const files = await fg(include, {
        ignore: exclude,
        dot: false,
        onlyFiles: true,
    });

    const stats = {
        totalFiles: 0,
        totalLines: 0,
        codeLines: 0,
        commentLines: 0,
        blankLines: 0,
        languages: {},
    };

    for (const file of files) {
        try {
            const content = readFileSync(file, 'utf-8');
            const lines = content.split('\n');
            const ext = extname(file).toLowerCase();
            const language = LANGUAGE_MAP[ext] || 'Other';

            stats.totalFiles++;
            stats.totalLines += lines.length;

            // Initialize language stats
            if (!stats.languages[language]) {
                stats.languages[language] = {
                    files: 0,
                    lines: 0,
                    code: 0,
                    comments: 0,
                    blank: 0,
                    color: LANGUAGE_COLORS[language] || '#8b8b8b',
                };
            }

            stats.languages[language].files++;
            stats.languages[language].lines += lines.length;

            // Analyze lines
            let inBlockComment = false;
            for (const line of lines) {
                const trimmed = line.trim();

                // Blank line
                if (trimmed === '') {
                    stats.blankLines++;
                    stats.languages[language].blank++;
                    continue;
                }

                // Check for block comment start/end
                if (trimmed.startsWith('/*') || trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
                    inBlockComment = true;
                }

                // Comment line
                if (
                    inBlockComment ||
                    trimmed.startsWith('//') ||
                    trimmed.startsWith('#') ||
                    trimmed.startsWith('--')
                ) {
                    stats.commentLines++;
                    stats.languages[language].comments++;
                } else {
                    stats.codeLines++;
                    stats.languages[language].code++;
                }

                // Check for block comment end
                if (trimmed.endsWith('*/') || trimmed.endsWith('"""') || trimmed.endsWith("'''")) {
                    inBlockComment = false;
                }
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }

    stats.generated = new Date().toISOString();

    // Generate output files if needed
    if (config.generateBadges && outputDir) {
        await generateLinehookBadges(stats, outputDir, config);
    }

    if (config.generateChart && outputDir) {
        await generateLinehookChart(stats, outputDir, config);
    }

    return stats;
}

/**
 * Generate badges from stats
 */
async function generateLinehookBadges(stats, outputDir, config) {
    const { generateStatsBadges } = await import('../generators/svg/stats.js');

    const badges = await generateStatsBadges(stats, {
        style: config.badgeStyle || 'flat',
        theme: config.theme || 'auto',
    });

    mkdirSync(outputDir, { recursive: true });

    for (const [name, svg] of Object.entries(badges)) {
        writeFileSync(join(outputDir, `${name}.svg`), svg, 'utf-8');
    }
}

/**
 * Generate chart from stats
 */
async function generateLinehookChart(stats, outputDir, config) {
    const { generateStatsChart } = await import('../generators/svg/stats.js');

    const chartType = config.chartType || 'languages';
    const svg = await generateStatsChart(stats, {
        type: chartType,
        theme: config.theme || 'auto',
        width: config.chartWidth || 400,
        height: config.chartHeight || 200,
    });

    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, `stats-${chartType}.svg`), svg, 'utf-8');
}

/**
 * Get language color
 */
export function getLanguageColor(language) {
    return LANGUAGE_COLORS[language] || '#8b8b8b';
}

/**
 * Format line count for display
 */
export function formatLineCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}
