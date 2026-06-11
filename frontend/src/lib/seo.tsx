'use client';

import { useEffect } from 'react';

export function PageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title + ' | Immo';
    let meta = document.querySelector('meta[name="description"]');
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
