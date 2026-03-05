'use client';

import { lazy, ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';

// project imports
import Loader from 'components/Loader';
import { SimpleLayoutType } from 'config';

const Header = lazy(() => import('components/pages/Header'));
const Footer = lazy(() => import('components/pages/Footer'));

interface Props {
  children: ReactNode;
  enableElevationScroll?: boolean;
}

// ==============================|| LAYOUT - SIMPLE / LANDING ||============================== //

export default function SimpleLayout({ children, enableElevationScroll = false }: Props) {
  const pathname = usePathname();
  const layout: string = pathname === 'landing' || pathname === '/' ? SimpleLayoutType.LANDING : SimpleLayoutType.SIMPLE;

  return (
    <Suspense fallback={<Loader />}>
      <Header enableElevationScroll={enableElevationScroll} />
      {children}
      <Footer isFull={layout === SimpleLayoutType.LANDING} />
    </Suspense>
  );
}
