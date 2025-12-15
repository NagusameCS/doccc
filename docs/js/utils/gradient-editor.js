/**
 * Gradient Editor - Create and edit gradients
 */

export class GradientEditor {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.gradientType = 'linear';
        this.stops = [
            { offset: 0, color: '#3b82f6' },
            { offset: 100, color: '#8b5cf6' }
        ];
        this.angle = 90;
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'gradient-modal hidden';
        this.modal.innerHTML = `
            <div class="gradient-editor">
                <div class="gradient-header">
                    <h4>Gradient Editor</h4>
                    <button class="btn-icon gradient-close">×</button>
                </div>
                
                <div class="gradient-preview" id="gradient-preview">
                    <div class="gradient-sample" id="gradient-sample"></div>
                </div>
                
                <div class="gradient-type">
                    <button class="type-btn active" data-type="linear">Linear</button>
                    <button class="type-btn" data-type="radial">Radial</button>
                </div>
                
                <div class="gradient-angle" id="gradient-angle-section">
                    <label>Angle</label>
                    <input type="range" id="gradient-angle" min="0" max="360" value="90">
                    <span id="gradient-angle-value">90°</span>
                </div>
                
                <div class="gradient-stops" id="gradient-stops">
                    <div class="stops-track" id="stops-track">
                        <div class="stop-marker" data-index="0" style="left: 0%"></div>
                        <div class="stop-marker" data-index="1" style="left: 100%"></div>
                    </div>
                </div>
                
                <div class="stop-colors" id="stop-colors">
                    <!-- Populated dynamically -->
                </div>
                
                <div class="gradient-presets">
                    <h5>Presets</h5>
                    <div class="preset-list" id="gradient-presets">
                        <div class="preset" data-preset="blue-purple" style="background: linear-gradient(90deg, #3b82f6, #8b5cf6)"></div>
                        <div class="preset" data-preset="green-teal" style="background: linear-gradient(90deg, #22c55e, #14b8a6)"></div>
                        <div class="preset" data-preset="orange-red" style="background: linear-gradient(90deg, #f59e0b, #ef4444)"></div>
                        <div class="preset" data-preset="pink-purple" style="background: linear-gradient(90deg, #ec4899, #8b5cf6)"></div>
                        <div class="preset" data-preset="dark" style="background: linear-gradient(90deg, #1f2937, #374151)"></div>
                        <div class="preset" data-preset="sunset" style="background: linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)"></div>
                        <div class="preset" data-preset="ocean" style="background: linear-gradient(90deg, #0ea5e9, #06b6d4, #14b8a6)"></div>
                        <div class="preset" data-preset="fire" style="background: linear-gradient(90deg, #fbbf24, #f59e0b, #ef4444)"></div>
                    </div>
                </div>
                
                <div class="gradient-actions">
                    <button class="btn btn-ghost" id="gradient-cancel">Cancel</button>
                    <button class="btn btn-primary" id="gradient-apply">Apply</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.setupEvents();
    }

    setupEvents() {
        // Close button
        this.modal.querySelector('.gradient-close').addEventListener('click', () => this.hide());
        this.modal.querySelector('#gradient-cancel').addEventListener('click', () => this.hide());

        // Type buttons
        this.modal.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.modal.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gradientType = btn.dataset.type;

                // Show/hide angle for linear
                const angleSection = this.modal.querySelector('#gradient-angle-section');
                angleSection.style.display = this.gradientType === 'linear' ? 'flex' : 'none';

                this.updatePreview();
            });
        });

        // Angle slider
        this.modal.querySelector('#gradient-angle').addEventListener('input', (e) => {
            this.angle = parseInt(e.target.value);
            this.modal.querySelector('#gradient-angle-value').textContent = `${this.angle}°`;
            this.updatePreview();
        });

        // Presets
        this.modal.querySelectorAll('.preset').forEach(preset => {
            preset.addEventListener('click', () => {
                this.loadPreset(preset.dataset.preset);
            });
        });

        // Apply button
        this.modal.querySelector('#gradient-apply').addEventListener('click', () => {
            this.applyGradient();
        });

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide();
        });
    }

    show(element) {
        this.targetElement = element;
        this.modal.classList.remove('hidden');
        this.updateStopColors();
        this.updatePreview();
    }

    hide() {
        this.modal.classList.add('hidden');
    }

    updatePreview() {
        const sample = this.modal.querySelector('#gradient-sample');
        const stopsString = this.stops
            .map(s => `${s.color} ${s.offset}%`)
            .join(', ');

        if (this.gradientType === 'linear') {
            sample.style.background = `linear-gradient(${this.angle}deg, ${stopsString})`;
        } else {
            sample.style.background = `radial-gradient(circle, ${stopsString})`;
        }

        // Update stop markers
        const track = this.modal.querySelector('#stops-track');
        track.innerHTML = '';
        track.style.background = sample.style.background;

        this.stops.forEach((stop, index) => {
            const marker = document.createElement('div');
            marker.className = 'stop-marker';
            marker.dataset.index = index;
            marker.style.left = `${stop.offset}%`;
            marker.style.backgroundColor = stop.color;

            // Make draggable
            marker.addEventListener('mousedown', (e) => this.startDragStop(e, index));

            track.appendChild(marker);
        });
    }

    updateStopColors() {
        const container = this.modal.querySelector('#stop-colors');
        container.innerHTML = '';

        this.stops.forEach((stop, index) => {
            const row = document.createElement('div');
            row.className = 'stop-color-row';
            row.innerHTML = `
                <input type="color" value="${stop.color}" data-index="${index}">
                <input type="number" value="${stop.offset}" min="0" max="100" data-index="${index}">
                <span>%</span>
                ${this.stops.length > 2 ? `<button class="btn-icon remove-stop" data-index="${index}">×</button>` : ''}
            `;

            // Color change
            row.querySelector('input[type="color"]').addEventListener('input', (e) => {
                this.stops[index].color = e.target.value;
                this.updatePreview();
            });

            // Offset change
            row.querySelector('input[type="number"]').addEventListener('input', (e) => {
                this.stops[index].offset = parseInt(e.target.value) || 0;
                this.updatePreview();
            });

            // Remove stop
            const removeBtn = row.querySelector('.remove-stop');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.stops.splice(index, 1);
                    this.updateStopColors();
                    this.updatePreview();
                });
            }

            container.appendChild(row);
        });

        // Add stop button
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-sm btn-ghost';
        addBtn.textContent = '+ Add Color Stop';
        addBtn.addEventListener('click', () => {
            const newOffset = 50;
            this.stops.push({ offset: newOffset, color: '#ffffff' });
            this.stops.sort((a, b) => a.offset - b.offset);
            this.updateStopColors();
            this.updatePreview();
        });
        container.appendChild(addBtn);
    }

    startDragStop(e, index) {
        e.preventDefault();
        const track = this.modal.querySelector('#stops-track');
        const trackRect = track.getBoundingClientRect();

        const onMove = (moveEvent) => {
            const x = moveEvent.clientX - trackRect.left;
            const percent = Math.max(0, Math.min(100, (x / trackRect.width) * 100));
            this.stops[index].offset = Math.round(percent);
            this.updatePreview();
            this.updateStopColors();
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            this.stops.sort((a, b) => a.offset - b.offset);
            this.updateStopColors();
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    loadPreset(presetName) {
        const presets = {
            'blue-purple': [{ offset: 0, color: '#3b82f6' }, { offset: 100, color: '#8b5cf6' }],
            'green-teal': [{ offset: 0, color: '#22c55e' }, { offset: 100, color: '#14b8a6' }],
            'orange-red': [{ offset: 0, color: '#f59e0b' }, { offset: 100, color: '#ef4444' }],
            'pink-purple': [{ offset: 0, color: '#ec4899' }, { offset: 100, color: '#8b5cf6' }],
            'dark': [{ offset: 0, color: '#1f2937' }, { offset: 100, color: '#374151' }],
            'sunset': [{ offset: 0, color: '#f97316' }, { offset: 50, color: '#ec4899' }, { offset: 100, color: '#8b5cf6' }],
            'ocean': [{ offset: 0, color: '#0ea5e9' }, { offset: 50, color: '#06b6d4' }, { offset: 100, color: '#14b8a6' }],
            'fire': [{ offset: 0, color: '#fbbf24' }, { offset: 50, color: '#f59e0b' }, { offset: 100, color: '#ef4444' }]
        };

        if (presets[presetName]) {
            this.stops = [...presets[presetName]];
            this.updateStopColors();
            this.updatePreview();
        }
    }

    applyGradient() {
        if (!this.targetElement) return;

        const gradientId = `gradient-${Date.now()}`;
        const defs = document.getElementById('canvas-defs');

        // Create gradient element
        let gradient;
        if (this.gradientType === 'linear') {
            gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', gradientId);

            // Convert angle to coordinates
            const angle = this.angle * Math.PI / 180;
            const x1 = 50 - Math.cos(angle) * 50;
            const y1 = 50 + Math.sin(angle) * 50;
            const x2 = 50 + Math.cos(angle) * 50;
            const y2 = 50 - Math.sin(angle) * 50;

            gradient.setAttribute('x1', `${x1}%`);
            gradient.setAttribute('y1', `${y1}%`);
            gradient.setAttribute('x2', `${x2}%`);
            gradient.setAttribute('y2', `${y2}%`);
        } else {
            gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
            gradient.setAttribute('id', gradientId);
            gradient.setAttribute('cx', '50%');
            gradient.setAttribute('cy', '50%');
            gradient.setAttribute('r', '50%');
        }

        // Add stops
        this.stops.forEach(stop => {
            const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stopEl.setAttribute('offset', `${stop.offset}%`);
            stopEl.setAttribute('stop-color', stop.color);
            gradient.appendChild(stopEl);
        });

        defs.appendChild(gradient);

        // Apply to element
        this.targetElement.setAttribute('fill', `url(#${gradientId})`);

        this.app.canvas.saveState();
        this.hide();
    }
}
