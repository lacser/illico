'use client';

import { Provider } from 'react-redux';
import { makeStore } from './store';
import { useRef } from 'react';
import type { AppStore } from './store';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
