// src/global.d.ts
import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'star-rating': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          total?: number | string;
          value?: number | string;
          'default-value'?: number | string;
          size?: number | string;
          gap?: number | string;
          'read-only'?: boolean | '';
          'hover-colors'?: string;
          // Allow `class` attribute in JSX for custom element
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}
