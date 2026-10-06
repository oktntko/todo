import { useContext } from 'react';

import { MainContext } from './MainContext';

export function useMainState() {
  const context = useContext(MainContext);

  if (!context) {
    throw new Error('useMainState must be used within MainStateProvider');
  }

  return context;
}
