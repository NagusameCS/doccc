/**
 * Community Panel - Browse and share community baseplates
 */

export class CommunityPanel {
    constructor(containerId, app) {
        this.container = document.getElementById(containerId);
        this.app = app;
        this.baseplates = [];
        this.filter = 'featured';

        this.setupEvents();
    }

    setupEvents() {
        // Search
        document.getElementById('community-search').addEventListener('input', (e) => {
            this.search(e.target.value);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.render();
            });
        });
    }

    async loadCommunityBaseplates() {
        try {
            // Load from localStorage (community storage)
            const stored = localStorage.getItem('doccc-community-baseplates');
            this.baseplates = stored ? JSON.parse(stored) : [];

            // Add some sample featured baseplates if empty
            if (this.baseplates.length === 0) {
                this.baseplates = this.getSampleBaseplates();
                localStorage.setItem('doccc-community-baseplates', JSON.stringify(this.baseplates));
            }

            this.render();
        } catch (error) {
            console.error('Failed to load community baseplates:', error);
            this.container.innerHTML = `
        <div class="empty-state">
          <p>Failed to load community baseplates</p>
        </div>
      `;
        }
    }

    getSampleBaseplates() {
        return [
            {
                id: 'sample-1',
                name: 'Gradient Hero',
                description: 'Beautiful gradient hero section with animated particles',
                category: 'headers',
                tags: ['hero', 'gradient', 'animated'],
                author: 'doccc',
                publishedAt: '2024-01-15T00:00:00Z',
                downloads: 1250,
                featured: true,
                svg: '<svg viewBox="0 0 400 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect fill="url(#g1)" width="400" height="100" rx="8"/><text x="200" y="55" text-anchor="middle" fill="white" font-family="system-ui" font-size="24" font-weight="bold">Your Title</text></svg>'
            },
            {
                id: 'sample-2',
                name: 'Stats Dashboard',
                description: 'Compact stats display with animated counters',
                category: 'cards',
                tags: ['stats', 'dashboard', 'numbers'],
                author: 'doccc',
                publishedAt: '2024-01-10T00:00:00Z',
                downloads: 890,
                featured: true,
                svg: '<svg viewBox="0 0 200 80"><rect fill="white" width="200" height="80" rx="8" stroke="#e5e7eb"/><text x="20" y="45" fill="#1f2937" font-family="system-ui" font-size="28" font-weight="bold">12.5K</text><text x="20" y="65" fill="#6b7280" font-family="system-ui" font-size="12">Downloads</text></svg>'
            },
            {
                id: 'sample-3',
                name: 'Code Block Dark',
                description: 'Dark themed code block with syntax highlighting',
                category: 'code',
                tags: ['code', 'dark', 'syntax'],
                author: 'community',
                publishedAt: '2024-01-05T00:00:00Z',
                downloads: 2100,
                featured: true,
                svg: '<svg viewBox="0 0 300 150"><rect fill="#1e1e1e" width="300" height="150" rx="8"/><rect fill="#2d2d2d" width="300" height="28" rx="8"/><circle fill="#ff5f56" cx="14" cy="14" r="5"/><circle fill="#ffbd2e" cx="30" cy="14" r="5"/><circle fill="#27c93f" cx="46" cy="14" r="5"/><text x="16" y="55" fill="#c586c0" font-family="monospace" font-size="12">const</text><text x="50" y="55" fill="#9cdcfe" font-family="monospace" font-size="12">app</text><text x="75" y="55" fill="#d4d4d4" font-family="monospace" font-size="12">=</text></svg>'
            }
        ];
    }

    render() {
        this.container.innerHTML = '';

        let filtered = this.baseplates;

        // Apply filter
        switch (this.filter) {
            case 'featured':
                filtered = filtered.filter(b => b.featured);
                break;
            case 'popular':
                filtered = filtered.sort((a, b) => b.downloads - a.downloads);
                break;
            case 'recent':
                filtered = filtered.sort((a, b) =>
                    new Date(b.publishedAt) - new Date(a.publishedAt)
                );
                break;
            case 'mine':
                filtered = filtered.filter(b => b.author === 'You');
                break;
        }

        if (filtered.length === 0) {
            this.container.innerHTML = `
        <div class="empty-state">
          <p>No baseplates found</p>
          <p style="font-size: 11px; margin-top: 4px;">
            ${this.filter === 'mine' ? 'Publish your first baseplate!' : 'Try a different filter'}
          </p>
        </div>
      `;
            return;
        }

        filtered.forEach(baseplate => {
            const item = this.createBaseplateItem(baseplate);
            this.container.appendChild(item);
        });
    }

    createBaseplateItem(baseplate) {
        const item = document.createElement('div');
        item.className = 'community-item';
        item.dataset.id = baseplate.id;

        const date = new Date(baseplate.publishedAt);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        item.innerHTML = `
      <div class="community-thumb"></div>
      <div class="community-info">
        <div class="community-name">${baseplate.name}</div>
        <div class="community-author">by ${baseplate.author}</div>
        <div class="community-stats">
          <span>⬇️ ${this.formatNumber(baseplate.downloads)}</span>
          <span>📅 ${dateStr}</span>
        </div>
      </div>
    `;

        // Render SVG preview
        const thumb = item.querySelector('.community-thumb');
        thumb.innerHTML = baseplate.svg;

        // Click to use
        item.addEventListener('click', () => {
            this.useBaseplate(baseplate);
        });

        return item;
    }

    search(query) {
        query = query.toLowerCase().trim();

        if (!query) {
            this.render();
            return;
        }

        const results = this.baseplates.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.description.toLowerCase().includes(query) ||
            b.tags.some(t => t.toLowerCase().includes(query))
        );

        this.container.innerHTML = '';

        if (results.length === 0) {
            this.container.innerHTML = `
        <div class="empty-state">
          <p>No results for "${query}"</p>
        </div>
      `;
            return;
        }

        results.forEach(baseplate => {
            const item = this.createBaseplateItem(baseplate);
            this.container.appendChild(item);
        });
    }

    useBaseplate(baseplate) {
        // Load SVG into canvas
        this.app.canvas.loadSVG(baseplate.svg);

        // Update name
        document.getElementById('baseplate-name').value = baseplate.name;

        // Increment download count
        baseplate.downloads++;
        this.saveBaseplates();

        // Switch to layers panel
        document.querySelector('.panel-tab[data-panel="layers"]').click();
    }

    addBaseplate(baseplate) {
        this.baseplates.unshift(baseplate);
        this.saveBaseplates();
        this.render();
    }

    saveBaseplates() {
        localStorage.setItem('doccc-community-baseplates', JSON.stringify(this.baseplates));
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}
