// Optimized navigation wrapper using React 18 startTransition
import { useNavigate } from 'react-router-dom';
import { startTransition, useCallback } from 'react';

/**
 * Custom hook that wraps useNavigate with startTransition
 * for smoother, non-blocking navigation
 */
export const useOptimizedNavigate = () => {
  const navigate = useNavigate();
  
  const optimizedNavigate = useCallback((to, options = {}) => {
    // Use startTransition for non-urgent navigation
    // This allows React to keep the UI responsive during navigation
    startTransition(() => {
      navigate(to, options);
    });
  }, [navigate]);
  
  return optimizedNavigate;
};

export default useOptimizedNavigate;
