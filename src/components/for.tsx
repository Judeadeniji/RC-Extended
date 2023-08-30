import React, { useEffect, ReactElement, ReactNode } from "react";

/**
 * Props for the For component.
 */
interface ForProps {
  /**
   * An array of items to iterate over.
   */
  each: any[];
  /**
   * The child component to render for each item.
   */
  children: ReactElement;
}

/**
 * Component that iterates over an array and renders a child component for each item.
 * @param {ForProps} props - The props for the For component.
 * @returns {ReactNode[]} An array of rendered child components.
 * @throws {Error} If used incorrectly with multiple children or a non-array `each` prop.
 */
export function For({ each, children }: ForProps): ReactNode[] {
  useEffect(() => {
    if (Array.isArray(children)) {
      throw new Error("Only provide one child to <For> component");
    }
    
    if (!Array.isArray(each)) {
      throw new Error("each prop must be an array <For each={[...]}>");
    }
  }, [Array.isArray(children), !Array.isArray(each)])
  
  const ForChildComponent = children.type;
  const props = { ...children.props };
  
  return each.map((item, index) => <ForChildComponent {...{ ...props, item, index }} />);
}
