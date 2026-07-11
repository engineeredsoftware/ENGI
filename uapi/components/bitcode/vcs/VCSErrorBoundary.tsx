"use client";
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn/alert';

/**
 * Error state boundary for VCS components
 */
interface VCSErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Props for error boundary
 */
interface VCSErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

/**
 * Default error UI
 */
const DefaultErrorFallback = ({ error, reset }: { error: Error; reset: () => void }) => (
  <Alert variant="destructive" className="m-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>VCS Connection Error</AlertTitle>
    <AlertDescription className="mt-2 space-y-2">
      <p>{error.message}</p>
      <Button
        onClick={reset}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </AlertDescription>
  </Alert>
);

/**
 * Error boundary for VCS components
 */
export class VCSErrorBoundary extends React.Component<VCSErrorBoundaryProps, VCSErrorBoundaryState> {
  constructor(props: VCSErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<VCSErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('VCS Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const ErrorComponent = this.props.fallback || DefaultErrorFallback;
      return <ErrorComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * Hook for error handling
 */
export function useVCSError() {
  const [error, setError] = React.useState<Error | null>(null);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error);
    } else {
      setError(new Error(String(error)));
    }
  }, []);

  return {
    error,
    clearError,
    handleError
  };
}
