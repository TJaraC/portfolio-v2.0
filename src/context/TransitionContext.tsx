import { createContext, useContext } from 'react';

interface TransitionContextValue {
  transitionTo: (path: string) => void;
}

export const TransitionContext = createContext<TransitionContextValue>({
  transitionTo: () => {},
});

export const useTransition = () => useContext(TransitionContext);
