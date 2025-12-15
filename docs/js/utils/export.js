/**
 * Export utilities - SVG generation and download
 */

export function exportSVG(canvasContent, options = {}) {
    const {
        minify = false,
        includeAnimations = true,
        viewBox = '0 0 800 600'
    } = options;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${canvasContent.viewBox || viewBox}">`;

    // Add defs
    if (canvasContent.defs) {
        svg += `<defs>${canvasContent.defs}</defs>`;
    }

    // Add styles if animations included
    if (includeAnimations && canvasContent.styles) {
        svg += `<style>${canvasContent.styles}</style>`;
    }

    // Add content
    svg += canvasContent.content;

    svg += '</svg>';

    // Minify if requested
    if (minify) {
        svg = minifySVG(svg);
    }

    return svg;
}

export function minifySVG(svg) {
    return svg
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove whitespace between tags
        .replace(/>\s+</g, '><')
        // Remove leading/trailing whitespace
        .trim()
        // Collapse multiple spaces
        .replace(/\s{2,}/g, ' ');
}

export function downloadSVG(svgContent, filename = 'baseplate') {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

export function downloadJSON(data, filename = 'project') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

export function svgToDataURL(svgContent) {
    const encoded = encodeURIComponent(svgContent)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');

    return `data:image/svg+xml,${encoded}`;
}

export function svgToBase64(svgContent) {
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

export async function svgToPNG(svgContent, width = 800, height = 600) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create PNG blob'));
                }
            }, 'image/png');
        };

        img.onerror = reject;
        img.src = svgToDataURL(svgContent);
    });
}

export function generateBaseplateCode(baseplate, options = {}) {
    const { format = 'esm' } = options;

    if (format === 'esm') {
        return `export default ${JSON.stringify(baseplate, null, 2)};`;
    } else if (format === 'cjs') {
        return `module.exports = ${JSON.stringify(baseplate, null, 2)};`;
    } else {
        return JSON.stringify(baseplate, null, 2);
    }
}
