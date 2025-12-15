/**
 * Components Panel - Baseplate templates library
 */

export class ComponentsPanel {
    constructor(containerId, app) {
        this.container = document.getElementById(containerId);
        this.app = app;
        this.baseplates = null;
        this.baseplatesUrl = '../baseplates/baseplates.json';
    }

    async loadBaseplates() {
        try {
            const response = await fetch(this.baseplatesUrl);
            this.baseplates = await response.json();
            this.render();
        } catch (error) {
            console.error('Failed to load baseplates:', error);
            // Try loading from local path
            try {
                const localResponse = await fetch('/baseplates/baseplates.json');
                this.baseplates = await localResponse.json();
                this.render();
            } catch (localError) {
                this.container.innerHTML = `
          <div class="empty-state">
            <p>Failed to load components</p>
          </div>
        `;
            }
        }
    }

    render() {
        this.container.innerHTML = '';

        if (!this.baseplates) return;

        this.baseplates.categories.forEach(category => {
            const categoryBaseplates = this.baseplates.baseplates.filter(
                b => b.category === category.id
            );

            if (categoryBaseplates.length === 0) return;

            const section = document.createElement('div');
            section.className = 'category-section';
            section.innerHTML = `
        <div class="category-header" data-category="${category.id}">
          <div class="category-icon">${this.getCategoryIcon(category.id)}</div>
          <span class="category-name">${category.name}</span>
          <span class="category-count">${categoryBaseplates.length}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div class="category-items" id="items-${category.id}"></div>
      `;

            this.container.appendChild(section);

            // Add baseplate items
            const itemsContainer = section.querySelector('.category-items');
            categoryBaseplates.forEach(baseplate => {
                const item = this.createBaseplateItem(baseplate);
                itemsContainer.appendChild(item);
            });

            // Toggle category collapse
            section.querySelector('.category-header').addEventListener('click', () => {
                itemsContainer.classList.toggle('hidden');
                section.querySelector('svg').style.transform =
                    itemsContainer.classList.contains('hidden') ? 'rotate(-90deg)' : '';
            });
        });
    }

    createBaseplateItem(baseplate) {
        const item = document.createElement('div');
        item.className = 'component-item';
        item.dataset.id = baseplate.id;

        item.innerHTML = `
      <div class="component-preview">
        <div class="preview-placeholder" style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
          border-radius: 4px;
          font-size: 20px;
        ">${this.getPreviewIcon(baseplate.category)}</div>
      </div>
      <div class="component-name">${baseplate.name}</div>
    `;

        // Click to add to canvas
        item.addEventListener('click', () => {
            this.addToCanvas(baseplate);
        });

        // Drag to canvas
        item.draggable = true;
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('baseplate', JSON.stringify(baseplate));
        });

        return item;
    }

    async addToCanvas(baseplate) {
        try {
            // Fetch the actual SVG file
            const svgPath = `../baseplates/${baseplate.file}`;
            const response = await fetch(svgPath);
            const svgContent = await response.text();

            // Parse and add to canvas
            this.app.canvas.loadSVG(svgContent);

            // Update name
            document.getElementById('baseplate-name').value = baseplate.name;

        } catch (error) {
            console.error('Failed to load baseplate:', error);
            // Create a placeholder element
            this.createPlaceholder(baseplate);
        }
    }

    createPlaceholder(baseplate) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `baseplate-${Date.now()}`);
        g.setAttribute('data-name', baseplate.name);
        g.setAttribute('data-baseplate', baseplate.id);

        // Create a simple placeholder rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '100');
        rect.setAttribute('y', '100');
        rect.setAttribute('width', '200');
        rect.setAttribute('height', '100');
        rect.setAttribute('fill', '#f0f0f0');
        rect.setAttribute('stroke', '#ccc');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('stroke-dasharray', '5 5');
        rect.setAttribute('rx', '8');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '200');
        text.setAttribute('y', '155');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#666');
        text.setAttribute('font-family', 'system-ui, sans-serif');
        text.setAttribute('font-size', '14');
        text.textContent = baseplate.name;

        g.appendChild(rect);
        g.appendChild(text);

        this.app.canvas.addElement(g);
    }

    getCategoryIcon(categoryId) {
        const icons = {
            code: '⌨️',
            cards: '🃏',
            headers: '📰',
            diagrams: '📊',
            buttons: '🔘',
            badges: '🏷️',
            charts: '📈',
            interactive: '🎮'
        };
        return icons[categoryId] || '📦';
    }

    getPreviewIcon(categoryId) {
        const icons = {
            code: '💻',
            cards: '📋',
            headers: '🎨',
            diagrams: '🔀',
            buttons: '👆',
            badges: '🔖',
            charts: '📊',
            interactive: '🕹️'
        };
        return icons[categoryId] || '📦';
    }

    async getBaseplate(id) {
        if (!this.baseplates) {
            await this.loadBaseplates();
        }

        const baseplate = this.baseplates.baseplates.find(b => b.id === id);
        if (!baseplate) return null;

        try {
            const svgPath = `../baseplates/${baseplate.file}`;
            const response = await fetch(svgPath);
            const svg = await response.text();

            return {
                ...baseplate,
                svg
            };
        } catch (error) {
            console.error('Failed to get baseplate:', error);
            return baseplate;
        }
    }
}
