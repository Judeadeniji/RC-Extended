import React, { Component, createContext, useContext } from "react";
import { Switch, Match } from "../switch-match";
import { Show } from "../if"

/**
 * Props for the ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error | null) => React.ReactNode | React.ReactElement;
  onError?: (error: Error, componentStack: string) => void;
}

/**
 * State for the ErrorBoundary component.
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Context to provide error information to child components.
 */
const ErrorContext = createContext<ErrorBoundaryState>({ hasError: false, error: null });

/**
 * A React component that acts as an error boundary, catching errors in its child components.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare public state: ErrorBoundaryState;
  declare public props: ErrorBoundaryProps;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
    this.props = props;
  }

  /**
   * Lifecycle method that catches errors in child components.
   * @param {Error} error - The caught error.
   * @param {React.ErrorInfo} info - Additional error information.
   */
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error });
    
    // Notify the parent component or log the error.
    if (this.props.onError) {
      this.props.onError(error, info.componentStack);
    } else {
      console.error(error, info.componentStack);
    }
  }

  render() {
    return (
      <ErrorContext.Provider value={this.state}>
        <Switch fallback={this.props.fallback && this.props.fallback(this.state.error)}>
          <Match when={this.state.hasError}>
            <Show when={Boolean(this.props.fallback)}>
              {this.props.fallback && this.props.fallback(this.state.error)}
            </Show>
            <Show when={!this.props.fallback}>
              <p>Error: {this.state.error?.message}</p>
              <p>Please provide a better fallback UI for this component.</p>
            </Show>
          </Match>
          <Match when={!this.state.hasError}>
            {this.props.children}
          </Match>
        </Switch>
      </ErrorContext.Provider>
    )
  }
}

/**
 * Custom hook to access the error information provided by the ErrorBoundary.
 * @returns {ErrorBoundaryState} The error object or null if no error occurred.
 * @throws {Error} If used outside of the ErrorBoundary component.
 */
export const useBoundaryError = () => {
  const error = useContext(ErrorContext);
  if (!error) {
    throw new Error("useBoundaryError was called outside of an error boundary. Make sure to use it within the ErrorBoundary component.");
  }
  return error;
};

const boundary = ErrorBoundary as unknown as (props: ErrorBoundaryProps) => React.JSX.Element

export {
  boundary as ErrorBoundary
}