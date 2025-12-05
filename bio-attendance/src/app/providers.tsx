'use client';

import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache";
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
}

const convexClient = new ConvexReactClient(convexUrl);

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      <ConvexProvider client={convexClient}>
        <ConvexQueryCacheProvider>
          {children}
        </ConvexQueryCacheProvider>
      </ConvexProvider>
    </ReduxProvider>
  );
};
