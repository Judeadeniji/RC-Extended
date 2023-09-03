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
  children: ReactElement<any, any> & { props: { [key: string]: any } } | ((item: any, index: number) => ReactNode);
}

/**
 * Component that iterates over an array and renders a child component for each item.
 *
 * @component
 * @example
 * // Renders a list of names using the <NameItem> component for each name in the array.
 * <For each={names}>
 *   <NameItem />
 * </For>
 *
 * @param {ForProps} props - The props for the For component.
 * @param {any[]} props.each - An array of items to iterate over.
 * @param {ReactElement} props.children - The child component to render for each item.
 * @returns {ReactNode[]} An array of rendered child components.
 * @throws {Error} If used incorrectly with multiple children or a non-array `each` prop.
 */

export function For({ each = [], children }: ForProps): ReactNode[] {
  useEffect(() => {
    if (!Array.isArray(each)) {
      throw new Error("each prop must be an array <For each={[...]}>");
    }
  }, [each]);

  if (typeof children === "function") {
    const renderFunction = children as (item: any, index: number) => ReactNode;

    return each.map((item, index) => renderFunction(item, index));
  }

  if (Array.isArray(children) || !React.isValidElement(children)) {
    throw new Error("Only provide one valid child element or function to <For> component");
  }

  const ForChildComponent = children.type;
  const props = { ...children.props };

  const renderedChildren: ReactNode[] = [];
  const length = each.length;

  for (let index = 0; index < length; index++) {
    const item = each[index];
    renderedChildren.push(<ForChildComponent {...{ ...props, [props?.item || "item"]: item, [props?.index || "index"]: index }} />);
  }

  return renderedChildren;
}
