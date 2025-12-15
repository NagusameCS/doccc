/**
 * Preview Command
 * 
 * Start a local preview server with live reload
 */

import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import chalk from 'chalk';
import { watch } from './watch.js';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.md': 'text/markdown',
};

/**
 * Convert markdown to simple HTML for preview
 */
function markdownToHtml(markdown, title = 'README Preview') {
    // Simple markdown to HTML conversion for preview
    let html = markdown
        // Headers
        .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
        .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
        .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
        .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
        .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Links and images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Lists
        .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>')
        // Blockquotes
        .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Details/summary
        .replace(/<details>/g, '<details>')
        .replace(/<\/details>/g, '</details>')
        .replace(/<summary>/g, '<summary>')
        .replace(/<\/summary>/g, '</summary>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gm, (match) => {
            if (match.startsWith('<')) return match;
            return match;
        });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --color-bg: #ffffff;
      --color-text: #24292e;
      --color-link: #0366d6;
      --color-border: #e1e4e8;
      --color-code-bg: #f6f8fa;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --color-bg: #0d1117;
        --color-text: #c9d1d9;
        --color-link: #58a6ff;
        --color-border: #30363d;
        --color-code-bg: #161b22;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: var(--color-bg);
      color: var(--color-text);
    }
    a { color: var(--color-link); text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; }
    pre {
      background: var(--color-code-bg);
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    code {
      background: var(--color-code-bg);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 85%;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid var(--color-border);
      margin: 0;
      padding-left: 16px;
      color: #6a737d;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid var(--color-border);
      padding: 8px 12px;
      text-align: left;
    }
    details {
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 8px 16px;
      margin: 8px 0;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px solid var(--color-border);
      margin: 24px 0;
    }
    .refresh-notice {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .refresh-notice.show { opacity: 1; }
  </style>
</head>
<body>
  <article class="markdown-body">
    ${html}
  </article>
  <div id="refresh-notice" class="refresh-notice">Refreshing...</div>
  <script>
    // Auto-refresh on file change (polling)
    let lastModified = null;
    setInterval(async () => {
      try {
        const res = await fetch('/api/modified');
        const data = await res.json();
        if (lastModified && data.modified !== lastModified) {
          document.getElementById('refresh-notice').classList.add('show');
          setTimeout(() => location.reload(), 500);
        }
        lastModified = data.modified;
      } catch (e) {}
    }, 1000);
  </script>
</body>
</html>`;
}

/**
 * Start preview server
 */
export async function preview(config, options = {}) {
    const port = parseInt(options.port, 10) || 3000;
    const outputDir = options.output || '.';
    const readmePath = join(outputDir, config.output?.readme || 'README.md');

    let lastModified = Date.now();

    const server = createServer((req, res) => {
        const url = new URL(req.url, `http://localhost:${port}`);
        const pathname = url.pathname;

        // API endpoint for checking modifications
        if (pathname === '/api/modified') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ modified: lastModified }));
            return;
        }

        // Serve README as HTML preview
        if (pathname === '/' || pathname === '/index.html') {
            try {
                const markdown = readFileSync(readmePath, 'utf-8');
                const html = markdownToHtml(markdown, config.project?.name || 'README Preview');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            } catch (error) {
                res.writeHead(500);
                res.end('Error loading README');
            }
            return;
        }

        // Serve raw README
        if (pathname === '/README.md') {
            try {
                const content = readFileSync(readmePath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/markdown' });
                res.end(content);
            } catch (error) {
                res.writeHead(404);
                res.end('Not found');
            }
            return;
        }

        // Serve static assets
        const filePath = join(outputDir, pathname);
        if (existsSync(filePath) && statSync(filePath).isFile()) {
            const ext = extname(filePath);
            const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
            const content = readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content);
            return;
        }

        res.writeHead(404);
        res.end('Not found');
    });

    server.listen(port, () => {
        console.log(chalk.green(`\n🌐 Preview server running at http://localhost:${port}\n`));
        console.log(chalk.gray('  Press Ctrl+C to stop\n'));

        if (options.open) {
            const open = require('open');
            open(`http://localhost:${port}`);
        }
    });

    // Watch and rebuild in background
    const originalWatch = await import('./watch.js');

    // Update lastModified on changes
    const { watch: fsWatch } = await import('fs');
    fsWatch(readmePath, () => {
        lastModified = Date.now();
        console.log(chalk.blue('  📄 README updated'));
    });

    // Keep process alive
    return new Promise(() => { });
}
