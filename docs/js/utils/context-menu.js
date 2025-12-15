/**
 * Context Menu - Right-click menu for elements
 */

export class ContextMenu {
    constructor(app) {
        this.app = app;
        this.menu = null;
        this.init();
    }

    init() {
        // Create menu element
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu hidden';
        this.menu.innerHTML = `
            <div class="context-menu-item" data-action="cut">
                <span class="context-icon">✂</span>
                <span>Cut</span>
                <span class="context-shortcut">⌘X</span>
            </div>
            <div class="context-menu-item" data-action="copy">
                <span class="context-icon">📋</span>
                <span>Copy</span>
                <span class="context-shortcut">⌘C</span>
            </div>
            <div class="context-menu-item" data-action="paste">
                <span class="context-icon">📄</span>
                <span>Paste</span>
                <span class="context-shortcut">⌘V</span>
            </div>
            <div class="context-divider"></div>
            <div class="context-menu-item" data-action="duplicate">
                <span class="context-icon">⊕</span>
                <span>Duplicate</span>
                <span class="context-shortcut">⌘D</span>
            </div>
            <div class="context-divider"></div>
            <div class="context-menu-item" data-action="bring-front">
                <span class="context-icon">↑</span>
                <span>Bring to Front</span>
                <span class="context-shortcut">⌘]</span>
            </div>
            <div class="context-menu-item" data-action="send-back">
                <span class="context-icon">↓</span>
                <span>Send to Back</span>
                <span class="context-shortcut">⌘[</span>
            </div>
            <div class="context-divider"></div>
            <div class="context-menu-item" data-action="group">
                <span class="context-icon">⊞</span>
                <span>Group</span>
                <span class="context-shortcut">⌘G</span>
            </div>
            <div class="context-menu-item" data-action="ungroup">
                <span class="context-icon">⊟</span>
                <span>Ungroup</span>
                <span class="context-shortcut">⇧⌘G</span>
            </div>
            <div class="context-divider"></div>
            <div class="context-menu-item" data-action="add-animation">
                <span class="context-icon">✦</span>
                <span>Add Animation</span>
            </div>
            <div class="context-divider"></div>
            <div class="context-menu-item context-danger" data-action="delete">
                <span class="context-icon">🗑</span>
                <span>Delete</span>
                <span class="context-shortcut">⌫</span>
            </div>
        `;
        document.body.appendChild(this.menu);

        // Handle menu item clicks
        this.menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                this.executeAction(action);
                this.hide();
            });
        });

        // Hide on click outside
        document.addEventListener('click', () => this.hide());
        document.addEventListener('contextmenu', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });
    }

    show(x, y, element) {
        this.targetElement = element;
        
        // Position menu
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
        this.menu.classList.remove('hidden');

        // Enable/disable items based on context
        this.updateMenuState(element);

        // Adjust position if menu goes off screen
        const rect = this.menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.menu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.menu.style.top = `${y - rect.height}px`;
        }
    }

    hide() {
        this.menu.classList.add('hidden');
    }

    updateMenuState(element) {
        const hasSelection = !!element;
        const hasClipboard = !!this.app.canvas.clipboard;

        this.menu.querySelector('[data-action="cut"]').classList.toggle('disabled', !hasSelection);
        this.menu.querySelector('[data-action="copy"]').classList.toggle('disabled', !hasSelection);
        this.menu.querySelector('[data-action="paste"]').classList.toggle('disabled', !hasClipboard);
        this.menu.querySelector('[data-action="duplicate"]').classList.toggle('disabled', !hasSelection);
        this.menu.querySelector('[data-action="bring-front"]').classList.toggle('disabled', !hasSelection);
        this.menu.querySelector('[data-action="send-back"]').classList.toggle('disabled', !hasSelection);
        this.menu.querySelector('[data-action="group"]').classList.toggle('disabled', !hasSelection);
        this.menu.querySelector('[data-action="ungroup"]').classList.toggle('disabled', !hasSelection || element?.tagName !== 'g');
        this.menu.querySelector('[data-action="add-animation"]').classList.toggle('disabled', !hasSelection);
        this.menu.querySelector('[data-action="delete"]').classList.toggle('disabled', !hasSelection);
    }

    executeAction(action) {
        const canvas = this.app.canvas;
        const element = this.targetElement;

        switch (action) {
            case 'cut':
                canvas.copy();
                canvas.deleteSelected();
                break;
            case 'copy':
                canvas.copy();
                break;
            case 'paste':
                canvas.paste();
                break;
            case 'duplicate':
                canvas.copy();
                canvas.paste();
                break;
            case 'bring-front':
                if (element) {
                    element.parentNode.appendChild(element);
                    canvas.saveState();
                }
                break;
            case 'send-back':
                if (element) {
                    element.parentNode.insertBefore(element, element.parentNode.firstChild);
                    canvas.saveState();
                }
                break;
            case 'group':
                this.groupSelected();
                break;
            case 'ungroup':
                this.ungroupSelected();
                break;
            case 'add-animation':
                this.showAnimationPicker();
                break;
            case 'delete':
                canvas.deleteSelected();
                break;
        }
    }

    groupSelected() {
        const element = this.targetElement;
        if (!element) return;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `group-${Date.now()}`);
        g.setAttribute('data-name', 'Group');
        
        element.parentNode.insertBefore(g, element);
        g.appendChild(element);
        
        this.app.canvas.selectElement(g);
        this.app.canvas.saveState();
        this.app.layers.refresh();
    }

    ungroupSelected() {
        const element = this.targetElement;
        if (!element || element.tagName !== 'g') return;

        const parent = element.parentNode;
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        element.remove();
        
        this.app.canvas.clearSelection();
        this.app.canvas.saveState();
        this.app.layers.refresh();
    }

    showAnimationPicker() {
        // Scroll to animations panel and highlight it
        const animPanel = document.getElementById('animations-panel');
        animPanel.classList.remove('hidden');
        animPanel.scrollIntoView({ behavior: 'smooth' });
    }
}
