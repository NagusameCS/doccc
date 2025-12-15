/**
 * Hero SVG Generator
 * 
 * Creates animated hero headers for READMEs
 */

/**
 * Generate animated hero SVG
 */
export async function generateHeroSvg(options = {}) {
    const {
        title = 'Project Name',
        subtitle = '',
        animated = true,
        gradient = null,
        theme = {},
        width = 800,
        height = 200,
    } = options;

    const primaryColor = theme.primaryColor || '#0366d6';
    const secondaryColor = theme.secondaryColor || '#586069';

    // Default gradient
    const grad = gradient || {
        from: primaryColor,
        to: '#6f42c1',
        angle: 135,
    };

    const animations = animated ? `
    <style>
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes gradient {
        0% { stop-color: ${grad.from}; }
        50% { stop-color: ${grad.to}; }
        100% { stop-color: ${grad.from}; }
      }
      .title {
        animation: fadeInUp 0.8s ease-out forwards;
      }
      .subtitle {
        animation: fadeInUp 0.8s ease-out 0.2s forwards;
        opacity: 0;
      }
      .grad-stop-1 {
        animation: gradient 4s ease infinite;
      }
      .grad-stop-2 {
        animation: gradient 4s ease infinite reverse;
      }
    </style>
  ` : '';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" class="grad-stop-1" style="stop-color:${grad.from}"/>
      <stop offset="100%" class="grad-stop-2" style="stop-color:${grad.to}"/>
    </linearGradient>
  </defs>
  ${animations}
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="transparent"/>
  
  <!-- Title -->
  <text 
    x="50%" 
    y="${subtitle ? '40%' : '50%'}" 
    text-anchor="middle" 
    dominant-baseline="middle"
    class="title"
    style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 48px;
      font-weight: 700;
      fill: url(#titleGradient);
    "
  >${escapeXml(title)}</text>
  
  ${subtitle ? `
  <!-- Subtitle -->
  <text 
    x="50%" 
    y="65%" 
    text-anchor="middle" 
    dominant-baseline="middle"
    class="subtitle"
    style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 18px;
      font-weight: 400;
      fill: ${secondaryColor};
    "
  >${escapeXml(subtitle)}</text>
  ` : ''}
</svg>`;

    return svg;
}

/**
 * Generate typing animation hero
 */
export function generateTypingHeroSvg(title, options = {}) {
    const {
        width = 600,
        height = 80,
        speed = 100, // ms per character
        color = '#0366d6',
    } = options;

    const chars = title.split('');
    const totalDuration = chars.length * speed / 1000;

    const charElements = chars.map((char, i) => {
        const delay = (i * speed / 1000).toFixed(2);
        const x = 20 + (i * 24);
        return `<text x="${x}" y="50" class="char" style="animation-delay: ${delay}s">${char === ' ' ? '&#160;' : escapeXml(char)}</text>`;
    }).join('\n    ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .char {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 32px;
      font-weight: 600;
      fill: ${color};
      opacity: 0;
      animation: typeIn 0.1s forwards;
    }
    @keyframes typeIn {
      to { opacity: 1; }
    }
    .cursor {
      animation: blink 0.8s infinite;
    }
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
  </style>
  
  ${charElements}
  
  <!-- Cursor -->
  <rect x="${20 + chars.length * 24}" y="20" width="3" height="40" fill="${color}" class="cursor" style="animation-delay: ${totalDuration}s"/>
</svg>`;
}

/**
 * Generate wave animation hero
 */
export function generateWaveHeroSvg(title, options = {}) {
    const { width = 800, height = 150, color = '#0366d6' } = options;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .wave-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 48px;
      font-weight: 700;
      fill: ${color};
    }
    .wave-char {
      animation: wave 2s ease-in-out infinite;
    }
    @keyframes wave {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  </style>
  
  <text x="50%" y="60%" text-anchor="middle" class="wave-text">
    ${title.split('').map((char, i) =>
        `<tspan class="wave-char" style="animation-delay: ${i * 0.05}s">${char === ' ' ? '&#160;' : escapeXml(char)}</tspan>`
    ).join('')}
  </text>
</svg>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
