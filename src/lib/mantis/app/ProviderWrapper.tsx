'use client';

import { ReactNode } from 'react';

// next
import { SessionProvider } from 'next-auth/react';

// material-ui
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

// project imports
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import ScrollTop from 'components/ScrollTop';
import RTLLayout from 'components/RTLLayout';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

import { DEFAULT_THEME_MODE } from 'config';
import { ConfigProvider } from 'contexts/ConfigContext';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function ProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <InitColorSchemeScript modeStorageKey="theme-mode" attribute="data-color-scheme" defaultMode={DEFAULT_THEME_MODE} />
      <ConfigProvider>
        <ThemeCustomization>
          <RTLLayout>
            <Locales>
              <ScrollTop>
                <SessionProvider refetchInterval={0}>
                  <Notistack>
                    <Snackbar />
                    {children}
                  </Notistack>
                </SessionProvider>
              </ScrollTop>
            </Locales>
          </RTLLayout>
        </ThemeCustomization>
      </ConfigProvider>
    </>
  );
}
