/**
 * Welcome Screen - First-time user onboarding
 */

export class WelcomeScreen {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.hasSeenWelcome = localStorage.getItem('doccc-welcome-seen') === 'true';
        this.init();
    }

    init() {
        this.createModal();
        
        // Show on first visit
        if (!this.hasSeenWelcome) {
            setTimeout(() => this.show(), 500);
        }
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'welcome-modal hidden';
        this.modal.innerHTML = `
            <div class="welcome-dialog">
                <div class="welcome-header">
                    <div class="welcome-logo">
                        <svg width="60" height="60" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="welcome-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#3b82f6"/>
                                    <stop offset="100%" stop-color="#8b5cf6"/>
                                </linearGradient>
                            </defs>
                            <rect x="10" y="10" width="80" height="80" rx="15" fill="url(#welcome-gradient)"/>
                            <text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-weight="bold">d</text>
                        </svg>
                    </div>
                    <h2>Welcome to doccc Baseplate Editor</h2>
                    <p class="welcome-subtitle">Create beautiful, animated baseplates for your GitHub profile</p>
                </div>

                <div class="welcome-steps">
                    <div class="step">
                        <div class="step-icon">🎨</div>
                        <div class="step-content">
                            <h4>Design Visually</h4>
                            <p>Use our Figma-like tools to create shapes, add text, and style your baseplate</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-icon">✨</div>
                        <div class="step-content">
                            <h4>Add Animations</h4>
                            <p>Bring your baseplate to life with CSS animations - fade, slide, pulse, and more</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-icon">🚀</div>
                        <div class="step-content">
                            <h4>Export & Share</h4>
                            <p>Export as SVG and use directly in your GitHub README with a single line of code</p>
                        </div>
                    </div>
                </div>

                <div class="welcome-templates">
                    <h4>Start with a Template</h4>
                    <div class="template-grid">
                        <button class="template-card" data-template="blank">
                            <div class="template-preview blank-preview">
                                <div class="plus-icon">+</div>
                            </div>
                            <span>Blank Canvas</span>
                        </button>
                        <button class="template-card" data-template="hero">
                            <div class="template-preview" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6)">
                                <span style="color: white; font-size: 12px;">HERO</span>
                            </div>
                            <span>Hero Banner</span>
                        </button>
                        <button class="template-card" data-template="stats">
                            <div class="template-preview" style="background: #1f2937">
                                <div style="display: flex; gap: 4px">
                                    <span style="background: #22c55e; padding: 2px 4px; border-radius: 2px; font-size: 8px; color: white;">42</span>
                                    <span style="background: #3b82f6; padding: 2px 4px; border-radius: 2px; font-size: 8px; color: white;">128</span>
                                </div>
                            </div>
                            <span>Stats Card</span>
                        </button>
                        <button class="template-card" data-template="badge">
                            <div class="template-preview" style="background: #f59e0b; border-radius: 20px">
                                <span style="color: white; font-size: 10px;">⭐ Badge</span>
                            </div>
                            <span>Badge</span>
                        </button>
                    </div>
                </div>

                <div class="welcome-footer">
                    <label class="welcome-checkbox">
                        <input type="checkbox" id="dont-show-again">
                        <span>Don't show this again</span>
                    </label>
                    <div class="welcome-actions">
                        <button class="btn btn-ghost" id="welcome-skip">Skip for now</button>
                        <button class="btn btn-primary" id="welcome-start">Get Started</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.setupEvents();
    }

    setupEvents() {
        // Template cards
        this.modal.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = card.dataset.template;
                this.selectTemplate(template);
            });
        });

        // Skip button
        this.modal.querySelector('#welcome-skip').addEventListener('click', () => {
            this.savePreference();
            this.hide();
        });

        // Get Started button
        this.modal.querySelector('#welcome-start').addEventListener('click', () => {
            this.savePreference();
            this.hide();
            this.showQuickTour();
        });

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.savePreference();
                this.hide();
            }
        });
    }

    savePreference() {
        const dontShowAgain = this.modal.querySelector('#dont-show-again').checked;
        if (dontShowAgain) {
            localStorage.setItem('doccc-welcome-seen', 'true');
        }
    }

    selectTemplate(template) {
        this.savePreference();
        this.hide();

        switch (template) {
            case 'blank':
                this.app.canvas.clear();
                break;
            case 'hero':
                this.loadHeroTemplate();
                break;
            case 'stats':
                this.loadStatsTemplate();
                break;
            case 'badge':
                this.loadBadgeTemplate();
                break;
        }
    }

    loadHeroTemplate() {
        this.app.canvas.clear();
        const svg = this.app.canvas.svg;
        
        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', '0');
        bg.setAttribute('y', '0');
        bg.setAttribute('width', '800');
        bg.setAttribute('height', '200');
        bg.setAttribute('fill', '#0d1117');
        svg.appendChild(bg);

        // Gradient bar
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', '0');
        bar.setAttribute('y', '195');
        bar.setAttribute('width', '800');
        bar.setAttribute('height', '5');
        bar.setAttribute('fill', 'url(#hero-grad)');
        
        // Add gradient def
        const defs = document.getElementById('canvas-defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'hero-grad');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.innerHTML = `
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="50%" stop-color="#8b5cf6"/>
            <stop offset="100%" stop-color="#ec4899"/>
        `;
        defs.appendChild(gradient);
        svg.appendChild(bar);

        // Title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', '400');
        title.setAttribute('y', '100');
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('fill', 'white');
        title.setAttribute('font-size', '36');
        title.setAttribute('font-weight', 'bold');
        title.textContent = 'Hello, I\'m Username';
        svg.appendChild(title);

        // Subtitle
        const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subtitle.setAttribute('x', '400');
        subtitle.setAttribute('y', '140');
        subtitle.setAttribute('text-anchor', 'middle');
        subtitle.setAttribute('fill', '#8b949e');
        subtitle.setAttribute('font-size', '18');
        subtitle.textContent = 'Full Stack Developer | Open Source Enthusiast';
        svg.appendChild(subtitle);

        this.app.canvas.saveState();
    }

    loadStatsTemplate() {
        this.app.canvas.clear();
        const svg = this.app.canvas.svg;
        
        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', '0');
        bg.setAttribute('y', '0');
        bg.setAttribute('width', '400');
        bg.setAttribute('height', '150');
        bg.setAttribute('rx', '10');
        bg.setAttribute('fill', '#0d1117');
        bg.setAttribute('stroke', '#30363d');
        svg.appendChild(bg);

        // Title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', '20');
        title.setAttribute('y', '35');
        title.setAttribute('fill', 'white');
        title.setAttribute('font-size', '16');
        title.setAttribute('font-weight', 'bold');
        title.textContent = '📊 GitHub Stats';
        svg.appendChild(title);

        // Stats
        const stats = [
            { label: 'Repos', value: '42', color: '#3b82f6' },
            { label: 'Stars', value: '128', color: '#fbbf24' },
            { label: 'Commits', value: '1.2k', color: '#22c55e' }
        ];

        stats.forEach((stat, i) => {
            const x = 40 + i * 120;
            
            const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            value.setAttribute('x', x);
            value.setAttribute('y', '85');
            value.setAttribute('fill', stat.color);
            value.setAttribute('font-size', '28');
            value.setAttribute('font-weight', 'bold');
            value.textContent = stat.value;
            svg.appendChild(value);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', '110');
            label.setAttribute('fill', '#8b949e');
            label.setAttribute('font-size', '12');
            label.textContent = stat.label;
            svg.appendChild(label);
        });

        this.app.canvas.saveState();
    }

    loadBadgeTemplate() {
        this.app.canvas.clear();
        const svg = this.app.canvas.svg;
        
        // Badge background
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        badge.setAttribute('x', '10');
        badge.setAttribute('y', '10');
        badge.setAttribute('width', '120');
        badge.setAttribute('height', '30');
        badge.setAttribute('rx', '15');
        badge.setAttribute('fill', '#3b82f6');
        svg.appendChild(badge);

        // Badge text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '70');
        text.setAttribute('y', '30');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.textContent = '⭐ Featured';
        svg.appendChild(text);

        this.app.canvas.saveState();
    }

    show() {
        this.modal.classList.remove('hidden');
    }

    hide() {
        this.modal.classList.add('hidden');
    }

    showQuickTour() {
        // Create tour overlay
        const tour = new QuickTour(this.app);
        tour.start();
    }

    reset() {
        localStorage.removeItem('doccc-welcome-seen');
        this.hasSeenWelcome = false;
    }
}

/**
 * Quick Tour - Interactive walkthrough
 */
class QuickTour {
    constructor(app) {
        this.app = app;
        this.currentStep = 0;
        this.overlay = null;
        this.steps = [
            {
                target: '.tools-section',
                title: 'Drawing Tools',
                content: 'Use these tools to create shapes, text, and paths. Keyboard shortcuts: R for rectangle, O for ellipse, T for text.',
                position: 'right'
            },
            {
                target: '#svg-canvas',
                title: 'Canvas',
                content: 'This is your workspace. Click and drag to create shapes, or select elements to edit their properties.',
                position: 'center'
            },
            {
                target: '.properties-panel',
                title: 'Properties Panel',
                content: 'Select an element to see and edit its properties - position, size, colors, and more.',
                position: 'left'
            },
            {
                target: '.bottom-panel',
                title: 'Animation Timeline',
                content: 'Add animations to make your baseplate come alive. Choose from presets or create custom keyframes.',
                position: 'top'
            },
            {
                target: '.action-buttons',
                title: 'Export & Publish',
                content: 'When you\'re done, export as SVG or publish to the community catalog!',
                position: 'bottom'
            }
        ];
    }

    start() {
        this.createOverlay();
        this.showStep(0);
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        this.overlay.innerHTML = `
            <div class="tour-highlight"></div>
            <div class="tour-tooltip">
                <div class="tour-content">
                    <h4 class="tour-title"></h4>
                    <p class="tour-text"></p>
                </div>
                <div class="tour-footer">
                    <span class="tour-progress"></span>
                    <div class="tour-buttons">
                        <button class="btn btn-ghost tour-skip">Skip Tour</button>
                        <button class="btn btn-primary tour-next">Next</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        this.overlay.querySelector('.tour-skip').addEventListener('click', () => this.end());
        this.overlay.querySelector('.tour-next').addEventListener('click', () => this.nextStep());
    }

    showStep(index) {
        if (index >= this.steps.length) {
            this.end();
            return;
        }

        this.currentStep = index;
        const step = this.steps[index];
        const target = document.querySelector(step.target);

        if (!target) {
            this.nextStep();
            return;
        }

        const rect = target.getBoundingClientRect();
        const highlight = this.overlay.querySelector('.tour-highlight');
        const tooltip = this.overlay.querySelector('.tour-tooltip');

        // Position highlight
        highlight.style.top = `${rect.top - 5}px`;
        highlight.style.left = `${rect.left - 5}px`;
        highlight.style.width = `${rect.width + 10}px`;
        highlight.style.height = `${rect.height + 10}px`;

        // Update content
        this.overlay.querySelector('.tour-title').textContent = step.title;
        this.overlay.querySelector('.tour-text').textContent = step.content;
        this.overlay.querySelector('.tour-progress').textContent = `${index + 1} of ${this.steps.length}`;

        // Update button text
        const nextBtn = this.overlay.querySelector('.tour-next');
        nextBtn.textContent = index === this.steps.length - 1 ? 'Finish' : 'Next';

        // Position tooltip
        this.positionTooltip(tooltip, rect, step.position);
    }

    positionTooltip(tooltip, targetRect, position) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const padding = 20;

        switch (position) {
            case 'right':
                tooltip.style.top = `${targetRect.top}px`;
                tooltip.style.left = `${targetRect.right + padding}px`;
                break;
            case 'left':
                tooltip.style.top = `${targetRect.top}px`;
                tooltip.style.left = `${targetRect.left - tooltipRect.width - padding}px`;
                break;
            case 'top':
                tooltip.style.top = `${targetRect.top - tooltipRect.height - padding}px`;
                tooltip.style.left = `${targetRect.left + targetRect.width / 2 - tooltipRect.width / 2}px`;
                break;
            case 'bottom':
                tooltip.style.top = `${targetRect.bottom + padding}px`;
                tooltip.style.left = `${targetRect.left + targetRect.width / 2 - tooltipRect.width / 2}px`;
                break;
            case 'center':
                tooltip.style.top = `${targetRect.top + targetRect.height / 2 - tooltipRect.height / 2}px`;
                tooltip.style.left = `${targetRect.left + targetRect.width / 2 - tooltipRect.width / 2}px`;
                break;
        }
    }

    nextStep() {
        this.showStep(this.currentStep + 1);
    }

    end() {
        this.overlay.remove();
        
        // Show success toast
        if (this.app.toast) {
            this.app.toast.success('Tour complete! Start creating your baseplate.');
        }
    }
}
