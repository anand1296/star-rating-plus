// src/App.tsx
import React, { useEffect, useRef, useState } from 'react';
import { StarRating } from './components/StarRating'; // React component
import './index.css'; // tailwind / base css
import './web-component/registerStar'; // auto-register web component

export default function App() {
  const [val, setVal] = useState(3);
  const colors = ['#8B0000', '#ff6b6b', '#ffd055', '#b7eb8f', '#237804'];

  // example: listening to change event from web component
  const wcRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = wcRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      // e is CustomEvent with detail.value
      const v = (e as CustomEvent).detail?.value;
      console.log('web component changed ->', v);
    };
    el.addEventListener('change', handler as EventListener);
    return () => el.removeEventListener('change', handler as EventListener);
  }, []);

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold">Star Rating — Examples</h1>

      {/* 1) React component (native React API) */}
      <section>
        <h3 className="text-lg font-semibold mb-3">1. React component (className gap)</h3>
        <p className="text-sm text-slate-500 mb-3">
          The React component accepts <code>className</code> so Tailwind gap utilities work directly.
        </p>
        <StarRating
          total={5}
          value={val}
          onChange={setVal}
          hoverColors={colors}
          className="gap-4"
          size={36}
        />
        <p className="mt-3 text-sm">Selected value: {val}</p>
      </section>

      {/* 2) Web component: host className controls gap (React JSX) */}
      <section>
        <h3 className="text-lg font-semibold mb-3">2. Web component (host Tailwind classes)</h3>
        <p className="text-sm text-slate-500 mb-3">
          Use <code>className</code> in JSX - the web component reads the host computed style (gap/vars).
        </p>

        {/* className on custom element works because the web component reads className / computed style */}
        <star-rating
          class="inline-flex gap-8"
          hover-colors='["#8B0000","#ff6b6b","#ffd055","#b7eb8f","#237804"]'
        ></star-rating>
      </section>

      {/* 3) Web component: explicit gap & size attributes */}
      <section>
        <h3 className="text-lg font-semibold mb-3">3. Web component (gap & size attributes)</h3>
        <p className="text-sm text-slate-500 mb-3">
          Use the <code>gap</code> and <code>size</code> attributes - parsed by the web component.
        </p>

        <star-rating className="flex gap-8" size="64" hover-colors='["#8B0000","#ff6b6b","#ffd055","#b7eb8f","#237804"]'></star-rating>
      </section>
    </div>
  );
}
