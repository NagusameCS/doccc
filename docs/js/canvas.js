/**
 * Canvas - SVG canvas management and drawing
 */

export class Canvas {
    constructor(canvasId, app) {
        this.app = app;
        this.svg = document.getElementById(canvasId);
        this.content = document.getElementById('canvas-content');
        this.defs = document.getElementById('canvas-defs');
        this.styles = document.getElementById('canvas-styles');
        this.selectionOverlay = document.getElementById('selection-overlay');

        this.tool = 'select';
        this.isDrawing = false;
        this.startPoint = null;
        this.currentElement = null;
        this.selectedElement = null;

        this.history = [];
        this.historyIndex = -1;
        this.clipboard = null;

        this.idCounter = 0;

        this.setupEvents();
        this.saveState();
    }

    setupEvents() {
        this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.svg.addEventListener('click', this.handleClick.bind(this));
    }

    setTool(tool) {
        this.tool = tool;
        this.svg.style.cursor = this.getCursor(tool);
        this.clearSelection();
    }

    getCursor(tool) {
        const cursors = {
            select: 'default',
            move: 'move',
            rect: 'crosshair',
            circle: 'crosshair',
            text: 'text',
            path: 'crosshair'
        };
        return cursors[tool] || 'default';
    }

    getMousePosition(e) {
        const CTM = this.svg.getScreenCTM();
        return {
            x: (e.clientX - CTM.e) / CTM.a,
            y: (e.clientY - CTM.f) / CTM.d
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePosition(e);
        this.startPoint = pos;

        if (this.tool === 'select') {
            // Check if clicking on an element
            const target = e.target;
            if (target !== this.svg && target.id !== 'canvas-bg') {
                this.selectElement(target);
                this.isDragging = true;
                this.dragOffset = {
                    x: pos.x - (parseFloat(target.getAttribute('x')) || 0),
                    y: pos.y - (parseFloat(target.getAttribute('y')) || 0)
                };
            } else {
                this.clearSelection();
            }
        } else if (['rect', 'circle', 'path'].includes(this.tool)) {
            this.isDrawing = true;
            this.currentElement = this.createElement(this.tool, pos);
            this.content.appendChild(this.currentElement);
        }
    }

    handleMouseMove(e) {
        const pos = this.getMousePosition(e);

        if (this.isDrawing && this.currentElement) {
            this.updateElement(this.currentElement, this.startPoint, pos);
        }

        if (this.isDragging && this.selectedElement) {
            this.moveElement(this.selectedElement, pos);
        }
    }

    handleMouseUp(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            if (this.currentElement) {
                this.selectElement(this.currentElement);
                this.saveState();
            }
            this.currentElement = null;
        }

        if (this.isDragging) {
            this.isDragging = false;
            this.saveState();
        }
    }

    handleClick(e) {
        if (this.tool === 'text') {
            const pos = this.getMousePosition(e);
            const text = prompt('Enter text:');
            if (text) {
                const element = this.createTextElement(pos, text);
                this.content.appendChild(element);
                this.selectElement(element);
                this.saveState();
            }
        }
    }

    createElement(type, pos) {
        const id = `element-${++this.idCounter}`;
        let element;

        switch (type) {
            case 'rect':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                element.setAttribute('x', pos.x);
                element.setAttribute('y', pos.y);
                element.setAttribute('width', 0);
                element.setAttribute('height', 0);
                element.setAttribute('fill', '#3b82f6');
                element.setAttribute('rx', 4);
                break;

            case 'circle':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                element.setAttribute('cx', pos.x);
                element.setAttribute('cy', pos.y);
                element.setAttribute('r', 0);
                element.setAttribute('fill', '#3b82f6');
                break;

            case 'path':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', `M ${pos.x} ${pos.y}`);
                element.setAttribute('stroke', '#3b82f6');
                element.setAttribute('stroke-width', 2);
                element.setAttribute('fill', 'none');
                break;
        }

        element.setAttribute('id', id);
        element.setAttribute('data-name', `${type.charAt(0).toUpperCase() + type.slice(1)} ${this.idCounter}`);

        return element;
    }

    createTextElement(pos, text) {
        const id = `element-${++this.idCounter}`;
        const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        element.setAttribute('id', id);
        element.setAttribute('x', pos.x);
        element.setAttribute('y', pos.y);
        element.setAttribute('fill', '#1f2937');
        element.setAttribute('font-family', 'system-ui, sans-serif');
        element.setAttribute('font-size', '16');
        element.setAttribute('data-name', `Text ${this.idCounter}`);
        element.textContent = text;

        return element;
    }

    updateElement(element, start, end) {
        const type = element.tagName.toLowerCase();

        switch (type) {
            case 'rect':
                const width = Math.abs(end.x - start.x);
                const height = Math.abs(end.y - start.y);
                const x = Math.min(start.x, end.x);
                const y = Math.min(start.y, end.y);
                element.setAttribute('x', x);
                element.setAttribute('y', y);
                element.setAttribute('width', width);
                element.setAttribute('height', height);
                break;

            case 'circle':
                const radius = Math.sqrt(
                    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
                );
                element.setAttribute('r', radius);
                break;

            case 'path':
                const d = element.getAttribute('d');
                element.setAttribute('d', `${d} L ${end.x} ${end.y}`);
                break;
        }
    }

    moveElement(element, pos) {
        const type = element.tagName.toLowerCase();

        if (type === 'circle') {
            element.setAttribute('cx', pos.x - this.dragOffset.x);
            element.setAttribute('cy', pos.y - this.dragOffset.y);
        } else if (type === 'g') {
            element.setAttribute('transform', `translate(${pos.x - this.dragOffset.x}, ${pos.y - this.dragOffset.y})`);
        } else {
            element.setAttribute('x', pos.x - this.dragOffset.x);
            element.setAttribute('y', pos.y - this.dragOffset.y);
        }

        this.updateSelectionOverlay();
    }

    selectElement(element) {
        this.selectedElement = element;
        this.app.selectElement(element);
        this.updateSelectionOverlay();
    }

    clearSelection() {
        this.selectedElement = null;
        this.selectionOverlay.innerHTML = '';
        this.app.selectElement(null);
    }

    updateSelectionOverlay() {
        this.selectionOverlay.innerHTML = '';

        if (!this.selectedElement) return;

        const bbox = this.selectedElement.getBBox();
        const padding = 4;

        // Selection rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', bbox.x - padding);
        rect.setAttribute('y', bbox.y - padding);
        rect.setAttribute('width', bbox.width + padding * 2);
        rect.setAttribute('height', bbox.height + padding * 2);
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', '#3b82f6');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('stroke-dasharray', '4 2');

        this.selectionOverlay.appendChild(rect);

        // Resize handles
        const handles = [
            { x: bbox.x - padding, y: bbox.y - padding, cursor: 'nw-resize' },
            { x: bbox.x + bbox.width / 2, y: bbox.y - padding, cursor: 'n-resize' },
            { x: bbox.x + bbox.width + padding, y: bbox.y - padding, cursor: 'ne-resize' },
            { x: bbox.x + bbox.width + padding, y: bbox.y + bbox.height / 2, cursor: 'e-resize' },
            { x: bbox.x + bbox.width + padding, y: bbox.y + bbox.height + padding, cursor: 'se-resize' },
            { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height + padding, cursor: 's-resize' },
            { x: bbox.x - padding, y: bbox.y + bbox.height + padding, cursor: 'sw-resize' },
            { x: bbox.x - padding, y: bbox.y + bbox.height / 2, cursor: 'w-resize' }
        ];

        handles.forEach(h => {
            const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            handle.setAttribute('x', h.x - 4);
            handle.setAttribute('y', h.y - 4);
            handle.setAttribute('width', 8);
            handle.setAttribute('height', 8);
            handle.setAttribute('fill', 'white');
            handle.setAttribute('stroke', '#3b82f6');
            handle.setAttribute('stroke-width', '1');
            handle.style.cursor = h.cursor;
            this.selectionOverlay.appendChild(handle);
        });
    }

    deleteSelected() {
        if (this.selectedElement) {
            this.selectedElement.remove();
            this.clearSelection();
            this.saveState();
            this.app.layers.refresh();
        }
    }

    copy() {
        if (this.selectedElement) {
            this.clipboard = this.selectedElement.cloneNode(true);
        }
    }

    paste() {
        if (this.clipboard) {
            const clone = this.clipboard.cloneNode(true);
            clone.setAttribute('id', `element-${++this.idCounter}`);

            // Offset position
            const x = parseFloat(clone.getAttribute('x') || 0) + 20;
            const y = parseFloat(clone.getAttribute('y') || 0) + 20;
            clone.setAttribute('x', x);
            clone.setAttribute('y', y);

            this.content.appendChild(clone);
            this.selectElement(clone);
            this.saveState();
            this.app.layers.refresh();
        }
    }

    saveState() {
        // Remove any redo states
        this.history = this.history.slice(0, this.historyIndex + 1);

        // Save current state
        this.history.push(this.content.innerHTML);
        this.historyIndex++;

        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.content.innerHTML = this.history[this.historyIndex];
            this.clearSelection();
            this.app.layers.refresh();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.content.innerHTML = this.history[this.historyIndex];
            this.clearSelection();
            this.app.layers.refresh();
        }
    }

    getContent() {
        return {
            defs: this.defs.innerHTML,
            styles: this.styles.textContent,
            content: this.content.innerHTML,
            viewBox: this.svg.getAttribute('viewBox')
        };
    }

    serialize() {
        return {
            defs: this.defs.innerHTML,
            styles: this.styles.textContent,
            content: this.content.innerHTML,
            viewBox: this.svg.getAttribute('viewBox'),
            idCounter: this.idCounter
        };
    }

    loadSVG(svgContent) {
        // Parse the SVG string
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svg = doc.querySelector('svg');

        if (!svg) return;

        // Extract and load defs
        const defs = svg.querySelector('defs');
        if (defs) {
            this.defs.innerHTML = defs.innerHTML;
        }

        // Extract and load styles
        const style = svg.querySelector('style');
        if (style) {
            this.styles.textContent = style.textContent;
        }

        // Load content (everything except defs, style, and background)
        this.content.innerHTML = '';
        Array.from(svg.children).forEach(child => {
            if (child.tagName !== 'defs' && child.tagName !== 'style') {
                // Skip background rect if present
                if (child.tagName === 'rect' && child.getAttribute('id') === 'canvas-bg') {
                    return;
                }
                const clone = child.cloneNode(true);
                this.content.appendChild(clone);
            }
        });

        // Update viewBox
        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
            this.svg.setAttribute('viewBox', viewBox);
        }

        this.saveState();
        this.app.layers.refresh();
    }

    addElement(element) {
        this.content.appendChild(element);
        this.selectElement(element);
        this.saveState();
        this.app.layers.refresh();
    }
}
