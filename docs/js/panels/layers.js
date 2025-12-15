/**
 * Layers Panel - Layer management and hierarchy
 */

export class LayersPanel {
    constructor(containerId, app) {
        this.container = document.getElementById(containerId);
        this.app = app;

        this.setupActions();
        this.refresh();
    }

    setupActions() {
        document.getElementById('btn-add-group').addEventListener('click', () => {
            this.addGroup();
        });

        document.getElementById('btn-delete-layer').addEventListener('click', () => {
            this.app.canvas.deleteSelected();
        });
    }

    refresh() {
        this.container.innerHTML = '';
        const content = this.app.canvas.content;

        // Build layer list from canvas elements (reverse order for top-down display)
        const elements = Array.from(content.children).reverse();

        elements.forEach(element => {
            const layer = this.createLayerItem(element);
            this.container.appendChild(layer);
        });

        if (elements.length === 0) {
            this.container.innerHTML = `
        <div class="empty-state">
          <p>No elements yet</p>
          <p style="font-size: 11px; margin-top: 4px;">Draw or drag a component to start</p>
        </div>
      `;
        }
    }

    createLayerItem(element) {
        const item = document.createElement('div');
        item.className = 'layer-item';
        item.dataset.id = element.id;

        const icon = this.getLayerIcon(element.tagName.toLowerCase());
        const name = element.getAttribute('data-name') || element.id;

        item.innerHTML = `
      <div class="layer-icon">${icon}</div>
      <span class="layer-name">${name}</span>
      <button class="btn-icon layer-visibility" title="Toggle Visibility">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    `;

        // Click to select
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.layer-visibility')) {
                this.selectLayer(element.id);
            }
        });

        // Double-click to rename
        item.addEventListener('dblclick', () => {
            this.renameLayer(element.id);
        });

        // Toggle visibility
        item.querySelector('.layer-visibility').addEventListener('click', () => {
            this.toggleVisibility(element.id);
        });

        return item;
    }

    getLayerIcon(tagName) {
        const icons = {
            rect: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
      </svg>`,
            circle: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>`,
            text: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="4 7 4 4 20 4 20 7"/>
        <line x1="9" y1="20" x2="15" y2="20"/>
        <line x1="12" y1="4" x2="12" y2="20"/>
      </svg>`,
            path: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
      </svg>`,
            g: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>`,
            default: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
      </svg>`
        };

        return icons[tagName] || icons.default;
    }

    selectLayer(id) {
        const element = document.getElementById(id);
        if (element) {
            this.app.canvas.selectElement(element);
            this.highlightLayer(id);
        }
    }

    highlightLayer(id) {
        this.container.querySelectorAll('.layer-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.id === id);
        });
    }

    renameLayer(id) {
        const element = document.getElementById(id);
        const item = this.container.querySelector(`[data-id="${id}"]`);
        const nameSpan = item.querySelector('.layer-name');

        const currentName = element.getAttribute('data-name') || id;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'layer-name-input';
        input.style.cssText = `
      flex: 1;
      background: var(--bg-tertiary);
      border: 1px solid var(--accent-primary);
      border-radius: 4px;
      padding: 2px 6px;
      color: var(--text-primary);
      font-size: 12px;
    `;

        nameSpan.replaceWith(input);
        input.focus();
        input.select();

        const finish = () => {
            const newName = input.value.trim() || currentName;
            element.setAttribute('data-name', newName);
            const newSpan = document.createElement('span');
            newSpan.className = 'layer-name';
            newSpan.textContent = newName;
            input.replaceWith(newSpan);
        };

        input.addEventListener('blur', finish);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finish();
            if (e.key === 'Escape') {
                input.value = currentName;
                finish();
            }
        });
    }

    toggleVisibility(id) {
        const element = document.getElementById(id);
        const isHidden = element.style.display === 'none';
        element.style.display = isHidden ? '' : 'none';

        const item = this.container.querySelector(`[data-id="${id}"]`);
        const btn = item.querySelector('.layer-visibility');
        btn.style.opacity = isHidden ? '' : '1';
        btn.innerHTML = isHidden ? `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ` : `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    `;
    }

    addGroup() {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', `group-${Date.now()}`);
        group.setAttribute('data-name', 'New Group');
        this.app.canvas.content.appendChild(group);
        this.refresh();
    }

    moveLayerUp(id) {
        const element = document.getElementById(id);
        if (element.nextElementSibling) {
            element.parentNode.insertBefore(element.nextElementSibling, element);
            this.refresh();
        }
    }

    moveLayerDown(id) {
        const element = document.getElementById(id);
        if (element.previousElementSibling) {
            element.parentNode.insertBefore(element, element.previousElementSibling);
            this.refresh();
        }
    }
}
