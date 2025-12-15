/**
 * Timeline - Animation timeline and keyframe management
 * Supports multiple easing functions and spline-based motion
 */

// Easing functions library
const EASING_FUNCTIONS = {
    // Linear
    linear: (t) => t,

    // Quadratic
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

    // Cubic
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    // Quartic
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

    // Quintic
    easeInQuint: (t) => t * t * t * t * t,
    easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
    easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

    // Sine
    easeInSine: (t) => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: (t) => Math.sin(t * Math.PI / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

    // Exponential
    easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: (t) => {
        if (t === 0 || t === 1) return t;
        return t < 0.5
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },

    // Circular
    easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: (t) => Math.sqrt(1 - (--t) * t),
    easeInOutCirc: (t) => t < 0.5
        ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

    // Elastic
    easeInElastic: (t) => {
        if (t === 0 || t === 1) return t;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI / 3));
    },
    easeOutElastic: (t) => {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
    },
    easeInOutElastic: (t) => {
        if (t === 0 || t === 1) return t;
        return t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI / 4.5))) / 2
            : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI / 4.5))) / 2 + 1;
    },

    // Back
    easeInBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
    },
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t) => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },

    // Bounce
    easeInBounce: (t) => 1 - EASING_FUNCTIONS.easeOutBounce(1 - t),
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
    easeInOutBounce: (t) => t < 0.5
        ? (1 - EASING_FUNCTIONS.easeOutBounce(1 - 2 * t)) / 2
        : (1 + EASING_FUNCTIONS.easeOutBounce(2 * t - 1)) / 2,

    // Spring (custom)
    spring: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 :
            Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
};

// Cubic Bezier implementation for custom curves
class CubicBezier {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    // Calculate bezier curve value at time t
    evaluate(t) {
        // Use Newton-Raphson iteration to find t for given x
        const x = this.solveForT(t);
        return this.bezier(this.y1, this.y2, x);
    }

    bezier(p1, p2, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        return 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3;
    }

    solveForT(x) {
        let t = x;
        for (let i = 0; i < 8; i++) {
            const xCalc = this.bezier(this.x1, this.x2, t);
            const dx = xCalc - x;
            if (Math.abs(dx) < 1e-6) break;

            const derivative = this.bezierDerivative(this.x1, this.x2, t);
            if (Math.abs(derivative) < 1e-6) break;

            t -= dx / derivative;
            t = Math.max(0, Math.min(1, t));
        }
        return t;
    }

    bezierDerivative(p1, p2, t) {
        const t2 = t * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        return 3 * mt2 * p1 + 6 * mt * t * (p2 - p1) + 3 * t2 * (1 - p2);
    }
}

// Export easing names for UI
export const EASING_NAMES = [
    { value: 'linear', label: 'Linear', category: 'Linear' },
    { value: 'easeInQuad', label: 'Ease In (Quad)', category: 'Quadratic' },
    { value: 'easeOutQuad', label: 'Ease Out (Quad)', category: 'Quadratic' },
    { value: 'easeInOutQuad', label: 'Ease In-Out (Quad)', category: 'Quadratic' },
    { value: 'easeInCubic', label: 'Ease In (Cubic)', category: 'Cubic' },
    { value: 'easeOutCubic', label: 'Ease Out (Cubic)', category: 'Cubic' },
    { value: 'easeInOutCubic', label: 'Ease In-Out (Cubic)', category: 'Cubic' },
    { value: 'easeInQuart', label: 'Ease In (Quart)', category: 'Quartic' },
    { value: 'easeOutQuart', label: 'Ease Out (Quart)', category: 'Quartic' },
    { value: 'easeInOutQuart', label: 'Ease In-Out (Quart)', category: 'Quartic' },
    { value: 'easeInQuint', label: 'Ease In (Quint)', category: 'Quintic' },
    { value: 'easeOutQuint', label: 'Ease Out (Quint)', category: 'Quintic' },
    { value: 'easeInOutQuint', label: 'Ease In-Out (Quint)', category: 'Quintic' },
    { value: 'easeInSine', label: 'Ease In (Sine)', category: 'Sine' },
    { value: 'easeOutSine', label: 'Ease Out (Sine)', category: 'Sine' },
    { value: 'easeInOutSine', label: 'Ease In-Out (Sine)', category: 'Sine' },
    { value: 'easeInExpo', label: 'Ease In (Expo)', category: 'Exponential' },
    { value: 'easeOutExpo', label: 'Ease Out (Expo)', category: 'Exponential' },
    { value: 'easeInOutExpo', label: 'Ease In-Out (Expo)', category: 'Exponential' },
    { value: 'easeInCirc', label: 'Ease In (Circ)', category: 'Circular' },
    { value: 'easeOutCirc', label: 'Ease Out (Circ)', category: 'Circular' },
    { value: 'easeInOutCirc', label: 'Ease In-Out (Circ)', category: 'Circular' },
    { value: 'easeInElastic', label: 'Ease In (Elastic)', category: 'Elastic' },
    { value: 'easeOutElastic', label: 'Ease Out (Elastic)', category: 'Elastic' },
    { value: 'easeInOutElastic', label: 'Ease In-Out (Elastic)', category: 'Elastic' },
    { value: 'easeInBack', label: 'Ease In (Back)', category: 'Back' },
    { value: 'easeOutBack', label: 'Ease Out (Back)', category: 'Back' },
    { value: 'easeInOutBack', label: 'Ease In-Out (Back)', category: 'Back' },
    { value: 'easeInBounce', label: 'Ease In (Bounce)', category: 'Bounce' },
    { value: 'easeOutBounce', label: 'Ease Out (Bounce)', category: 'Bounce' },
    { value: 'easeInOutBounce', label: 'Ease In-Out (Bounce)', category: 'Bounce' },
    { value: 'spring', label: 'Spring', category: 'Special' },
    { value: 'custom', label: 'Custom Bezier', category: 'Custom' }
];

export class Timeline {
    constructor(containerId, app) {
        this.container = document.getElementById(containerId);
        this.app = app;

        this.duration = 2; // seconds
        this.currentTime = 0;
        this.isPlaying = false;
        this.playbackId = null;
        this.pixelsPerSecond = 100;

        // Keyframes now include easing: [{time, properties, easing, bezier?}]
        this.keyframes = new Map(); // elementId -> [{time, properties, easing}]

        // Default easing for new keyframes
        this.defaultEasing = 'easeInOutCubic';

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
            keyframe.dataset.easing = kf.easing || 'linear';
            keyframe.title = `${kf.time.toFixed(2)}s - ${this.getEasingLabel(kf.easing)}`;

            // Add easing indicator
            const easingDot = document.createElement('span');
            easingDot.className = 'easing-indicator';
            easingDot.style.background = this.getEasingColor(kf.easing);
            keyframe.appendChild(easingDot);

            // Drag to move keyframe
            keyframe.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                if (e.button === 0) {
                    this.startDraggingKeyframe(element.id, index, e);
                }
            });

            // Right-click for context menu
            keyframe.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showKeyframeContextMenu(element.id, index, e);
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

    addKeyframe(elementId, time, easing = null) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Capture current properties
        const properties = this.captureProperties(element);

        const keyframes = this.keyframes.get(elementId) || [];
        keyframes.push({
            time,
            properties,
            easing: easing || this.defaultEasing,
            bezier: null // For custom bezier curves
        });
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
            let kfIndex = 0;

            for (let i = 0; i < keyframes.length - 1; i++) {
                if (keyframes[i].time <= time && keyframes[i + 1].time >= time) {
                    prevKf = keyframes[i];
                    nextKf = keyframes[i + 1];
                    kfIndex = i;
                    break;
                }
            }

            // Calculate linear progress
            const duration = nextKf.time - prevKf.time;
            const linearProgress = duration > 0 ? (time - prevKf.time) / duration : 0;

            // Apply easing to the progress
            const easing = nextKf.easing || 'linear';
            const easedProgress = this.applyEasing(linearProgress, easing, nextKf.bezier);

            // Interpolate properties with eased progress
            const interpolated = this.interpolateProperties(prevKf.properties, nextKf.properties, easedProgress);

            // Apply to element
            this.applyProperties(element, interpolated);
        });
    }

    applyEasing(t, easingName, bezierPoints = null) {
        // Handle custom bezier
        if (easingName === 'custom' && bezierPoints) {
            const bezier = new CubicBezier(
                bezierPoints.x1,
                bezierPoints.y1,
                bezierPoints.x2,
                bezierPoints.y2
            );
            return bezier.evaluate(t);
        }

        // Use predefined easing function
        const easingFn = EASING_FUNCTIONS[easingName] || EASING_FUNCTIONS.linear;
        return easingFn(t);
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

    // Easing helpers
    getEasingLabel(easing) {
        const found = EASING_NAMES.find(e => e.value === easing);
        return found ? found.label : 'Linear';
    }

    getEasingColor(easing) {
        const colors = {
            linear: '#6b7280',
            easeInQuad: '#3b82f6', easeOutQuad: '#3b82f6', easeInOutQuad: '#3b82f6',
            easeInCubic: '#8b5cf6', easeOutCubic: '#8b5cf6', easeInOutCubic: '#8b5cf6',
            easeInQuart: '#a855f7', easeOutQuart: '#a855f7', easeInOutQuart: '#a855f7',
            easeInQuint: '#d946ef', easeOutQuint: '#d946ef', easeInOutQuint: '#d946ef',
            easeInSine: '#06b6d4', easeOutSine: '#06b6d4', easeInOutSine: '#06b6d4',
            easeInExpo: '#f97316', easeOutExpo: '#f97316', easeInOutExpo: '#f97316',
            easeInCirc: '#14b8a6', easeOutCirc: '#14b8a6', easeInOutCirc: '#14b8a6',
            easeInElastic: '#f43f5e', easeOutElastic: '#f43f5e', easeInOutElastic: '#f43f5e',
            easeInBack: '#84cc16', easeOutBack: '#84cc16', easeInOutBack: '#84cc16',
            easeInBounce: '#eab308', easeOutBounce: '#eab308', easeInOutBounce: '#eab308',
            spring: '#ec4899',
            custom: '#6366f1'
        };
        return colors[easing] || colors.linear;
    }

    setKeyframeEasing(elementId, keyframeIndex, easing, bezier = null) {
        const keyframes = this.keyframes.get(elementId);
        if (keyframes && keyframes[keyframeIndex]) {
            keyframes[keyframeIndex].easing = easing;
            keyframes[keyframeIndex].bezier = bezier;
            this.render();
        }
    }

    showKeyframeContextMenu(elementId, keyframeIndex, event) {
        // Create context menu for keyframe options
        const menu = document.createElement('div');
        menu.className = 'keyframe-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            background: var(--bg-secondary, #161b22);
            border: 1px solid var(--border-color, #30363d);
            border-radius: 8px;
            padding: 8px 0;
            min-width: 200px;
            z-index: 10000;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        `;

        const keyframes = this.keyframes.get(elementId);
        const currentEasing = keyframes?.[keyframeIndex]?.easing || 'linear';

        // Group easings by category
        const categories = {};
        EASING_NAMES.forEach(e => {
            if (!categories[e.category]) categories[e.category] = [];
            categories[e.category].push(e);
        });

        // Build menu
        let html = `<div class="context-menu-header" style="padding: 4px 12px; font-size: 10px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px;">Easing</div>`;

        for (const [category, easings] of Object.entries(categories)) {
            html += `<div class="context-menu-category" style="padding: 4px 12px; font-size: 10px; color: #6b7280; margin-top: 4px;">${category}</div>`;

            for (const easing of easings) {
                const isActive = easing.value === currentEasing;
                html += `
                    <div class="context-menu-item" data-easing="${easing.value}" style="
                        padding: 6px 12px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: ${isActive ? '#fff' : '#c9d1d9'};
                        background: ${isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
                    ">
                        <span style="
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: ${this.getEasingColor(easing.value)};
                        "></span>
                        ${easing.label}
                        ${isActive ? '<span style="margin-left: auto;">✓</span>' : ''}
                    </div>
                `;
            }
        }

        html += `<div style="border-top: 1px solid #30363d; margin: 8px 0;"></div>`;
        html += `<div class="context-menu-item delete-item" style="padding: 6px 12px; cursor: pointer; color: #f43f5e;">Delete Keyframe</div>`;

        menu.innerHTML = html;
        document.body.appendChild(menu);

        // Event handlers
        menu.querySelectorAll('.context-menu-item[data-easing]').forEach(item => {
            item.addEventListener('mouseenter', () => item.style.background = 'rgba(99, 102, 241, 0.1)');
            item.addEventListener('mouseleave', () => {
                const isActive = item.dataset.easing === currentEasing;
                item.style.background = isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent';
            });
            item.addEventListener('click', () => {
                this.setKeyframeEasing(elementId, keyframeIndex, item.dataset.easing);
                menu.remove();
            });
        });

        menu.querySelector('.delete-item').addEventListener('click', () => {
            this.deleteKeyframe(elementId, keyframeIndex);
            menu.remove();
        });

        // Close on click outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }

    // Set default easing for new keyframes
    setDefaultEasing(easing) {
        this.defaultEasing = easing;
    }
}
