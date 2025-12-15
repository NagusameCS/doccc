/**
 * Timeline - Animation timeline and keyframe management
 */

export class Timeline {
    constructor(containerId, app) {
        this.container = document.getElementById(containerId);
        this.app = app;

        this.duration = 2; // seconds
        this.currentTime = 0;
        this.isPlaying = false;
        this.playbackId = null;
        this.pixelsPerSecond = 100;

        this.keyframes = new Map(); // elementId -> [{time, properties}]

        this.setupUI();
        this.setupEvents();
        this.render();
    }

    setupUI() {
        this.layersContainer = document.getElementById('timeline-layers');
        this.tracksContainer = document.getElementById('timeline-keyframes');
        this.ruler = document.getElementById('timeline-ruler');
        this.playhead = document.getElementById('timeline-playhead');

        this.renderRuler();
    }

    setupEvents() {
        // Play/Stop controls
        document.getElementById('timeline-play').addEventListener('click', () => {
            this.isPlaying ? this.stop() : this.play();
        });

        document.getElementById('timeline-stop').addEventListener('click', () => {
            this.stop();
            this.seekTo(0);
        });

        // Duration input
        document.getElementById('timeline-duration').addEventListener('change', (e) => {
            this.duration = parseFloat(e.target.value) || 2;
            this.renderRuler();
            this.render();
        });

        // Playhead scrubbing
        this.ruler.addEventListener('mousedown', (e) => {
            this.startScrubbing(e);
        });

        // Double-click to add keyframe
        this.tracksContainer.addEventListener('dblclick', (e) => {
            const track = e.target.closest('.keyframe-track');
            if (track) {
                this.addKeyframeAtPosition(track.dataset.elementId, e.offsetX);
            }
        });
    }

    renderRuler() {
        this.ruler.innerHTML = '';
        const totalWidth = this.duration * this.pixelsPerSecond;
        this.ruler.style.width = `${totalWidth}px`;

        // Major ticks every second, minor every 0.5s
        for (let t = 0; t <= this.duration; t += 0.5) {
            const tick = document.createElement('div');
            tick.className = `ruler-tick ${t % 1 === 0 ? 'major' : ''}`;
            tick.style.left = `${t * this.pixelsPerSecond}px`;

            if (t % 1 === 0) {
                const label = document.createElement('span');
                label.className = 'ruler-label';
                label.textContent = `${t}s`;
                tick.appendChild(label);
            }

            this.ruler.appendChild(tick);
        }
    }

    render() {
        this.layersContainer.innerHTML = '';
        this.tracksContainer.innerHTML = '';

        // Add ruler
        this.renderRuler();

        // Get all canvas elements
        const content = this.app.canvas.content;
        const elements = Array.from(content.children).reverse();

        elements.forEach(element => {
            this.renderLayerRow(element);
            this.renderKeyframeTrack(element);
        });

        this.updatePlayhead();
    }

    renderLayerRow(element) {
        const row = document.createElement('div');
        row.className = 'timeline-layer';
        row.dataset.elementId = element.id;

        const name = element.getAttribute('data-name') || element.id;
        const icon = this.getLayerIcon(element.tagName.toLowerCase());

        row.innerHTML = `
      <div class="timeline-layer-icon">${icon}</div>
      <span class="timeline-layer-name">${name}</span>
    `;

        row.addEventListener('click', () => {
            this.app.canvas.selectElement(element);
            this.highlightTrack(element.id);
        });

        this.layersContainer.appendChild(row);
    }

    renderKeyframeTrack(element) {
        const track = document.createElement('div');
        track.className = 'keyframe-track';
        track.dataset.elementId = element.id;
        track.style.width = `${this.duration * this.pixelsPerSecond}px`;

        // Render keyframes for this element
        const keyframes = this.keyframes.get(element.id) || [];

        if (keyframes.length >= 2) {
            // Render animation bar
            const firstTime = keyframes[0].time;
            const lastTime = keyframes[keyframes.length - 1].time;

            const bar = document.createElement('div');
            bar.className = 'animation-bar';
            bar.style.left = `${firstTime * this.pixelsPerSecond}px`;
            bar.style.width = `${(lastTime - firstTime) * this.pixelsPerSecond}px`;
            track.appendChild(bar);
        }

        keyframes.forEach((kf, index) => {
            const keyframe = document.createElement('div');
            keyframe.className = 'keyframe';
            keyframe.style.left = `${kf.time * this.pixelsPerSecond}px`;
            keyframe.dataset.index = index;

            // Drag to move keyframe
            keyframe.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.startDraggingKeyframe(element.id, index, e);
            });

            // Right-click to delete
            keyframe.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.deleteKeyframe(element.id, index);
            });

            track.appendChild(keyframe);
        });

        this.tracksContainer.appendChild(track);
    }

    getLayerIcon(tagName) {
        const icons = {
            rect: '▢',
            circle: '○',
            text: 'T',
            path: '✎',
            g: '📁'
        };
        return icons[tagName] || '▢';
    }

    highlightTrack(elementId) {
        this.layersContainer.querySelectorAll('.timeline-layer').forEach(row => {
            row.classList.toggle('selected', row.dataset.elementId === elementId);
        });

        this.tracksContainer.querySelectorAll('.keyframe-track').forEach(track => {
            track.classList.toggle('selected', track.dataset.elementId === elementId);
        });
    }

    addKeyframeAtPosition(elementId, offsetX) {
        const time = Math.max(0, Math.min(this.duration, offsetX / this.pixelsPerSecond));
        this.addKeyframe(elementId, time);
    }

    addKeyframe(elementId, time) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Capture current properties
        const properties = this.captureProperties(element);

        const keyframes = this.keyframes.get(elementId) || [];
        keyframes.push({ time, properties });
        keyframes.sort((a, b) => a.time - b.time);

        this.keyframes.set(elementId, keyframes);
        this.render();
    }

    deleteKeyframe(elementId, index) {
        const keyframes = this.keyframes.get(elementId);
        if (keyframes && keyframes[index]) {
            keyframes.splice(index, 1);
            if (keyframes.length === 0) {
                this.keyframes.delete(elementId);
            }
            this.render();
        }
    }

    captureProperties(element) {
        const type = element.tagName.toLowerCase();
        const props = {};

        // Common properties
        props.opacity = parseFloat(element.getAttribute('opacity') || element.style.opacity) || 1;
        props.fill = element.getAttribute('fill');
        props.stroke = element.getAttribute('stroke');
        props.transform = element.getAttribute('transform') || '';

        // Type-specific properties
        if (type === 'rect') {
            props.x = parseFloat(element.getAttribute('x')) || 0;
            props.y = parseFloat(element.getAttribute('y')) || 0;
            props.width = parseFloat(element.getAttribute('width')) || 0;
            props.height = parseFloat(element.getAttribute('height')) || 0;
            props.rx = parseFloat(element.getAttribute('rx')) || 0;
        } else if (type === 'circle') {
            props.cx = parseFloat(element.getAttribute('cx')) || 0;
            props.cy = parseFloat(element.getAttribute('cy')) || 0;
            props.r = parseFloat(element.getAttribute('r')) || 0;
        } else if (type === 'text') {
            props.x = parseFloat(element.getAttribute('x')) || 0;
            props.y = parseFloat(element.getAttribute('y')) || 0;
            props.fontSize = parseFloat(element.getAttribute('font-size')) || 14;
        }

        return props;
    }

    startDraggingKeyframe(elementId, keyframeIndex, e) {
        const startX = e.clientX;
        const keyframes = this.keyframes.get(elementId);
        const startTime = keyframes[keyframeIndex].time;

        const onMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaTime = deltaX / this.pixelsPerSecond;
            const newTime = Math.max(0, Math.min(this.duration, startTime + deltaTime));

            keyframes[keyframeIndex].time = newTime;
            keyframes.sort((a, b) => a.time - b.time);
            this.render();
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    startScrubbing(e) {
        this.scrub(e);

        const onMouseMove = (e) => this.scrub(e);
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    scrub(e) {
        const rect = this.ruler.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = Math.max(0, Math.min(this.duration, x / this.pixelsPerSecond));
        this.seekTo(time);
    }

    seekTo(time) {
        this.currentTime = time;
        document.getElementById('timeline-current').textContent = `${time.toFixed(2)}s`;
        this.updatePlayhead();
        this.applyKeyframesAtTime(time);
    }

    updatePlayhead() {
        this.playhead.style.left = `${this.currentTime * this.pixelsPerSecond}px`;
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        const startTime = performance.now();
        const startOffset = this.currentTime;

        const playBtn = document.getElementById('timeline-play');
        playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>`;

        const animate = (now) => {
            if (!this.isPlaying) return;

            const elapsed = (now - startTime) / 1000;
            let time = startOffset + elapsed;

            // Loop
            if (time > this.duration) {
                time = time % this.duration;
            }

            this.seekTo(time);
            this.playbackId = requestAnimationFrame(animate);
        };

        this.playbackId = requestAnimationFrame(animate);
    }

    stop() {
        this.isPlaying = false;
        if (this.playbackId) {
            cancelAnimationFrame(this.playbackId);
            this.playbackId = null;
        }

        const playBtn = document.getElementById('timeline-play');
        playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>`;
    }

    applyKeyframesAtTime(time) {
        this.keyframes.forEach((keyframes, elementId) => {
            if (keyframes.length < 2) return;

            const element = document.getElementById(elementId);
            if (!element) return;

            // Find surrounding keyframes
            let prevKf = keyframes[0];
            let nextKf = keyframes[keyframes.length - 1];

            for (let i = 0; i < keyframes.length - 1; i++) {
                if (keyframes[i].time <= time && keyframes[i + 1].time >= time) {
                    prevKf = keyframes[i];
                    nextKf = keyframes[i + 1];
                    break;
                }
            }

            // Interpolate properties
            const progress = (time - prevKf.time) / (nextKf.time - prevKf.time);
            const interpolated = this.interpolateProperties(prevKf.properties, nextKf.properties, progress);

            // Apply to element
            this.applyProperties(element, interpolated);
        });
    }

    interpolateProperties(from, to, progress) {
        const result = {};

        for (const key in from) {
            if (typeof from[key] === 'number' && typeof to[key] === 'number') {
                result[key] = from[key] + (to[key] - from[key]) * progress;
            } else {
                result[key] = progress < 0.5 ? from[key] : to[key];
            }
        }

        return result;
    }

    applyProperties(element, props) {
        for (const [key, value] of Object.entries(props)) {
            if (key === 'opacity') {
                element.style.opacity = value;
            } else if (key === 'fontSize') {
                element.setAttribute('font-size', value);
            } else if (typeof value === 'number') {
                element.setAttribute(key, value);
            } else if (value) {
                element.setAttribute(key, value);
            }
        }
    }

    serialize() {
        const data = {};
        this.keyframes.forEach((kfs, elementId) => {
            data[elementId] = kfs;
        });
        return {
            duration: this.duration,
            keyframes: data
        };
    }

    deserialize(data) {
        if (!data) return;

        this.duration = data.duration || 2;
        document.getElementById('timeline-duration').value = this.duration;

        this.keyframes.clear();
        if (data.keyframes) {
            Object.entries(data.keyframes).forEach(([elementId, kfs]) => {
                this.keyframes.set(elementId, kfs);
            });
        }

        this.render();
    }

    refresh() {
        this.render();
    }
}
