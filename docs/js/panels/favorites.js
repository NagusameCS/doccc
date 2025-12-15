/**
 * Favorites Panel - Saved/favorited baseplates
 */

export class FavoritesPanel {
    constructor(containerId, app) {
        this.container = document.getElementById(containerId);
        this.app = app;
        this.favorites = [];
        this.baseplates = null;

        this.loadFavorites();
    }

    async loadFavorites() {
        try {
            // Load favorites from localStorage
            const storedFavorites = localStorage.getItem('doccc-favorites');
            const favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

            // Load baseplates catalog to get full data
            const response = await fetch('../baseplates/baseplates.json');
            this.baseplates = await response.json();

            // Filter to only favorited baseplates
            this.favorites = this.baseplates.baseplates.filter(bp =>
                favoriteIds.includes(bp.id)
            );

            this.render();
        } catch (error) {
            console.error('Failed to load favorites:', error);
            this.renderEmpty();
        }
    }

    render() {
        if (!this.container) return;

        // Update count
        const countEl = document.querySelector('.favorites-count');
        if (countEl) {
            countEl.textContent = `${this.favorites.length} saved baseplate${this.favorites.length !== 1 ? 's' : ''}`;
        }

        if (this.favorites.length === 0) {
            this.renderEmpty();
            return;
        }

        this.container.innerHTML = '';

        this.favorites.forEach(baseplate => {
            const item = this.createFavoriteItem(baseplate);
            this.container.appendChild(item);
        });
    }

    renderEmpty() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">💾</span>
                <p>No saved baseplates yet</p>
                <p class="empty-hint">Click the heart on any baseplate to save it here</p>
                <a href="community.html" class="empty-link" target="_blank">Browse Community →</a>
            </div>
        `;
    }

    createFavoriteItem(baseplate) {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.dataset.id = baseplate.id;

        const icon = this.getCategoryIcon(baseplate.category);

        item.innerHTML = `
            <div class="favorite-preview">
                <span class="preview-icon">${icon}</span>
            </div>
            <div class="favorite-info">
                <div class="favorite-name">${baseplate.name}</div>
                <div class="favorite-category">${baseplate.category}</div>
            </div>
            <div class="favorite-actions">
                <button class="favorite-use" title="Add to canvas">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                </button>
                <button class="favorite-remove" title="Remove from favorites">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
        `;

        // Add to canvas
        item.querySelector('.favorite-use').addEventListener('click', (e) => {
            e.stopPropagation();
            this.addToCanvas(baseplate);
        });

        // Remove from favorites
        item.querySelector('.favorite-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFavorite(baseplate.id);
        });

        // Click item to add to canvas
        item.addEventListener('click', () => {
            this.addToCanvas(baseplate);
        });

        // Make draggable
        item.draggable = true;
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('baseplate', JSON.stringify(baseplate));
        });

        return item;
    }

    async addToCanvas(baseplate) {
        try {
            const svgPath = `../baseplates/${baseplate.file}`;
            const response = await fetch(svgPath);
            const svgContent = await response.text();

            this.app.canvas.loadSVG(svgContent);
            document.getElementById('baseplate-name').value = baseplate.name;

            if (this.app.toast) {
                this.app.toast.success(`Added "${baseplate.name}" to canvas`);
            }
        } catch (error) {
            console.error('Failed to load baseplate:', error);
            if (this.app.toast) {
                this.app.toast.error('Failed to load baseplate');
            }
        }
    }

    removeFavorite(id) {
        // Get current favorites from localStorage
        const storedFavorites = localStorage.getItem('doccc-favorites');
        let favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

        // Remove the id
        favoriteIds = favoriteIds.filter(fid => fid !== id);
        localStorage.setItem('doccc-favorites', JSON.stringify(favoriteIds));

        // Update local list
        this.favorites = this.favorites.filter(bp => bp.id !== id);

        // Re-render
        this.render();

        if (this.app.toast) {
            this.app.toast.info('Removed from favorites');
        }
    }

    addFavorite(baseplate) {
        // Get current favorites from localStorage
        const storedFavorites = localStorage.getItem('doccc-favorites');
        let favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

        // Add if not already there
        if (!favoriteIds.includes(baseplate.id)) {
            favoriteIds.push(baseplate.id);
            localStorage.setItem('doccc-favorites', JSON.stringify(favoriteIds));

            // Add to local list
            this.favorites.push(baseplate);

            // Re-render
            this.render();

            if (this.app.toast) {
                this.app.toast.success(`Added "${baseplate.name}" to favorites`);
            }
        }
    }

    getCategoryIcon(categoryId) {
        const icons = {
            code: '💻',
            cards: '🃏',
            headers: '🎨',
            diagrams: '📊',
            buttons: '🔘',
            badges: '🏷️',
            charts: '📈',
            interactive: '🎮'
        };
        return icons[categoryId] || '📦';
    }
}
