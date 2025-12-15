import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import React from 'react';

// Test component that throws an error
const TestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Test content</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('calls onError when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('has retry functionality', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onRetry = jest.fn();
    
    render(
      <ErrorBoundary onRetry={onRetry}>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('shows error details in development', () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/error details/i)).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
    consoleSpy.mockRestore();
  });

  it('can use custom fallback component', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const CustomFallback = ({ error, retry }: { error?: Error; retry: () => void }) => (
      <div>
        <h2>Custom Error</h2>
        <p>{error?.message}</p>
        <button onClick={retry}>Custom Retry</button>
      </div>
    );
    
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Custom Retry')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});