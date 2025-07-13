/**
 * Error Boundary Hook
 * Provides error handling capabilities for React components
 */

import { useState, useCallback } from 'react';

export interface ErrorBoundaryState {
  error: Error | null;
  resetError: () => void;
}

/**
 * Custom hook for error boundary functionality
 * @returns Error state and reset function
 */
export function useErrorBoundary(): ErrorBoundaryState {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // In a real implementation, this would integrate with React Error Boundaries
  // For now, we'll provide a simple error state management
  return { error, resetError };
} 