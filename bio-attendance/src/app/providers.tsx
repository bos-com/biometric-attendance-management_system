'use client';

import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import {ConvexQueryCacheProvider} from "convex-helpers/react/cache"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
}

const convexClient = new ConvexReactClient(convexUrl);

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ConvexProvider client={convexClient}>
        <ConvexQueryCacheProvider>
    {children}
        </ConvexQueryCacheProvider>
    </ConvexProvider>
  );
};
