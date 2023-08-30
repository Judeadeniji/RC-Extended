import React, { useEffect, ReactElement, ReactNode } from "react";
import useReactive from "../hooks/reactive.js";

/**
 * Props for the Resolve component.
 */
interface ResolveProps {
  /**
   * The fallback ReactNode to display if resolution fails.
   */
  fallback?: ReactNode;
  /**
   * The ReactElement whose type will be resolved.
   */
  children: ReactElement;
}

/**
 * Component that resolves an asynchronous React component and updates the view.
 * @param {ResolveProps} props - The props for the Resolve component.
 * @returns {ReactNode} The resolved component or fallback.
 */
export function Resolve({ fallback, children }: ResolveProps): ReactNode {
  const resolvedComponent = useReactive<ReactNode | null>(null);

  useEffect(() => {
    if (Array.isArray(children)) {
      throw new Error("Only provide one child to <Resolve> component");
    }

    if (!React.isValidElement(children) || !children.type) {
      throw new TypeError("The provided child is not a valid React element.");
    }
  }, []);

  useEffect(() => {
    /**
     * Load the resolved component and update the state.
     */
    async function loadComponent() {
      if (typeof children.type !== "function") {
        throw new TypeError("Child of <Resolve> must be a component, did you provide a JSX literal by mistake?")
      }
      
      //@ts-ignore
      const component = await children.type({
        children: children?.props.children,
        ...children.props,
      });
      resolvedComponent.value = component;
    }

    loadComponent();
  }, [children.type, ...Object.keys(children.props)]);

  if (resolvedComponent.value) {
    return resolvedComponent.value;
  }

  return fallback || null;
}
