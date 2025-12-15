/**
 * License Component
 */

export async function renderLicense(config, context = {}) {
    const { id = 'license', title = 'License', content = {} } = config;
    const { type = 'MIT', showBadge = true, showFullText = false, author = '' } = content;

    const lines = [`<h2 id="${id}">${title}</h2>`, ''];
    const year = new Date().getFullYear();
    const projectAuthor = author || context.config?.project?.author || 'Author';

    if (showBadge) {
        lines.push(`![License](https://img.shields.io/badge/License-${type}-blue.svg)`, '');
    }

    lines.push(`This project is licensed under the ${type} License.`);

    if (showFullText && type === 'MIT') {
        lines.push('', '<details>', '<summary>View License</summary>', '');
        lines.push('```');
        lines.push(`MIT License`);
        lines.push('');
        lines.push(`Copyright (c) ${year} ${projectAuthor}`);
        lines.push('');
        lines.push('Permission is hereby granted, free of charge, to any person obtaining a copy');
        lines.push('of this software and associated documentation files (the "Software"), to deal');
        lines.push('in the Software without restriction, including without limitation the rights');
        lines.push('to use, copy, modify, merge, publish, distribute, sublicense, and/or sell');
        lines.push('copies of the Software, and to permit persons to whom the Software is');
        lines.push('furnished to do so, subject to the following conditions:');
        lines.push('');
        lines.push('The above copyright notice and this permission notice shall be included in all');
        lines.push('copies or substantial portions of the Software.');
        lines.push('');
        lines.push('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR');
        lines.push('IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,');
        lines.push('FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE');
        lines.push('AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER');
        lines.push('LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,');
        lines.push('OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE');
        lines.push('SOFTWARE.');
        lines.push('```');
        lines.push('</details>');
    }

    lines.push('');
    return lines.join('\n');
}
