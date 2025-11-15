# ⭐ star-rating-plus

A flexible, lightweight **React + Web Component** star rating widget with:

- Default yellow hover + selected color  
- Support for **dynamic per-star colors**  
- Works **with or without Tailwind**  
- Zero configuration required  
- React component **and** Web Component  
- Fully typed, tree‑shakeable, framework‑agnostic

---

## 🚀 Installation

```bash
npm install star-rating-plus
```

---

## ✨ Basic Usage (React)

### ⭐ Default — Yellow Rating

If you only specify `total`, you automatically get:

- `total` empty stars
- Yellow hover + selection

```tsx
import { StarRating } from "star-rating-plus";

export default function App() {
  return <StarRating total={5} />;
}
```

---

## 🎨 Dynamic Per‑Star Colors (Multicolor Rating)

You can override default yellow with a color array.

⚠️ **The color array *must match* `total`.**

```tsx
const colors = [
  "#d90000", // star 1
  "#ff6b6b", // star 2
  "#ffd055", // star 3
  "#b7eb8f", // star 4
  "#237804", // star 5
];

<StarRating total={5} hoverColors={colors} />;
```

---

## 📌 Controlled Component

```tsx
const [value, setValue] = useState(3);

<StarRating
  total={5}
  value={value}
  onChange={setValue}
/>;
```

---

## 🧩 Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `total` | `number` | ✅ Yes | — | Number of stars |
| `value` | `number` | ❌ No | `0` | Controlled selected value |
| `defaultValue` | `number` | ❌ No | `0` | Uncontrolled initial value |
| `onChange` | `(v: number) => void` | ❌ No | — | Called when user selects a star |
| `hoverColors` | `string[]` | ❌ No | `["#FFD700", ...]` | Must match `total`. Dynamically colors each star |
| `size` | `number` | ❌ No | `28` | Star size in px |
| `className` | `string` | ❌ No | — | Host container styling (including `gap-*`) |

---

## 🌐 Using the Web Component

If you don’t want React, you can use:

```html
<script type="module">
  import "star-rating-plus/dist/web.js";
</script>

<star-rating total="5"></star-rating>
```

### With Multicolor

```html
<star-rating
  total="5"
  hover-colors='["#ff6b6b", "#ffd055", "#b7eb8f", "#237804", "#005500"]'
></star-rating>
```

### With Gap or Size

```html
<star-rating total="5" size="48" class="gap-8"></star-rating>
```

---

## 🎯 Using in Angular

```ts
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

```html
<star-rating total="5"></star-rating>
```

---

## 🎯 Using in Vue

```ts
// main.js
import "star-rating-plus/dist/web.js";
```

```html
<star-rating total="5"></star-rating>
```

---

## 📝 License

MIT © 2025 star-rating-plus team
