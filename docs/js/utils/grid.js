/**
 * Grid and Snap functionality
 */

export class Grid {
    constructor(canvas, app) {
        this.canvas = canvas;
        this.app = app;

        this.enabled = true;
        this.visible = true;
        this.size = 20;
        this.snapThreshold = 10;

        this.gridPattern = null;
        this.init();
    }

    init() {
        this.createGridPattern();
        this.render();
    }

    createGridPattern() {
        const defs = document.getElementById('canvas-defs');

        // Create grid pattern
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'grid-pattern');
        pattern.setAttribute('width', this.size);
        pattern.setAttribute('height', this.size);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');

        // Minor grid lines
        const minorLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        minorLine1.setAttribute('d', `M ${this.size} 0 L 0 0 0 ${this.size}`);
        minorLine1.setAttribute('fill', 'none');
        minorLine1.setAttribute('stroke', '#30363d');
        minorLine1.setAttribute('stroke-width', '0.5');
        minorLine1.setAttribute('opacity', '0.5');

        pattern.appendChild(minorLine1);
        defs.appendChild(pattern);

        // Major grid pattern (every 5 cells)
        const majorPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        majorPattern.setAttribute('id', 'grid-major-pattern');
        majorPattern.setAttribute('width', this.size * 5);
        majorPattern.setAttribute('height', this.size * 5);
        majorPattern.setAttribute('patternUnits', 'userSpaceOnUse');

        const majorLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        majorLine.setAttribute('d', `M ${this.size * 5} 0 L 0 0 0 ${this.size * 5}`);
        majorLine.setAttribute('fill', 'none');
        majorLine.setAttribute('stroke', '#484f58');
        majorLine.setAttribute('stroke-width', '1');
        majorLine.setAttribute('opacity', '0.5');

        majorPattern.appendChild(majorLine);
        defs.appendChild(majorPattern);

        this.gridPattern = pattern;
    }

    render() {
        // Remove existing grid
        const existingGrid = document.getElementById('grid-layer');
        if (existingGrid) existingGrid.remove();

        if (!this.visible) return;

        const svg = document.getElementById('canvas');
        const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        const [, , width, height] = viewBox;

        // Create grid layer (should be behind content)
        const gridLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gridLayer.setAttribute('id', 'grid-layer');
        gridLayer.style.pointerEvents = 'none';

        // Minor grid
        const minorGrid = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        minorGrid.setAttribute('width', width);
        minorGrid.setAttribute('height', height);
        minorGrid.setAttribute('fill', 'url(#grid-pattern)');

        // Major grid
        const majorGrid = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        majorGrid.setAttribute('width', width);
        majorGrid.setAttribute('height', height);
        majorGrid.setAttribute('fill', 'url(#grid-major-pattern)');

        gridLayer.appendChild(minorGrid);
        gridLayer.appendChild(majorGrid);

        // Insert after background
        const bg = document.getElementById('canvas-bg');
        bg.parentNode.insertBefore(gridLayer, bg.nextSibling);
    }

    toggle() {
        this.visible = !this.visible;
        this.render();
        return this.visible;
    }

    toggleSnap() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setSize(size) {
        this.size = size;
        this.gridPattern.setAttribute('width', size);
        this.gridPattern.setAttribute('height', size);
        this.render();
    }

    snapPoint(point) {
        if (!this.enabled) return point;

        return {
            x: Math.round(point.x / this.size) * this.size,
            y: Math.round(point.y / this.size) * this.size
        };
    }

    snapValue(value) {
        if (!this.enabled) return value;
        return Math.round(value / this.size) * this.size;
    }

    // Smart snap - snap to nearby elements
    smartSnap(point, excludeElement) {
        if (!this.enabled) return { point, guides: [] };

        const guides = [];
        const content = document.getElementById('canvas-content');
        const elements = Array.from(content.children).filter(el => el !== excludeElement);

        let snappedX = point.x;
        let snappedY = point.y;

        elements.forEach(el => {
            const bbox = el.getBBox();

            // Horizontal alignment
            if (Math.abs(point.x - bbox.x) < this.snapThreshold) {
                snappedX = bbox.x;
                guides.push({ type: 'vertical', x: bbox.x });
            }
            if (Math.abs(point.x - (bbox.x + bbox.width / 2)) < this.snapThreshold) {
                snappedX = bbox.x + bbox.width / 2;
                guides.push({ type: 'vertical', x: bbox.x + bbox.width / 2 });
            }
            if (Math.abs(point.x - (bbox.x + bbox.width)) < this.snapThreshold) {
                snappedX = bbox.x + bbox.width;
                guides.push({ type: 'vertical', x: bbox.x + bbox.width });
            }

            // Vertical alignment
            if (Math.abs(point.y - bbox.y) < this.snapThreshold) {
                snappedY = bbox.y;
                guides.push({ type: 'horizontal', y: bbox.y });
            }
            if (Math.abs(point.y - (bbox.y + bbox.height / 2)) < this.snapThreshold) {
                snappedY = bbox.y + bbox.height / 2;
                guides.push({ type: 'horizontal', y: bbox.y + bbox.height / 2 });
            }
            if (Math.abs(point.y - (bbox.y + bbox.height)) < this.snapThreshold) {
                snappedY = bbox.y + bbox.height;
                guides.push({ type: 'horizontal', y: bbox.y + bbox.height });
            }
        });

        return {
            point: { x: snappedX, y: snappedY },
            guides
        };
    }

    showGuides(guides) {
        this.clearGuides();

        const svg = document.getElementById('canvas');
        const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        const [, , width, height] = viewBox;

        const guidesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        guidesLayer.setAttribute('id', 'snap-guides');
        guidesLayer.style.pointerEvents = 'none';

        guides.forEach(guide => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

            if (guide.type === 'vertical') {
                line.setAttribute('x1', guide.x);
                line.setAttribute('y1', 0);
                line.setAttribute('x2', guide.x);
                line.setAttribute('y2', height);
            } else {
                line.setAttribute('x1', 0);
                line.setAttribute('y1', guide.y);
                line.setAttribute('x2', width);
                line.setAttribute('y2', guide.y);
            }

            line.setAttribute('stroke', '#f59e0b');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '4 4');
            line.style.opacity = '0.8';

            guidesLayer.appendChild(line);
        });

        svg.appendChild(guidesLayer);
    }

    clearGuides() {
        const existing = document.getElementById('snap-guides');
        if (existing) existing.remove();
    }
}
