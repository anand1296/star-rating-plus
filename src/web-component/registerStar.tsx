// src/web-component/registerStar.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import StarRating from '../components/StarRating';

function parseHoverColors(raw?: string) {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return raw.split?.(',').map((s) => s.trim()).filter(Boolean);
}

function parseSizeToPx(raw?: string): number | undefined {
  if (!raw) return undefined;
  const trimmed = String(raw).trim();
  if (/^[0-9]+$/.test(trimmed)) return Number(trimmed);
  if (trimmed.endsWith('px')) return parseFloat(trimmed);
  if (trimmed.endsWith('rem')) {
    const rem = parseFloat(trimmed);
    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
    return Math.round(rem * rootFont);
  }
  const f = parseFloat(trimmed);
  return Number.isFinite(f) ? f : undefined;
}

class StarElement extends HTMLElement {
  private mountNode?: HTMLDivElement;
  private reactRoot?: ReturnType<typeof createRoot>;
  private mo?: MutationObserver;
  private lastComputedSizePx?: number;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.setAttribute('part', 'container');
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = 'var(--sr-gap, 8px)';
    wrapper.style.setProperty('--sr-star-size', '28px');
    shadow.appendChild(wrapper);
    this.mountNode = wrapper;
  }

  static get observedAttributes() {
    return ['total', 'value', 'default-value', 'size', 'read-only', 'hover-colors', 'gap', 'style', 'class'];
  }

  connectedCallback() {
    this.render();
    this.updateFromHost();

    // Observe host attribute changes (class/style/gap) — React's className updates attribute 'class',
    // so MutationObserver will pick it up. Still defensive: we check className property as well.
    this.mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes') {
          const attr = (m).attributeName;
          if (attr === 'class' || attr === 'style' || attr === 'gap') {
            this.updateFromHost();
          }
        }
      }
    });
    this.mo.observe(this, { attributes: true, attributeFilter: ['class', 'style', 'gap'] });
  }

  disconnectedCallback() {
    this.reactRoot?.unmount();
    this.mo?.disconnect();
  }

  attributeChangedCallback() {
    this.render();
    this.updateFromHost();
  }

  private updateFromHost() {
    this.updateGapFromHost();
    this.updateSizeFromHost();
  }

  private updateGapFromHost() {
    if (!this.mountNode) return;

    // 1) explicit gap attribute -> accepts numeric (px) or raw string (e.g., "1rem")
    const gapAttr = this.getAttribute('gap');
    if (gapAttr) {
      const gapVal = /^[0-9]+$/.test(gapAttr) ? `${gapAttr}px` : gapAttr;
      this.mountNode.style.gap = gapVal;
      return;
    }

    // (Note: getComputedStyle will reflect className either way, but reading className helps
    //  when debug or when some environments don't sync attribute immediately.)
    try {
      const cs = window.getComputedStyle(this);
      // prefer computed gap if non-zero
      const hostGap = cs.getPropertyValue('gap')?.trim();
      if (hostGap && hostGap !== '0px' && hostGap !== 'normal') {
        this.mountNode.style.gap = hostGap;
        return;
      }
      // else fallback to css var --sr-gap on host
      const varGap = cs.getPropertyValue('--sr-gap')?.trim();
      if (varGap) {
        this.mountNode.style.gap = varGap;
        return;
      }
    } catch {
      // ignore
    }

    // 3) fallback: default
    this.mountNode.style.gap = '8px';
  }

  private updateSizeFromHost() {
    if (!this.mountNode) return;

    // explicit size attribute
    const sizeAttr = this.getAttribute('size');
    if (sizeAttr) {
      const px = parseSizeToPx(sizeAttr);
      if (px) {
        this.mountNode.style.setProperty('--sr-star-size', `${px}px`);
        this.lastComputedSizePx = px;
        return;
      }
    }

    // try computed var --sr-star-size on host (reflects className or inline style)
    try {
      const cs = window.getComputedStyle(this);
      const varVal = cs.getPropertyValue('--sr-star-size')?.trim();
      const parsed = parseSizeToPx(varVal);
      if (parsed) {
        this.mountNode.style.setProperty('--sr-star-size', `${parsed}px`);
        this.lastComputedSizePx = parsed;
        return;
      }
    } catch {
      // ignore
    }

    // fallback default
    this.mountNode.style.setProperty('--sr-star-size', '28px');
    this.lastComputedSizePx = 28;
  }

  private getProps() {
    const total = Number(this.getAttribute('total') ?? 5);
    const valueAttr = this.getAttribute('value');
    const value = valueAttr === null ? undefined : Number(valueAttr);
    const defaultValueAttr = this.getAttribute('default-value');
    const defaultValue = defaultValueAttr === null ? undefined : Number(defaultValueAttr);
    const sizeAttr = this.getAttribute('size');
    const size = sizeAttr ? parseSizeToPx(sizeAttr) : this.lastComputedSizePx;
    const readOnly = this.hasAttribute('read-only');
    const hoverColors = parseHoverColors(this.getAttribute('hover-colors') || undefined);

    // read gap from mountNode style and convert to number if px
    let gapProp: string | number | undefined = undefined;
    if (this.mountNode) {
      const v = (this.mountNode as HTMLElement).style.gap;
      if (v) {
        const m = v.match(/^([0-9.]+)px$/);
        gapProp = m ? Number(m[1]) : v;
      }
    }

    return { total, value, defaultValue, size, readOnly, hoverColors, gap: gapProp };
  }

  render() {
    if (!this.mountNode) return;
    if (!this.reactRoot) this.reactRoot = createRoot(this.mountNode);

    const props = this.getProps();
    this.reactRoot.render(
      React.createElement(StarRating, {
        ...props,
        onChange: (v: number) => {
          this.setAttribute('value', String(v));
          this.dispatchEvent(new CustomEvent('change', { detail: { value: v } }));
        },
      })
    );
  }
}

if (!customElements.get('star-rating')) {
  customElements.define('star-rating', StarElement);
}

export default StarElement;
