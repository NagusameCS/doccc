/**
 * Doccc Baseplate Editor - Main Application
 * A Figma-like visual editor for creating SVG baseplates
 */

import { Canvas } from './canvas.js';
import { LayersPanel } from './panels/layers.js';
import { ComponentsPanel } from './panels/components.js';
import { CommunityPanel } from './panels/community.js';
import { PropertiesPanel } from './panels/properties.js';
import { Timeline } from './timeline.js';
import { Storage } from './storage.js';
import { exportSVG, downloadSVG } from './utils/export.js';

class App {
  constructor() {
    this.canvas = null;
    this.layers = null;
    this.components = null;
    this.community = null;
    this.properties = null;
    this.timeline = null;
    this.storage = null;
    
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
    this.community = new CommunityPanel('community-list', this);
    this.properties = new PropertiesPanel('properties-panel', this);
    this.timeline = new Timeline('timeline-panel', this);
    
    // Load baseplates catalog
    await this.components.loadBaseplates();
    await this.community.loadCommunityBaseplates();
    
    // Setup event listeners
    this.setupToolbar();
    this.setupPanelTabs();
    this.setupZoomControls();
    this.setupModals();
    this.setupKeyboardShortcuts();
    
    console.log('Doccc Baseplate Editor initialized');
  }
  
  setupToolbar() {
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTool(btn.dataset.tool);
      });
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
      // TODO: Show toast notification
    });
    
    document.getElementById('download-svg').addEventListener('click', () => {
      const name = document.getElementById('baseplate-name').value || 'baseplate';
      const code = document.getElementById('export-code').value;
      downloadSVG(code, name);
      this.closeModals();
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
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'v': this.setTool('select'); break;
        case 'h': this.setTool('move'); break;
        case 'r': this.setTool('rect'); break;
        case 'o': this.setTool('circle'); break;
        case 't': this.setTool('text'); break;
        case 'p': this.setTool('path'); break;
        case 'delete':
        case 'backspace':
          if (this.selectedElements.length > 0) {
            this.canvas.deleteSelected();
          }
          break;
        case 'escape':
          this.canvas.clearSelection();
          this.closeModals();
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.shiftKey ? this.canvas.redo() : this.canvas.undo();
          }
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            this.canvas.copy();
          }
          break;
        case 'v':
          if (e.ctrlKey || e.metaKey) {
            this.canvas.paste();
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.saveProject();
          }
          break;
      }
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
    
    // TODO: Show success toast
    console.log('Baseplate published:', baseplate.name);
  }
  
  async saveProject() {
    const project = {
      name: document.getElementById('baseplate-name').value,
      canvas: this.canvas.serialize(),
      timeline: this.timeline.serialize(),
      savedAt: new Date().toISOString()
    };
    
    await this.storage.saveProject(project);
    console.log('Project saved');
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
