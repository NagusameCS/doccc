/**
 * Component Index
 * 
 * All README components available for rendering
 */

export { renderHero } from './hero.js';
export { renderBadges } from './badges.js';
export { renderFeatures } from './features.js';
export { renderStats } from './stats.js';
export { renderInstallation } from './installation.js';
export { renderUsage } from './usage.js';
export { renderApi } from './api.js';
export { renderFaq } from './faq.js';
export { renderChangelog } from './changelog.js';
export { renderContributors } from './contributors.js';
export { renderLicense } from './license.js';
export { renderTimeline } from './timeline.js';
export { renderGallery } from './gallery.js';
export { renderCustom } from './custom.js';

/**
 * Render a section based on its type
 */
export async function renderSection(sectionConfig, context = {}) {
    const { type, ...rest } = sectionConfig;

    const renderers = {
        hero: renderHero,
        badges: renderBadges,
        features: renderFeatures,
        stats: renderStats,
        installation: renderInstallation,
        usage: renderUsage,
        api: renderApi,
        faq: renderFaq,
        changelog: renderChangelog,
        contributors: renderContributors,
        license: renderLicense,
        timeline: renderTimeline,
        gallery: renderGallery,
        custom: renderCustom,
    };

    const render = renderers[type];
    if (!render) {
        throw new Error(`Unknown section type: ${type}`);
    }

    return await render(rest, context);
}

// Re-export for convenience
import { renderHero } from './hero.js';
import { renderBadges } from './badges.js';
import { renderFeatures } from './features.js';
import { renderStats } from './stats.js';
import { renderInstallation } from './installation.js';
import { renderUsage } from './usage.js';
import { renderApi } from './api.js';
import { renderFaq } from './faq.js';
import { renderChangelog } from './changelog.js';
import { renderContributors } from './contributors.js';
import { renderLicense } from './license.js';
import { renderTimeline } from './timeline.js';
import { renderGallery } from './gallery.js';
import { renderCustom } from './custom.js';
