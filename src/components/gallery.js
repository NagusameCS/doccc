/**
 * Gallery Component
 */

export async function renderGallery(config, context = {}) {
    const { id = 'gallery', title = 'Screenshots', content = {} } = config;
    const { layout = 'grid', columns = 2, images = [] } = content;

    const lines = [`<h2 id="${id}">${title}</h2>`, ''];

    if (images.length === 0) {
        lines.push('*Screenshots coming soon*');
        return lines.join('\n');
    }

    if (layout === 'grid') {
        lines.push('<table>', '<tr>');
        images.forEach((img, i) => {
            if (i > 0 && i % columns === 0) lines.push('</tr>', '<tr>');
            lines.push('<td>');
            lines.push(`<img src="${img.src}" alt="${img.alt || 'Screenshot'}" width="100%">`);
            if (img.caption) lines.push(`<sub>${img.caption}</sub>`);
            lines.push('</td>');
        });
        lines.push('</tr>', '</table>');
    } else {
        for (const img of images) {
            lines.push(`![${img.alt || 'Screenshot'}](${img.src})`);
            if (img.caption) lines.push(`*${img.caption}*`, '');
        }
    }

    lines.push('');
    return lines.join('\n');
}
