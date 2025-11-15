# ⭐ Star Rating Plus

A fully customizable, framework-agnostic **Star Rating component** that works everywhere:

🚀 **React**  
🔥 **Web Components (Vue, Angular, Svelte, plain HTML)**  
🎨 **Tailwind-friendly**  
🎛️ Per-star hover colors  
🎯 Keyboard accessible  
🧩 React component + Web Component  
⚡ Lightweight & fast

---

## 📛 Badges

![npm](https://img.shields.io/npm/v/star-rating-plus?color=blue&label=npm%20version)
![downloads](https://img.shields.io/npm/dm/star-rating-plus)
![ci](https://github.com/anand1296/star-rating-plus/actions/workflows/auto-publish-on-main.yml/badge.svg)

---

# 📦 Installation

```bash
npm install star-rating-plus
# or
yarn add star-rating-plus
# or
pnpm add star-rating-plus
```

---

# 🚀 Usage Examples

## 1️⃣ React Usage

```tsx
import React, { useState } from 'react';
import { StarRating } from 'star-rating-plus';
import 'star-rating-plus/dist/tailwind.css';

export default function App() {
  const [value, setValue] = useState(3);
  const colors = ['#8B0000', '#ff6b6b', '#ffd055', '#b7eb8f', '#237804'];

  return (
    <div className="p-10 space-y-4">
      <StarRating
        total={5}
        value={value}
        onChange={setValue}
        hoverColors={colors}
        size={40}
        className="gap-6"
      />
      <p className="text-lg">Selected rating: {value}</p>
    </div>
  );
}
```

---

## 2️⃣ Web Component (Any Framework)

```html
<link rel="stylesheet" href="/node_modules/star-rating-plus/dist/tailwind.css">

<star-rating
  total="5"
  size="32"
  hover-colors='["#8B0000","#ff6b6b","#ffd055","#b7eb8f","#237804"]'
></star-rating>
```

### Listen for changes

```js
document
  .querySelector('star-rating')
  .addEventListener('change', (e) => console.log('Value:', e.detail.value));
```

---

# 🎨 Tailwind Styling

Apply Tailwind on the **host element**:

```html
<star-rating class="gap-12"></star-rating>
```

Use arbitrary CSS variables:

```html
<star-rating class="[--sr-star-size:56px]"></star-rating>
```

Combine spacing + size:

```html
<star-rating class="gap-10 [--sr-star-size:50px]"></star-rating>
```

---

# ⭐ Examples

### Different sizes

```html
<star-rating size="24"></star-rating>
<star-rating size="40"></star-rating>
<star-rating size="64"></star-rating>
```

### Read-only mode

```html
<star-rating value="4" read-only></star-rating>
```

---

# ⚙️ API Reference

## React Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| total | number | 5 | Number of stars |
| value | number | 0 | Controlled value |
| defaultValue | number | 0 | Uncontrolled value |
| size | number | 28 | Star size in px |
| hoverColors | string[] | — | Per-star hover colors |
| readOnly | boolean | false | Disable interaction |
| className | string | — | Tailwind/className |
| onChange | function | — | Called on value change |

---

## Web Component Attributes

| Attribute | Type | Default | Description |
|----------|------|---------|-------------|
| total | number | 5 | Number of stars |
| value | number | 0 | Current rating |
| default-value | number | 0 | Initial value |
| size | number | 28 | Star size in px |
| hover-colors | JSON | — | e.g. ["red","green"] |
| read-only | boolean | false | Disabled |
| gap | number | 4 | Spacing |

---

# 🎹 Keyboard Support

| Key | Action |
|-----|--------|
| ArrowRight | Increase rating |
| ArrowLeft | Decrease rating |
| Enter/Space | Confirm |
| Tab | Navigate |

---

# 🛠 Local Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run build:css
```

Tests:

```bash
npm test
```

---

# 📝 Changelog

See **CHANGELOG.md**.

---

# 🤝 Contributing

1. Fork  
2. Branch  
3. `npm run dev`  
4. PR  

---

# 📄 License

MIT © 2025
