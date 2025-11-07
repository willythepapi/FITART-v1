
import React, { createContext, useContext } from 'react';
import type { AppUseCases } from './usecases';
import { useCases } from './usecases';

const UseCaseContext = createContext<AppUseCases | null>(null);

export const UseCaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UseCaseContext.Provider value={useCases}>
      {children}
    </UseCaseContext.Provider>
  );
};

export const useAppUseCases = (): AppUseCases => {
  const context = useContext(UseCaseContext);
  if (!context) {
    throw new Error('useAppUseCases must be used within a UseCaseProvider');
  }
  return context;
};
