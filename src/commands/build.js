/**
 * Build Command
 * 
 * Compiles components into README.md and supporting assets
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { renderSection } from '../components/index.js';
import { generateNavigation } from '../layouts/navigation.js';
import { generateToc } from '../layouts/toc.js';
import { generateBadgeSection } from '../generators/badges.js';
import { generateLinehookStats } from '../integrations/linehook.js';
import { applyTheme } from '../theme/index.js';

/**
 * Main build function
 */
export async function build(config, options = {}) {
    const result = {
        files: [],
        warnings: [],
        stats: null,
    };

    const outputDir = options.output || '.';
    const assetsDir = join(outputDir, config.output?.assetsDir || 'assets');

    // Clean output if requested
    if (options.clean && existsSync(assetsDir)) {
        rmSync(assetsDir, { recursive: true, force: true });
    }

    // Ensure assets directory exists
    if (options.assets !== false) {
        mkdirSync(assetsDir, { recursive: true });
    }

    // Build sections
    const sections = [];
    const anchors = new Map();

    // Generate linehook stats if enabled
    if (config.linehook?.enabled && options.stats !== false) {
        try {
            result.stats = await generateLinehookStats(config.linehook, assetsDir);
            if (config.linehook.showInReadme) {
                // Stats will be injected into appropriate sections
            }
        } catch (error) {
            result.warnings.push(`linehook stats generation failed: ${error.message}`);
        }
    }

    // Generate badges section
    if (config.badges?.items?.length > 0 || config.badges?.position !== 'none') {
        const badgeSection = await generateBadgeSection(config, result.stats);
        if (config.badges.position === 'top') {
            sections.unshift(badgeSection);
        }
    }

    // Render each section
    for (const sectionConfig of config.sections || []) {
        try {
            const rendered = await renderSection(sectionConfig, {
                config,
                stats: result.stats,
                assetsDir,
                theme: config.theme,
            });

            // Track anchor IDs
            if (sectionConfig.id || sectionConfig.title) {
                const anchorId = sectionConfig.id || slugify(sectionConfig.title);
                anchors.set(anchorId, sectionConfig.title || anchorId);
            }

            sections.push(rendered);
        } catch (error) {
            result.warnings.push(`Failed to render section '${sectionConfig.type}': ${error.message}`);
        }
    }

    // Generate navigation if enabled
    let navigation = '';
    if (config.navigation?.enabled) {
        navigation = generateNavigation(anchors, config.navigation);
    }

    // Generate table of contents if enabled
    let toc = '';
    if (config.toc?.enabled) {
        toc = generateToc(sections, config.toc);
    }

    // Assemble final README
    const parts = [];

    // Add navigation at top if configured
    if (navigation && ['top', 'both'].includes(config.navigation?.position)) {
        parts.push(navigation);
    }

    // Add TOC
    if (toc) {
        parts.push(toc);
    }

    // Add all sections
    parts.push(...sections);

    // Add navigation at bottom if configured
    if (navigation && ['bottom', 'both'].includes(config.navigation?.position)) {
        parts.push(navigation);
    }

    // Apply theme styling
    let readme = parts.join('\n\n');
    readme = applyTheme(readme, config.theme);

    // Minify if requested
    if (options.minify) {
        readme = minifyMarkdown(readme);
    }

    // Write README
    const readmePath = join(outputDir, config.output?.readme || 'README.md');
    writeFileSync(readmePath, readme, 'utf-8');
    result.files.push(readmePath);

    // Validate if requested
    if (options.validate) {
        const validationWarnings = validateGitHubCompatibility(readme);
        result.warnings.push(...validationWarnings);
    }

    return result;
}

/**
 * Slugify text for anchor IDs
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Minify markdown (remove excessive whitespace)
 */
function minifyMarkdown(markdown) {
    return markdown
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+$/gm, '')
        .trim() + '\n';
}

/**
 * Validate GitHub compatibility
 */
function validateGitHubCompatibility(markdown) {
    const warnings = [];

    // Check for potentially unsupported HTML
    const unsupportedTags = ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'];
    for (const tag of unsupportedTags) {
        const regex = new RegExp(`<${tag}[\\s>]`, 'gi');
        if (regex.test(markdown)) {
            warnings.push(`Contains potentially unsupported HTML tag: <${tag}>`);
        }
    }

    // Check for JavaScript URLs
    if (/href\s*=\s*["']javascript:/gi.test(markdown)) {
        warnings.push('Contains JavaScript URLs which will be stripped by GitHub');
    }

    // Check for onclick/onerror handlers
    if (/on\w+\s*=/gi.test(markdown)) {
        warnings.push('Contains event handlers which will be stripped by GitHub');
    }

    // Check for external images without alt text
    if (/<img[^>]+(?!alt=)[^>]*>/gi.test(markdown)) {
        warnings.push('Some images may be missing alt text');
    }

    // Check for very long lines (can cause rendering issues)
    const lines = markdown.split('\n');
    const longLines = lines.filter(line => line.length > 1000);
    if (longLines.length > 0) {
        warnings.push(`${longLines.length} line(s) exceed 1000 characters which may cause rendering issues`);
    }

    return warnings;
}
