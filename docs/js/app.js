/**
 * Doccc Baseplate Editor - Main Application
 * A Figma-like visual editor for creating SVG baseplates
 */

import { Canvas } from './canvas.js';
import { LayersPanel } from './panels/layers.js';
import { ComponentsPanel } from './panels/components.js';
import { FavoritesPanel } from './panels/favorites.js';
import { PropertiesPanel } from './panels/properties.js';
import { Timeline } from './timeline.js';
import { Storage } from './storage.js';
import { exportSVG, downloadSVG } from './utils/export.js';
import { ToastManager } from './utils/toast.js';
import { ContextMenu } from './utils/context-menu.js';
import { Grid } from './utils/grid.js';
import { GradientEditor } from './utils/gradient-editor.js';
import { KeyboardShortcuts } from './utils/keyboard-shortcuts.js';
import { WelcomeScreen } from './utils/welcome.js';

class App {
    constructor() {
        this.canvas = null;
        this.layers = null;
        this.components = null;
        this.favorites = null;
        this.properties = null;
        this.timeline = null;
        this.storage = null;

        // Utilities
        this.toast = null;
        this.contextMenu = null;
        this.grid = null;
        this.gradientEditor = null;
        this.shortcuts = null;
        this.welcome = null;

        this.currentTool = 'select';
        this.zoom = 1;
        this.selectedElements = [];

        this.init();
    }

    async init() {
        // Initialize storage
        this.storage = new Storage();

        // Initialize canvas
        this.canvas = new Canvas('canvas', this);

        // Initialize panels
        this.layers = new LayersPanel('layers-list', this);
        this.components = new ComponentsPanel('component-categories', this);
        this.favorites = new FavoritesPanel('favorites-list', this);
        this.properties = new PropertiesPanel('properties-panel', this);
        this.timeline = new Timeline('timeline-panel', this);

        // Initialize utilities
        this.toast = new ToastManager();
        this.contextMenu = new ContextMenu(this);
        this.grid = new Grid(this.canvas.svg);
        this.gradientEditor = new GradientEditor(this);
        this.shortcuts = new KeyboardShortcuts(this);
        this.welcome = new WelcomeScreen(this);

        // Load baseplates catalog
        await this.components.loadBaseplates();

        // Setup event listeners
        this.setupToolbar();
        this.setupPanelTabs();
        this.setupZoomControls();
        this.setupModals();
        this.setupGridControls();

        console.log('Doccc Baseplate Editor initialized');
        this.toast.info('Editor ready! Press ? for keyboard shortcuts.');
    }

    setupToolbar() {
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTool(btn.dataset.tool);
            });
        });

        // Undo/Redo buttons
        document.getElementById('btn-undo').addEventListener('click', () => {
            this.canvas.undo();
        });

        document.getElementById('btn-redo').addEventListener('click', () => {
            this.canvas.redo();
        });

        // Help button
        document.getElementById('btn-help').addEventListener('click', () => {
            this.shortcuts.showModal();
        });

        // Preview button
        document.getElementById('btn-preview').addEventListener('click', () => {
            this.showPreview();
        });

        // Export button
        document.getElementById('btn-export').addEventListener('click', () => {
            this.showExportModal();
        });

        // Publish button
        document.getElementById('btn-publish').addEventListener('click', () => {
            this.showPublishModal();
        });
    }

    setupPanelTabs() {
        const tabs = document.querySelectorAll('.panel-tab');
        const panels = {
            layers: document.getElementById('panel-layers'),
            components: document.getElementById('panel-components'),
            community: document.getElementById('panel-community')
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show corresponding panel
                Object.values(panels).forEach(p => p.classList.add('hidden'));
                panels[tab.dataset.panel].classList.remove('hidden');
            });
        });

        // Collapsible panels
        document.querySelectorAll('.panel-header.collapsible').forEach(header => {
            header.addEventListener('click', () => {
                const target = document.getElementById(header.dataset.target);
                target.classList.toggle('hidden');
                header.querySelector('svg').style.transform =
                    target.classList.contains('hidden') ? 'rotate(-90deg)' : '';
            });
        });
    }

    setupZoomControls() {
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.setZoom(Math.min(this.zoom + 0.1, 3));
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.setZoom(Math.max(this.zoom - 0.1, 0.1));
        });

        document.getElementById('zoom-fit').addEventListener('click', () => {
            this.fitToCanvas();
        });

        // Mouse wheel zoom
        document.getElementById('canvas-wrapper').addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.setZoom(Math.max(0.1, Math.min(3, this.zoom + delta)));
            }
        });
    }

    setupModals() {
        const overlay = document.getElementById('modal-overlay');

        // Close modal on overlay click or close button
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.classList.contains('modal-close')) {
                this.closeModals();
            }
        });

        // Export modal actions
        document.getElementById('copy-svg').addEventListener('click', () => {
            const code = document.getElementById('export-code').value;
            navigator.clipboard.writeText(code);
            this.toast.success('SVG copied to clipboard!');
        });

        document.getElementById('download-svg').addEventListener('click', () => {
            const name = document.getElementById('baseplate-name').value || 'baseplate';
            const code = document.getElementById('export-code').value;
            downloadSVG(code, name);
            this.closeModals();
            this.toast.success('SVG downloaded!');
        });

        // Publish modal actions
        document.getElementById('do-publish').addEventListener('click', () => {
            this.publishBaseplate();
        });

        // Preview theme toggle
        document.querySelectorAll('.preview-controls button').forEach(btn => {
            btn.addEventListener('click', () => {
                const frame = document.getElementById('preview-frame');
                frame.classList.toggle('dark', btn.dataset.theme === 'dark');
            });
        });
    }

    setupGridControls() {
        // Add grid toggle buttons to canvas controls
        const canvasContainer = document.querySelector('.canvas-container');
        const gridToggle = document.createElement('div');
        gridToggle.className = 'grid-toggle';
        gridToggle.innerHTML = `
            <button class="btn-icon" id="toggle-grid" title="Toggle Grid (')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                    <line x1="15" y1="3" x2="15" y2="21"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="3" y1="15" x2="21" y2="15"/>
                </svg>
            </button>
            <button class="btn-icon" id="toggle-snap" title="Toggle Snap (Ctrl+;)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            </button>
        `;
        canvasContainer.appendChild(gridToggle);

        document.getElementById('toggle-grid').addEventListener('click', () => {
            const active = this.grid.toggle();
            document.getElementById('toggle-grid').classList.toggle('active', active);
        });

        document.getElementById('toggle-snap').addEventListener('click', () => {
            const active = this.grid.toggleSnap();
            document.getElementById('toggle-snap').classList.toggle('active', active);
            this.toast.info(active ? 'Snap to grid enabled' : 'Snap to grid disabled');
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
        this.canvas.setTool(tool);
    }

    setZoom(level) {
        this.zoom = level;
        document.getElementById('zoom-level').textContent = `${Math.round(level * 100)}%`;
        document.getElementById('canvas').style.transform = `scale(${level})`;
    }

    fitToCanvas() {
        const wrapper = document.getElementById('canvas-wrapper');
        const canvas = document.getElementById('canvas');
        const wrapperRect = wrapper.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const scaleX = (wrapperRect.width - 80) / (canvasRect.width / this.zoom);
        const scaleY = (wrapperRect.height - 80) / (canvasRect.height / this.zoom);

        this.setZoom(Math.min(scaleX, scaleY, 1));
    }

    selectElement(element) {
        this.selectedElements = element ? [element] : [];
        this.properties.update(element);
        this.layers.highlightLayer(element?.id);
    }

    showPreview() {
        const modal = document.getElementById('preview-modal');
        const frame = document.getElementById('preview-frame');
        const svg = exportSVG(this.canvas.getContent());

        frame.innerHTML = svg;
        this.openModal('preview-modal');
    }

    showExportModal() {
        const preview = document.getElementById('export-preview');
        const codeArea = document.getElementById('export-code');
        const svg = exportSVG(this.canvas.getContent(), {
            minify: document.getElementById('export-minify').checked,
            includeAnimations: document.getElementById('export-include-animations').checked
        });

        preview.innerHTML = svg;
        codeArea.value = svg;
        this.openModal('export-modal');
    }

    showPublishModal() {
        const nameInput = document.getElementById('publish-name');
        nameInput.value = document.getElementById('baseplate-name').value;
        this.openModal('publish-modal');
    }

    openModal(modalId) {
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.getElementById(modalId).classList.remove('hidden');
    }

    closeModals() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }

    async publishBaseplate() {
        const baseplate = {
            id: `community-${Date.now()}`,
            name: document.getElementById('publish-name').value,
            description: document.getElementById('publish-description').value,
            category: document.getElementById('publish-category').value,
            tags: document.getElementById('publish-tags').value.split(',').map(t => t.trim()),
            svg: exportSVG(this.canvas.getContent()),
            author: 'You', // TODO: Get from user profile
            publishedAt: new Date().toISOString(),
            downloads: 0
        };

        await this.storage.publishBaseplate(baseplate);
        await this.community.loadCommunityBaseplates();
        this.closeModals();

        this.toast.success(`"${baseplate.name}" published successfully!`);
    }

    async saveProject() {
        const project = {
            name: document.getElementById('baseplate-name').value,
            canvas: this.canvas.serialize(),
            timeline: this.timeline.serialize(),
            savedAt: new Date().toISOString()
        };

        await this.storage.saveProject(project);
        this.toast.success('Project saved!');
    }

    newProject() {
        if (confirm('Start a new project? Unsaved changes will be lost.')) {
            this.canvas.clear();
            document.getElementById('baseplate-name').value = 'Untitled Baseplate';
            this.layers.refresh();
            this.timeline.refresh();
            this.toast.info('New project started');
        }
    }

    openProject() {
        // TODO: Implement project opening
        this.toast.info('Open project coming soon!');
    }

    saveProjectAs() {
        // TODO: Implement save as
        this.showExportModal();
    }

    exportAsPNG() {
        // TODO: Implement PNG export
        this.toast.info('PNG export coming soon!');
    }

    zoomToFit() {
        this.fitToCanvas();
    }

    showGradientEditor(element) {
        this.gradientEditor.show(element);
    }

    async loadBaseplate(baseplateId) {
        const baseplate = await this.components.getBaseplate(baseplateId);
        if (baseplate) {
            this.canvas.loadSVG(baseplate.svg);
            document.getElementById('baseplate-name').value = baseplate.name;
            this.layers.refresh();
            this.timeline.refresh();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
