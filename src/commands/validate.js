/**
 * Validate Command
 */

import { readFileSync, existsSync } from 'fs';
import { validateMarkdown } from '../utils/validators.js';

export async function validate(file = 'README.md', options = {}) {
    if (!existsSync(file)) {
        return { valid: false, errors: [`File not found: ${file}`], warnings: [] };
    }

    const content = readFileSync(file, 'utf-8');
    const result = validateMarkdown(content);

    // Additional GitHub-specific checks
    const githubWarnings = checkGitHubCompatibility(content);
    result.warnings.push(...githubWarnings);

    return result;
}

function checkGitHubCompatibility(content) {
    const warnings = [];

    // Check image sizes
    const imgTags = content.match(/<img[^>]+>/gi) || [];
    for (const img of imgTags) {
        if (!img.includes('alt=')) {
            warnings.push('Image missing alt attribute');
        }
    }

    // Check for data URLs (can be large)
    if (/src\s*=\s*["']data:/gi.test(content)) {
        warnings.push('Contains data URLs which may increase file size');
    }

    // Check for external resources that might be blocked
    if (/src\s*=\s*["']http(?!s)/gi.test(content)) {
        warnings.push('Contains HTTP (non-HTTPS) resources which may be blocked');
    }

    // Check details/summary usage
    const details = (content.match(/<details>/gi) || []).length;
    const summaries = (content.match(/<summary>/gi) || []).length;
    if (details !== summaries) {
        warnings.push('Mismatch between <details> and <summary> tags');
    }

    // Check anchor validity
    const anchors = content.match(/\[([^\]]+)\]\(#([^)]+)\)/g) || [];
    for (const anchor of anchors) {
        const match = anchor.match(/\]\(#([^)]+)\)/);
        if (match) {
            const id = match[1];
            const idPattern = new RegExp(`id\\s*=\\s*["']${id}["']|^#{1,6}\\s+.*${id}`, 'gim');
            if (!idPattern.test(content)) {
                warnings.push(`Anchor link #${id} may be broken`);
            }
        }
    }

    return warnings;
}
