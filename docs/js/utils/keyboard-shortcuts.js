/**
 * Keyboard Shortcuts Manager
 */

export class KeyboardShortcuts {
    constructor(app) {
        this.app = app;
        this.enabled = true;
        this.modal = null;
        this.shortcuts = new Map();

        this.registerDefaults();
        this.init();
    }

    init() {
        this.createModal();

        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            this.handleKeydown(e);
        });
    }

    registerDefaults() {
        // Tools
        this.register('v', 'select', 'Select Tool', 'Tools');
        this.register('m', 'move', 'Move Tool', 'Tools');
        this.register('r', 'rect', 'Rectangle Tool', 'Tools');
        this.register('o', 'circle', 'Ellipse Tool', 'Tools');
        this.register('l', 'line', 'Line Tool', 'Tools');
        this.register('t', 'text', 'Text Tool', 'Tools');
        this.register('p', 'path', 'Path Tool', 'Tools');
        this.register('s', 'star', 'Star Tool', 'Tools');

        // Edit
        this.register('ctrl+z', 'undo', 'Undo', 'Edit');
        this.register('ctrl+shift+z', 'redo', 'Redo', 'Edit');
        this.register('ctrl+y', 'redo', 'Redo', 'Edit');
        this.register('ctrl+c', 'copy', 'Copy', 'Edit');
        this.register('ctrl+v', 'paste', 'Paste', 'Edit');
        this.register('ctrl+x', 'cut', 'Cut', 'Edit');
        this.register('ctrl+d', 'duplicate', 'Duplicate', 'Edit');
        this.register('ctrl+a', 'selectAll', 'Select All', 'Edit');
        this.register('delete', 'delete', 'Delete', 'Edit');
        this.register('backspace', 'delete', 'Delete', 'Edit');

        // View
        this.register('ctrl+=', 'zoomIn', 'Zoom In', 'View');
        this.register('ctrl+-', 'zoomOut', 'Zoom Out', 'View');
        this.register('ctrl+0', 'zoomReset', 'Zoom to 100%', 'View');
        this.register('ctrl+1', 'zoomFit', 'Zoom to Fit', 'View');
        this.register("'", 'toggleGrid', 'Toggle Grid', 'View');
        this.register('ctrl+;', 'toggleSnap', 'Toggle Snap', 'View');

        // Layers
        this.register('ctrl+]', 'bringForward', 'Bring Forward', 'Layers');
        this.register('ctrl+[', 'sendBackward', 'Send Backward', 'Layers');
        this.register('ctrl+shift+]', 'bringToFront', 'Bring to Front', 'Layers');
        this.register('ctrl+shift+[', 'sendToBack', 'Send to Back', 'Layers');
        this.register('ctrl+g', 'group', 'Group', 'Layers');
        this.register('ctrl+shift+g', 'ungroup', 'Ungroup', 'Layers');

        // File
        this.register('ctrl+s', 'save', 'Save', 'File');
        this.register('ctrl+shift+s', 'saveAs', 'Save As', 'File');
        this.register('ctrl+e', 'export', 'Export SVG', 'File');
        this.register('ctrl+shift+e', 'exportPNG', 'Export PNG', 'File');
        this.register('ctrl+n', 'newProject', 'New Project', 'File');
        this.register('ctrl+o', 'openProject', 'Open Project', 'File');

        // Help
        this.register('?', 'showHelp', 'Show Shortcuts', 'Help');
        this.register('f1', 'showHelp', 'Show Shortcuts', 'Help');
    }

    register(key, action, description, category = 'General') {
        this.shortcuts.set(key.toLowerCase(), { action, description, category });
    }

    handleKeydown(e) {
        // Don't handle shortcuts when typing in inputs
        if (e.target.matches('input, textarea, [contenteditable]')) {
            // Allow escape in inputs
            if (e.key === 'Escape') {
                e.target.blur();
            }
            return;
        }

        const key = this.getKeyCombo(e);
        const shortcut = this.shortcuts.get(key);

        if (!shortcut) return;

        // Prevent default for registered shortcuts
        e.preventDefault();

        this.executeAction(shortcut.action);
    }

    getKeyCombo(e) {
        let combo = [];
        if (e.ctrlKey || e.metaKey) combo.push('ctrl');
        if (e.shiftKey) combo.push('shift');
        if (e.altKey) combo.push('alt');

        const key = e.key.toLowerCase();
        if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
            combo.push(key);
        }

        return combo.join('+');
    }

    executeAction(action) {
        switch (action) {
            // Tools
            case 'select':
            case 'move':
            case 'rect':
            case 'circle':
            case 'line':
            case 'text':
            case 'path':
            case 'star':
                this.app.setTool(action);
                break;

            // Edit
            case 'undo':
                this.app.canvas.undo();
                break;
            case 'redo':
                this.app.canvas.redo();
                break;
            case 'copy':
                this.app.canvas.copy();
                break;
            case 'paste':
                this.app.canvas.paste();
                break;
            case 'cut':
                this.app.canvas.copy();
                this.app.canvas.deleteSelected();
                break;
            case 'duplicate':
                this.app.canvas.copy();
                this.app.canvas.paste();
                break;
            case 'selectAll':
                this.app.canvas.selectAll();
                break;
            case 'delete':
                this.app.canvas.deleteSelected();
                break;

            // View
            case 'zoomIn':
                this.app.setZoom(this.app.zoom + 0.1);
                break;
            case 'zoomOut':
                this.app.setZoom(this.app.zoom - 0.1);
                break;
            case 'zoomReset':
                this.app.setZoom(1);
                break;
            case 'zoomFit':
                this.app.zoomToFit();
                break;
            case 'toggleGrid':
                if (this.app.grid) this.app.grid.toggle();
                break;
            case 'toggleSnap':
                if (this.app.grid) this.app.grid.toggleSnap();
                break;

            // Layers
            case 'bringForward':
                this.app.canvas.bringForward();
                break;
            case 'sendBackward':
                this.app.canvas.sendBackward();
                break;
            case 'bringToFront':
                this.app.canvas.bringToFront();
                break;
            case 'sendToBack':
                this.app.canvas.sendToBack();
                break;
            case 'group':
                this.app.canvas.group();
                break;
            case 'ungroup':
                this.app.canvas.ungroup();
                break;

            // File
            case 'save':
                this.app.saveProject();
                break;
            case 'saveAs':
                this.app.saveProjectAs();
                break;
            case 'export':
                this.app.showExportModal();
                break;
            case 'exportPNG':
                this.app.exportAsPNG();
                break;
            case 'newProject':
                this.app.newProject();
                break;
            case 'openProject':
                this.app.openProject();
                break;

            // Help
            case 'showHelp':
                this.showModal();
                break;
        }
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'shortcuts-modal hidden';
        this.modal.innerHTML = `
            <div class="shortcuts-dialog">
                <div class="shortcuts-header">
                    <h3>⌨️ Keyboard Shortcuts</h3>
                    <button class="btn-icon shortcuts-close">×</button>
                </div>
                <div class="shortcuts-content">
                    ${this.generateShortcutsHTML()}
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Close handlers
        this.modal.querySelector('.shortcuts-close').addEventListener('click', () => this.hideModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hideModal();
            }
        });
    }

    generateShortcutsHTML() {
        const categories = {};

        this.shortcuts.forEach((value, key) => {
            if (!categories[value.category]) {
                categories[value.category] = [];
            }
            // Avoid duplicate descriptions
            if (!categories[value.category].find(s => s.description === value.description)) {
                categories[value.category].push({ key, ...value });
            }
        });

        return Object.entries(categories).map(([category, shortcuts]) => `
            <div class="shortcuts-category">
                <h4>${category}</h4>
                <div class="shortcuts-list">
                    ${shortcuts.map(s => `
                        <div class="shortcut-item">
                            <span class="shortcut-key">${this.formatKey(s.key)}</span>
                            <span class="shortcut-desc">${s.description}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    formatKey(key) {
        return key
            .split('+')
            .map(k => {
                if (k === 'ctrl') return '⌘/Ctrl';
                if (k === 'shift') return '⇧';
                if (k === 'alt') return '⌥/Alt';
                if (k === 'delete') return 'Del';
                if (k === 'backspace') return '⌫';
                return k.toUpperCase();
            })
            .join(' + ');
    }

    showModal() {
        this.modal.classList.remove('hidden');
    }

    hideModal() {
        this.modal.classList.add('hidden');
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }
}
