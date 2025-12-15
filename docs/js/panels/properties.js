/**
 * Properties Panel - Element property editing
 */

export class PropertiesPanel {
  constructor(containerId, app) {
    this.container = document.getElementById(containerId);
    this.app = app;
    this.currentElement = null;
    
    this.setupEvents();
  }
  
  setupEvents() {
    // Transform properties
    ['x', 'y', 'width', 'height', 'rotation'].forEach(prop => {
      const input = document.getElementById(`prop-${prop}`);
      if (input) {
        input.addEventListener('change', () => this.updateTransform(prop, input.value));
      }
    });
    
    // Fill properties
    document.getElementById('prop-fill').addEventListener('input', (e) => {
      document.getElementById('prop-fill-hex').value = e.target.value;
      this.updateFill(e.target.value);
    });
    
    document.getElementById('prop-fill-hex').addEventListener('change', (e) => {
      document.getElementById('prop-fill').value = e.target.value;
      this.updateFill(e.target.value);
    });
    
    document.getElementById('prop-fill-opacity').addEventListener('input', (e) => {
      document.getElementById('prop-fill-opacity-value').textContent = `${e.target.value}%`;
      this.updateFillOpacity(e.target.value / 100);
    });
    
    // Stroke properties
    document.getElementById('prop-stroke').addEventListener('input', (e) => {
      document.getElementById('prop-stroke-hex').value = e.target.value;
      this.updateStroke(e.target.value);
    });
    
    document.getElementById('prop-stroke-hex').addEventListener('change', (e) => {
      if (e.target.value === 'none') {
        this.updateStroke('none');
      } else {
        document.getElementById('prop-stroke').value = e.target.value;
        this.updateStroke(e.target.value);
      }
    });
    
    document.getElementById('prop-stroke-width').addEventListener('change', (e) => {
      this.updateStrokeWidth(e.target.value);
    });
    
    // Text properties
    document.getElementById('prop-text-content').addEventListener('input', (e) => {
      this.updateTextContent(e.target.value);
    });
    
    document.getElementById('prop-font-family').addEventListener('change', (e) => {
      this.updateFontFamily(e.target.value);
    });
    
    document.getElementById('prop-font-size').addEventListener('change', (e) => {
      this.updateFontSize(e.target.value);
    });
    
    document.getElementById('prop-font-weight').addEventListener('change', (e) => {
      this.updateFontWeight(e.target.value);
    });
    
    // Corner radius
    document.getElementById('prop-radius').addEventListener('change', (e) => {
      this.updateRadius(e.target.value);
    });
    
    // Effects
    document.getElementById('add-shadow').addEventListener('click', () => {
      this.addDropShadow();
    });
    
    document.getElementById('add-blur').addEventListener('click', () => {
      this.addBlur();
    });
    
    // Animation presets
    document.querySelectorAll('.anim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.anim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyAnimation(btn.dataset.animation);
        document.getElementById('animation-config').classList.remove('hidden');
      });
    });
    
    // Animation config
    ['duration', 'delay', 'easing', 'iterations'].forEach(prop => {
      const input = document.getElementById(`anim-${prop}`);
      if (input) {
        input.addEventListener('change', () => this.updateAnimation());
      }
    });
  }
  
  update(element) {
    this.currentElement = element;
    
    const noSelection = document.getElementById('no-selection');
    const properties = document.getElementById('element-properties');
    
    if (!element) {
      noSelection.classList.remove('hidden');
      properties.classList.add('hidden');
      return;
    }
    
    noSelection.classList.add('hidden');
    properties.classList.remove('hidden');
    
    const bbox = element.getBBox();
    const type = element.tagName.toLowerCase();
    
    // Transform
    if (type === 'circle') {
      document.getElementById('prop-x').value = Math.round(parseFloat(element.getAttribute('cx')) || 0);
      document.getElementById('prop-y').value = Math.round(parseFloat(element.getAttribute('cy')) || 0);
      document.getElementById('prop-width').value = Math.round(parseFloat(element.getAttribute('r')) * 2 || 0);
      document.getElementById('prop-height').value = Math.round(parseFloat(element.getAttribute('r')) * 2 || 0);
    } else {
      document.getElementById('prop-x').value = Math.round(bbox.x);
      document.getElementById('prop-y').value = Math.round(bbox.y);
      document.getElementById('prop-width').value = Math.round(bbox.width);
      document.getElementById('prop-height').value = Math.round(bbox.height);
    }
    
    // Rotation
    const transform = element.getAttribute('transform') || '';
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
    document.getElementById('prop-rotation').value = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
    
    // Fill
    const fill = element.getAttribute('fill') || '#000000';
    if (fill !== 'none' && fill.startsWith('#')) {
      document.getElementById('prop-fill').value = fill;
      document.getElementById('prop-fill-hex').value = fill;
    }
    
    // Fill opacity
    const fillOpacity = element.getAttribute('fill-opacity') || 1;
    document.getElementById('prop-fill-opacity').value = fillOpacity * 100;
    document.getElementById('prop-fill-opacity-value').textContent = `${Math.round(fillOpacity * 100)}%`;
    
    // Stroke
    const stroke = element.getAttribute('stroke') || 'none';
    if (stroke !== 'none' && stroke.startsWith('#')) {
      document.getElementById('prop-stroke').value = stroke;
      document.getElementById('prop-stroke-hex').value = stroke;
    } else {
      document.getElementById('prop-stroke-hex').value = stroke;
    }
    document.getElementById('prop-stroke-width').value = parseFloat(element.getAttribute('stroke-width')) || 0;
    
    // Corner radius
    const radiusProps = document.getElementById('radius-properties');
    if (type === 'rect') {
      radiusProps.classList.remove('hidden');
      document.getElementById('prop-radius').value = parseFloat(element.getAttribute('rx')) || 0;
    } else {
      radiusProps.classList.add('hidden');
    }
    
    // Text properties
    const textProps = document.getElementById('text-properties');
    if (type === 'text') {
      textProps.classList.remove('hidden');
      document.getElementById('prop-text-content').value = element.textContent;
      document.getElementById('prop-font-size').value = parseFloat(element.getAttribute('font-size')) || 14;
      
      const fontFamily = element.getAttribute('font-family') || 'system-ui, sans-serif';
      const fontSelect = document.getElementById('prop-font-family');
      for (let option of fontSelect.options) {
        if (fontFamily.includes(option.value.split(',')[0].replace(/'/g, ''))) {
          fontSelect.value = option.value;
          break;
        }
      }
      
      document.getElementById('prop-font-weight').value = element.getAttribute('font-weight') || '400';
    } else {
      textProps.classList.add('hidden');
    }
  }
  
  updateTransform(prop, value) {
    if (!this.currentElement) return;
    
    const el = this.currentElement;
    const type = el.tagName.toLowerCase();
    
    switch (prop) {
      case 'x':
        if (type === 'circle') {
          el.setAttribute('cx', value);
        } else {
          el.setAttribute('x', value);
        }
        break;
      case 'y':
        if (type === 'circle') {
          el.setAttribute('cy', value);
        } else {
          el.setAttribute('y', value);
        }
        break;
      case 'width':
        if (type === 'circle') {
          el.setAttribute('r', value / 2);
        } else {
          el.setAttribute('width', value);
        }
        break;
      case 'height':
        if (type === 'circle') {
          el.setAttribute('r', value / 2);
        } else {
          el.setAttribute('height', value);
        }
        break;
      case 'rotation':
        const bbox = el.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        el.setAttribute('transform', `rotate(${value} ${cx} ${cy})`);
        break;
    }
    
    this.app.canvas.updateSelectionOverlay();
    this.app.canvas.saveState();
  }
  
  updateFill(color) {
    if (!this.currentElement) return;
    this.currentElement.setAttribute('fill', color);
    this.app.canvas.saveState();
  }
  
  updateFillOpacity(opacity) {
    if (!this.currentElement) return;
    this.currentElement.setAttribute('fill-opacity', opacity);
    this.app.canvas.saveState();
  }
  
  updateStroke(color) {
    if (!this.currentElement) return;
    this.currentElement.setAttribute('stroke', color);
    this.app.canvas.saveState();
  }
  
  updateStrokeWidth(width) {
    if (!this.currentElement) return;
    this.currentElement.setAttribute('stroke-width', width);
    this.app.canvas.saveState();
  }
  
  updateTextContent(text) {
    if (!this.currentElement || this.currentElement.tagName.toLowerCase() !== 'text') return;
    this.currentElement.textContent = text;
    this.app.canvas.updateSelectionOverlay();
    this.app.canvas.saveState();
  }
  
  updateFontFamily(family) {
    if (!this.currentElement) return;
    this.currentElement.setAttribute('font-family', family);
    this.app.canvas.updateSelectionOverlay();
    this.app.canvas.saveState();
  }
  
  updateFontSize(size) {
    if (!this.currentElement) return;
    this.currentElement.setAttribute('font-size', size);
    this.app.canvas.updateSelectionOverlay();
    this.app.canvas.saveState();
  }
  
  updateFontWeight(weight) {
    if (!this.currentElement) return;
    this.currentElement.setAttribute('font-weight', weight);
    this.app.canvas.saveState();
  }
  
  updateRadius(radius) {
    if (!this.currentElement) return;
    this.currentElement.setAttribute('rx', radius);
    this.currentElement.setAttribute('ry', radius);
    this.app.canvas.saveState();
  }
  
  addDropShadow() {
    if (!this.currentElement) return;
    
    const filterId = `shadow-${Date.now()}`;
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');
    filter.innerHTML = `<feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.2"/>`;
    
    document.getElementById('canvas-defs').appendChild(filter);
    this.currentElement.setAttribute('filter', `url(#${filterId})`);
    this.app.canvas.saveState();
  }
  
  addBlur() {
    if (!this.currentElement) return;
    
    const filterId = `blur-${Date.now()}`;
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', filterId);
    filter.innerHTML = `<feGaussianBlur stdDeviation="4"/>`;
    
    document.getElementById('canvas-defs').appendChild(filter);
    this.currentElement.setAttribute('filter', `url(#${filterId})`);
    this.app.canvas.saveState();
  }
  
  applyAnimation(animationType) {
    if (!this.currentElement) return;
    
    const animations = {
      fadeIn: 'fadeIn 0.5s ease-out forwards',
      scaleIn: 'scaleIn 0.5s ease-out forwards',
      slideIn: 'slideIn 0.5s ease-out forwards',
      pulse: 'pulse 2s ease-in-out infinite',
      drawLine: 'drawLine 1s ease-out forwards',
      blink: 'blink 1s step-end infinite'
    };
    
    const animStyle = animations[animationType];
    if (animStyle) {
      this.currentElement.style.animation = animStyle;
      this.ensureAnimationKeyframes(animationType);
    }
    
    this.app.canvas.saveState();
  }
  
  ensureAnimationKeyframes(animationType) {
    const styleEl = document.getElementById('canvas-styles');
    const existing = styleEl.textContent;
    
    const keyframes = {
      fadeIn: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
      scaleIn: '@keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }',
      slideIn: '@keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }',
      pulse: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }',
      drawLine: '@keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }',
      blink: '@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }'
    };
    
    if (!existing.includes(animationType)) {
      styleEl.textContent += '\n' + keyframes[animationType];
    }
  }
  
  updateAnimation() {
    if (!this.currentElement) return;
    
    const duration = document.getElementById('anim-duration').value;
    const delay = document.getElementById('anim-delay').value;
    const easing = document.getElementById('anim-easing').value;
    const iterations = document.getElementById('anim-iterations').value;
    
    const currentAnim = this.currentElement.style.animation;
    if (currentAnim) {
      const animName = currentAnim.split(' ')[0];
      this.currentElement.style.animation = `${animName} ${duration}s ${easing} ${delay}s ${iterations}`;
    }
    
    this.app.canvas.saveState();
  }
}
