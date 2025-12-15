/**
 * Contributors Component
 */

export async function renderContributors(config, context = {}) {
    const { id = 'contributors', title = '👥 Contributors', content = {} } = config;
    const { source = 'github', showAvatars = true, columns = 7, contributors = [] } = content;

    const lines = [`<h2 id="${id}">${title}</h2>`, ''];
    const repo = extractRepo(context.config?.project?.repository);

    if (source === 'github' && repo) {
        // Use GitHub's contributor image
        lines.push(`<a href="https://github.com/${repo}/graphs/contributors">`);
        lines.push(`  <img src="https://contrib.rocks/image?repo=${repo}&columns=${columns}" />`);
        lines.push('</a>', '');

        // Alternative: all-contributors style
        lines.push('<sub>Made with ❤️ by contributors</sub>', '');
    } else if (contributors.length > 0) {
        // Manual contributor list
        lines.push('<table>', '<tr>');
        let count = 0;

        for (const c of contributors) {
            if (count > 0 && count % columns === 0) {
                lines.push('</tr>', '<tr>');
            }

            lines.push('<td align="center">');
            if (showAvatars && c.avatar) {
                lines.push(`<a href="${c.url || '#'}"><img src="${c.avatar}" width="80" alt="${c.name}"></a><br>`);
            }
            lines.push(`<sub><b>${c.name}</b></sub>`);
            if (c.role) lines.push(`<br><sub>${c.role}</sub>`);
            lines.push('</td>');
            count++;
        }

        lines.push('</tr>', '</table>', '');
    } else {
        lines.push('*Contributors list coming soon*');
    }

    return lines.join('\n');
}

function extractRepo(url) {
    if (!url) return '';
    const match = url.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
    return match ? match[1].replace(/\.git$/, '') : '';
}
