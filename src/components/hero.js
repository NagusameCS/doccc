/**
 * Hero Component
 * 
 * Large header with title, subtitle, logo, and optional animation
 */

import { generateHeroSvg } from '../generators/svg/hero.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Render hero section
 */
export async function renderHero(config, context = {}) {
    const {
        id = 'hero',
        content = {},
    } = config;

    const {
        title = context.config?.project?.name || 'Project Name',
        subtitle = context.config?.project?.description || '',
        logo = null,
        animated = true,
        align = 'center',
        showBadges = false,
        gradient = null,
    } = content;

    const lines = [];
    const alignment = align === 'center' ? 'align="center"' : '';

    // Start container
    if (align === 'center') {
        lines.push('<div align="center">');
        lines.push('');
    }

    // Logo or animated SVG header
    if (animated) {
        // Generate animated SVG
        const svg = await generateHeroSvg({
            title,
            subtitle,
            gradient,
            animated: true,
            theme: context.theme,
        });

        // Save SVG to assets
        if (context.assetsDir) {
            mkdirSync(context.assetsDir, { recursive: true });
            const svgPath = join(context.assetsDir, 'hero.svg');
            writeFileSync(svgPath, svg, 'utf-8');

            // Reference the SVG
            lines.push(`<img src="${context.assetsDir}/hero.svg" alt="${title}" width="600">`);
        } else {
            // Inline SVG (GitHub supports this)
            lines.push('<picture>');
            lines.push(`  <source media="(prefers-color-scheme: dark)" srcset="./assets/hero-dark.svg">`);
            lines.push(`  <source media="(prefers-color-scheme: light)" srcset="./assets/hero-light.svg">`);
            lines.push(`  <img alt="${title}" src="./assets/hero.svg" width="600">`);
            lines.push('</picture>');
        }
    } else if (logo) {
        // Static logo
        lines.push(`<img src="${logo}" alt="${title}" width="200">`);
        lines.push('');
        lines.push(`# ${title}`);
    } else {
        // Text-only header
        lines.push(`# ${title}`);
    }

    lines.push('');

    // Subtitle
    if (subtitle) {
        lines.push(`<p ${alignment}>`);
        lines.push(`  <em>${subtitle}</em>`);
        lines.push('</p>');
        lines.push('');
    }

    // Close container
    if (align === 'center') {
        lines.push('</div>');
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Generate hero with typing animation effect
 */
export function generateTypingHero(title, options = {}) {
    const chars = title.split('');
    const duration = options.duration || 2;
    const charDelay = duration / chars.length;

    const textElements = chars.map((char, i) => {
        const delay = (i * charDelay).toFixed(2);
        return `<tspan class="char" style="animation-delay: ${delay}s">${char === ' ' ? '&#160;' : char}</tspan>`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 100">
  <style>
    .char {
      opacity: 0;
      animation: fadeIn 0.1s forwards;
    }
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    .title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 48px;
      font-weight: bold;
      fill: currentColor;
    }
  </style>
  <text x="50%" y="60" text-anchor="middle" class="title">
    ${textElements}
  </text>
</svg>`;
}
