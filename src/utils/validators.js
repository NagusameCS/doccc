/**
 * Validators
 */

export function validateMarkdown(content) {
    const warnings = [];
    const errors = [];

    // Check for forbidden HTML tags
    const forbiddenTags = ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'];
    for (const tag of forbiddenTags) {
        if (new RegExp(`<${tag}[\\s>]`, 'gi').test(content)) {
            errors.push(`Contains forbidden HTML tag: <${tag}>`);
        }
    }

    // Check for JavaScript
    if (/javascript:/gi.test(content)) {
        errors.push('Contains JavaScript URLs');
    }

    // Check for event handlers
    if (/\bon\w+\s*=/gi.test(content)) {
        errors.push('Contains event handlers');
    }

    // Check for very long lines
    const lines = content.split('\n');
    const longLines = lines.filter(l => l.length > 1000);
    if (longLines.length > 0) {
        warnings.push(`${longLines.length} lines exceed 1000 characters`);
    }

    // Check for unclosed tags
    const openTags = content.match(/<([a-z]+)[^>]*(?<!\/)\s*>/gi) || [];
    const closeTags = content.match(/<\/([a-z]+)\s*>/gi) || [];
    if (openTags.length !== closeTags.length) {
        warnings.push('Potentially unclosed HTML tags detected');
    }

    return { valid: errors.length === 0, errors, warnings };
}

export function sanitizeHtml(html) {
    // Remove forbidden elements
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');

    // Remove event handlers
    html = html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: URLs
    html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');

    return html;
}
