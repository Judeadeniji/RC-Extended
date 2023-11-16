import React, { useEffect, ReactElement, ReactNode } from "react";
import useReactive from "../../hooks/reactive.js";

/**
 * Props for the Resolve component.
 */
interface ResolveProps {
  /**
   * The fallback ReactNode to display if resolution fails.
   */
  fallback?: ReactNode;
  /**
   * The loading ReactNode to display while resolving the component.
   */
  loading?: ReactNode;
  /**
   * The error ReactNode to display if there's an error during resolution.
   */
  errFallback?: (error?: Error | null) => ReactNode;
  /**
   * The ReactElement whose type will be resolved.
   */
  children: ReactElement;
}

/**
 * This component resolves an asynchronous React component and updates the view.
 * @param {ResolveProps} props - The props for the Resolve component.
 * @returns {ReactNode} The resolved component, fallback, loading indicator, or error message.
 */
export function Resolve({
  fallback,
  loading,
  errFallback,
  children,
}: ResolveProps): ReactNode {
  const resolvedComponent = useReactive<ReactElement | null>(null);
  const state = useReactive<{ error: Error | null; isLoading: true | false }>({
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (React.Children.count(children) !== 1) {
      throw new Error("The <Resolve> component can only have one child.");
    }

    const child = React.Children.only(children);

    if (!React.isValidElement(child) || !child.type) {
      throw new TypeError("The provided child is not a valid React element.");
    }
  }, [state.value.isLoading]);

  const invalidate = () => {
    resolvedComponent.value = null;
    state.value = {
      isLoading: true,
      error: null,
    };
  };

  useEffect(() => {
    /**
     * Load the resolved component and update the state.
     */
    async function loadComponent() {
      if (typeof children.type !== "function") {
        throw new TypeError(
          "Child of <Resolve> must be a component. Did you provide a JSX literal by mistake?"
        );
      }

      try {
        //@ts-ignore
        const component = await children.type({
          ...children.props,
          invalidate,
        });
        resolvedComponent.value = component;
        state.value = {
          isLoading: false,
          error: null,
        };
      } catch (e) {
        state.value = {
          isLoading: false,
          error: e as Error,
        };
      }
    }

    loadComponent();
  }, [state.value.isLoading]);

  if (state.value.isLoading) {
    return loading || null;
  }

  if (state.value.error) {
    return typeof errFallback === "function"
      ? errFallback(state.value.error)
      : null;
  }

  if (resolvedComponent.value) {
    return <React.Fragment>{resolvedComponent.value}</React.Fragment>;
  }

  return fallback || null;
}
