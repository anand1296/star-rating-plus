// src/web-component/registerStar.ts
// Web component wrapper for <star-rating>
// - reads host gap (Tailwind gap-* or inline style) and applies it to the inner stars container
// - supports explicit `gap` attribute (CSS length or plain number -> px)
// - auto-corrects `classname` -> `class` (React JSX quirk)
// - observes class/style/attr changes and reapplies gap dynamically

class StarRatingElement extends HTMLElement {
  static get observedAttributes() {
    return ['gap', 'size', 'hover-colors', 'value', 'default-value', 'read-only', 'classname', 'class', 'style', 'total'];
  }

  shadow: ShadowRoot;
  containerEl: HTMLElement | null = null; // wrapper that holds inner
  innerEl: HTMLElement | null = null;     // this is the element that contains the star buttons (apply gap here)
  mo: MutationObserver | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    // Template: outer container (for alignment) + inner (where stars are appended)
    this.shadow.innerHTML = `
      <style>
        :host { display: inline-block; }
        .sr-container { display: inline-flex; align-items: center; }
        .sr-inner { display: inline-flex; align-items: center; gap: 0.5rem; }
        .sr-button { background: transparent; border: none; padding: 0; display: inline-flex; align-items: center; justify-content:center; }
      </style>
      <div part="container" class="sr-container" style="--sr-star-size:28px;">
        <div part="inner" class="sr-inner" role="radiogroup"></div>
      </div>
    `;

    this.containerEl = this.shadow.querySelector('[part="container"]');
    this.innerEl = this.shadow.querySelector('[part="inner"]');
  }

  connectedCallback() {
    // Fix React JSX quirk (className -> classname attribute); copy to actual `class`
    const classNameAttr = this.getAttribute('classname');
    if (classNameAttr && !this.hasAttribute('class')) {
      this.setAttribute('class', classNameAttr);
      // keep original removed to avoid duplication in the future
      this.removeAttribute('classname');
    }

    // initial render of the stars (calls renderInner which will use attributes)
    this.renderInner();

    // apply gap to inner (stars wrapper)
    this.applyGapFromHost();

    // Observe host attribute/class/style changes to reapply gap / re-render if needed
    this.mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes') {
          const n = m.attributeName;
          if (n === 'class' || n === 'classname' || n === 'style' || n === 'gap') {
            this.applyGapFromHost();
          }
          if (n === 'hover-colors' || n === 'value' || n === 'default-value' || n === 'size' || n === 'total') {
            this.renderInner();
          }
        }
      }
    });
    this.mo.observe(this, { attributes: true, attributeFilter: ['class', 'classname', 'style', 'gap', 'hover-colors', 'value', 'default-value', 'size', 'total'] });

    window.addEventListener('resize', this.onWindowResize);
  }

  disconnectedCallback() {
    if (this.mo) this.mo.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
  }

  attributeChangedCallback(name: string) {
    if (name === 'gap' || name === 'class' || name === 'classname' || name === 'style') {
      this.applyGapFromHost();
    }
    if (name === 'hover-colors' || name === 'value' || name === 'default-value' || name === 'size' || name === 'total') {
      this.renderInner();
    }
  }

  onWindowResize = () => {
    this.applyGapFromHost();
  };

  /**
   * Apply gap to the *inner* element (which directly contains the star buttons).
   * Precedence:
   * 1) explicit `gap` attribute (CSS length or plain number -> px)
   * 2) host computed style `gap` (Tailwind gap-* or inline style)
   * 3) fallback '0.5rem'
   */
  applyGapFromHost() {
    if (!this.innerEl) return;

    // 1) explicit attribute
    const gapAttr = this.getAttribute('gap');
    if (gapAttr !== null) {
      const trimmed = gapAttr.trim();
      const numeric = /^[0-9]+$/.test(trimmed);
      const cssGap = numeric ? `${trimmed}px` : trimmed;
      this.innerEl.style.gap = cssGap;
      return;
    }

    // 2) computed style on host
    try {
      const hostStyle = getComputedStyle(this);
      if (hostStyle && hostStyle.gap && hostStyle.gap !== '0px' && hostStyle.gap !== 'normal') {
        this.innerEl.style.gap = hostStyle.gap;
        return;
      }

      // Also consider if user used a Tailwind class like `gap-8` but applied to host while host is display:flex.
      // getComputedStyle above should have returned it; if not, fallback below.
    } catch {
      // getComputedStyle can fail in weird envs — ignore and fallback
    }

    // 3) fallback
    this.innerEl.style.gap = '0.5rem';
  }

  /**
   * Render inner stars based on attributes: total, size, hover-colors, value, default-value.
   * This is a plain DOM implementation — replace with your actual renderer if you have one.
   */
  renderInner() {
    if (!this.innerEl) return;

    // clear
    this.innerEl.innerHTML = '';

    const totalAttr = parseInt(this.getAttribute('total') || '5', 10);
    const total = Number.isFinite(totalAttr) && totalAttr > 0 ? totalAttr : 5;
    const sizeAttr = parseInt(this.getAttribute('size') || '28', 10);
    const size = Number.isFinite(sizeAttr) ? sizeAttr : 28;

    // parse hover-colors if provided (expects JSON array string)
    let colors: string[] | null = null;
    const hc = this.getAttribute('hover-colors');
    if (hc) {
      try {
        const parsed = JSON.parse(hc);
        if (Array.isArray(parsed)) colors = parsed.map(String);
      } catch {
        colors = null;
      }
    }

    // default yellow fill for selection/hover if not provided
    const defaultColor = '#ffd055';
    const normalizedColors = colors && colors.length >= total
      ? colors.slice(0, total)
      : Array(total).fill(defaultColor);

    // create buttons
    for (let i = 1; i <= total; i++) {
      const btn = document.createElement('button');
      btn.className = 'sr-button';
      btn.setAttribute('aria-label', `${i} star`);
      btn.setAttribute('role', 'radio');
      btn.tabIndex = -1;
      btn.style.width = `${size}px`;
      btn.style.height = `${size}px`;
      btn.style.background = 'transparent';
      btn.style.border = 'none';
      btn.style.padding = '0';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', String(size));
      svg.setAttribute('height', String(size));
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896l-7.335 3.869 1.401-8.168L.132 9.21l8.2-1.192z');
      path.setAttribute('fill', 'transparent');
      path.setAttribute('stroke', '#d9d9d9');
      path.setAttribute('stroke-width', '0.5');

      svg.appendChild(path);
      btn.appendChild(svg);

      // basic hover visual feedback using mouse events — purely visual here
      btn.addEventListener('mouseenter', () => {
        // color up to i
        this.colorStars(i, normalizedColors[i - 1]);
      });
      btn.addEventListener('mouseleave', () => {
        // reset visuals (empty)
        this.colorStars(0, null);
      });

      this.innerEl.appendChild(btn);
    }

    // re-apply gap after DOM change
    this.applyGapFromHost();
  }

  /**
   * Color stars up to `count` using `color` (if color null -> set transparent)
   * Simple helper that sets fill on first N paths inside innerEl.
   */
  colorStars(count: number, color: string | null) {
    if (!this.innerEl) return;
    const buttons = Array.from(this.innerEl.querySelectorAll('button'));
    buttons.forEach((b, idx) => {
      const p = b.querySelector('path');
      if (!p) return;
      if (count > 0 && idx < count) {
        p.setAttribute('fill', color ?? 'transparent');
      } else {
        p.setAttribute('fill', 'transparent');
      }
    });
  }
}

// Register if not already
if (!customElements.get('star-rating')) {
  customElements.define('star-rating', StarRatingElement);
}

export default StarRatingElement;
