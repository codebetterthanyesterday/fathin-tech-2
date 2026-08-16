'use client';

import { useEffect } from 'react';

export function FontAwesomeLoader() {
  useEffect(() => {
    // Fallback in case the stylesheet loaded before hydration
    // and the onLoad event fired before React attached the listener
    const link = document.getElementById('fa-stylesheet') as HTMLLinkElement;
    if (link && link.sheet) {
      link.media = 'all';
    }
  }, []);

  return (
    <link
      id="fa-stylesheet"
      suppressHydrationWarning
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      media="print"
      onLoad={(e) => {
        (e.currentTarget as HTMLLinkElement).media = 'all';
      }}
    />
  );
}
