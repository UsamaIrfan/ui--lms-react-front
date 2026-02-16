"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RiAlertLine, RiRefreshLine, RiBugLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReport = () => {
    const { error } = this.state;
    if (error) {
      // In production, send to error tracking service
      console.info("Error report:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          onRetry={this.handleRetry}
          onReport={this.handleReport}
        />
      );
    }

    return this.props.children;
  }
}

// ─────────────────────────────────────────────
// Error Fallback UI
// ─────────────────────────────────────────────

function ErrorFallback({
  onRetry,
  onReport,
}: {
  onRetry: () => void;
  onReport: () => void;
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-lighter">
            <RiAlertLine className="h-8 w-8 text-error-base" />
          </div>
          <h3 className="text-label-lg text-text-strong-950">
            Something went wrong
          </h3>
          <p className="mt-2 max-w-xs text-paragraph-sm text-text-sub-600">
            An unexpected error occurred. Please try again, or report the issue
            if it persists.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button onClick={onRetry} size="sm">
              <RiRefreshLine className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={onReport} variant="outline" size="sm">
              <RiBugLine className="h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
