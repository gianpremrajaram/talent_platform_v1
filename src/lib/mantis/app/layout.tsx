import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';

// project imports
import ProviderWrapper from './ProviderWrapper';

export const metadata: Metadata = {
  title: 'Mantis Material UI React Dashboard Template',
  description: 'Mantis Material UI React Dashboard Template'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script defer src="https://fomo.codedthemes.com/pixel/Oo2pYDncP8R8qhhETpWKGA04b8jPhUjF"></script>
      </head>
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
