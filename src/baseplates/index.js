/**
 * Baseplate Loader
 * 
 * Utilities for loading and using baseplates in doccc projects.
 * Baseplates are pre-built SVG templates that can be customized.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASEPLATES_DIR = join(__dirname, '../../baseplates');
const CATALOG_PATH = join(BASEPLATES_DIR, 'baseplates.json');

// Cache for loaded baseplates
const baseplateCache = new Map();
let catalogCache = null;

/**
 * Get the baseplates catalog
 * @returns {Object} The baseplates catalog with metadata
 */
export function getCatalog() {
    if (catalogCache) {
        return catalogCache;
    }

    try {
        const content = readFileSync(CATALOG_PATH, 'utf-8');
        catalogCache = JSON.parse(content);
        return catalogCache;
    } catch (error) {
        throw new Error(`Failed to load baseplates catalog: ${error.message}`);
    }
}

/**
 * Get all available categories
 * @returns {Array} List of category objects
 */
export function getCategories() {
    const catalog = getCatalog();
    return catalog.categories || [];
}

/**
 * Get all available animations
 * @returns {Object} Animation definitions
 */
export function getAnimations() {
    const catalog = getCatalog();
    return catalog.animations || {};
}

/**
 * List all baseplates
 * @param {Object} options - Filter options
 * @param {string} options.category - Filter by category
 * @returns {Array} List of baseplate metadata
 */
export function listBaseplates(options = {}) {
    const catalog = getCatalog();
    let baseplates = catalog.baseplates || [];

    if (options.category) {
        baseplates = baseplates.filter(bp => bp.category === options.category);
    }

    return baseplates;
}

/**
 * Get baseplate metadata by ID
 * @param {string} id - Baseplate ID
 * @returns {Object|null} Baseplate metadata or null if not found
 */
export function getBaseplateInfo(id) {
    const catalog = getCatalog();
    return catalog.baseplates.find(bp => bp.id === id) || null;
}

/**
 * Load a baseplate SVG by ID
 * @param {string} id - Baseplate ID
 * @returns {string} SVG content
 */
export function loadBaseplate(id) {
    // Check cache
    if (baseplateCache.has(id)) {
        return baseplateCache.get(id);
    }

    const info = getBaseplateInfo(id);
    if (!info) {
        throw new Error(`Baseplate not found: ${id}`);
    }

    const svgPath = join(BASEPLATES_DIR, info.file);

    if (!existsSync(svgPath)) {
        throw new Error(`Baseplate file not found: ${info.file}`);
    }

    const content = readFileSync(svgPath, 'utf-8');
    baseplateCache.set(id, content);

    return content;
}

/**
 * Load and customize a baseplate
 * @param {string} id - Baseplate ID
 * @param {Object} customizations - Field customizations
 * @returns {string} Customized SVG content
 */
export function useBaseplate(id, customizations = {}) {
    let svg = loadBaseplate(id);

    // Apply text customizations
    for (const [field, value] of Object.entries(customizations)) {
        // Replace data-field content
        const fieldRegex = new RegExp(
            `(<[^>]+data-field="${field}"[^>]*>)([^<]*)(<\/[^>]+>)`,
            'g'
        );
        svg = svg.replace(fieldRegex, `$1${escapeXml(value)}$3`);
    }

    return svg;
}

/**
 * Load all baseplates in a category
 * @param {string} category - Category ID
 * @returns {Array} Array of {id, info, svg} objects
 */
export function loadCategory(category) {
    const baseplates = listBaseplates({ category });
    return baseplates.map(bp => ({
        id: bp.id,
        info: bp,
        svg: loadBaseplate(bp.id)
    }));
}

/**
 * Get baseplate as a data URL for embedding
 * @param {string} id - Baseplate ID
 * @param {Object} customizations - Optional customizations
 * @returns {string} Data URL
 */
export function getBaseplateDataUrl(id, customizations = {}) {
    const svg = Object.keys(customizations).length > 0
        ? useBaseplate(id, customizations)
        : loadBaseplate(id);

    const encoded = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Get baseplate as a URL-encoded data URL
 * @param {string} id - Baseplate ID
 * @param {Object} customizations - Optional customizations
 * @returns {string} URL-encoded data URL
 */
export function getBaseplateEncodedUrl(id, customizations = {}) {
    const svg = Object.keys(customizations).length > 0
        ? useBaseplate(id, customizations)
        : loadBaseplate(id);

    const encoded = encodeURIComponent(svg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');

    return `data:image/svg+xml,${encoded}`;
}

/**
 * Extract customizable fields from a baseplate
 * @param {string} id - Baseplate ID
 * @returns {Array} Array of field names
 */
export function getBaseplateFields(id) {
    const svg = loadBaseplate(id);
    const fieldRegex = /data-field="([^"]+)"/g;
    const fields = [];
    let match;

    while ((match = fieldRegex.exec(svg)) !== null) {
        if (!fields.includes(match[1])) {
            fields.push(match[1]);
        }
    }

    return fields;
}

/**
 * Discover baseplates in a directory
 * @param {string} dir - Directory path (optional, defaults to baseplates dir)
 * @returns {Array} Array of discovered baseplate files
 */
export function discoverBaseplates(dir = BASEPLATES_DIR) {
    const discovered = [];

    function scanDir(currentDir, prefix = '') {
        const entries = readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const path = join(currentDir, entry.name);

            if (entry.isDirectory() && entry.name !== 'node_modules') {
                scanDir(path, join(prefix, entry.name));
            } else if (entry.isFile() && extname(entry.name) === '.svg') {
                discovered.push({
                    name: basename(entry.name, '.svg'),
                    path: join(prefix, entry.name),
                    fullPath: path
                });
            }
        }
    }

    scanDir(dir);
    return discovered;
}

/**
 * Clear the baseplate cache
 */
export function clearCache() {
    baseplateCache.clear();
    catalogCache = null;
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Default export with all functions
export default {
    getCatalog,
    getCategories,
    getAnimations,
    listBaseplates,
    getBaseplateInfo,
    loadBaseplate,
    useBaseplate,
    loadCategory,
    getBaseplateDataUrl,
    getBaseplateEncodedUrl,
    getBaseplateFields,
    discoverBaseplates,
    clearCache
};
