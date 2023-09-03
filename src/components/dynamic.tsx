import React from "react";

/**
 * Props for the Dynamic component.
 */
interface DynamicProps {
  /**
   * The component or string element type to render dynamically.
   */
  component: React.ComponentType<any> | string;
  /**
   * Additional props to pass to the dynamically rendered component.
   */
  props?: Record<string, any>;
}

/**
 * The Dynamic component renders a component or native element dynamically.
 * @param {DynamicProps} props - The props for the Dynamic component.
 * @returns {React.ReactElement} The rendered component.
 */
export function Dynamic({
  component: DynamicComponent,
  props = {},
}: DynamicProps): React.ReactElement {
  return <DynamicComponent {...props} />;
}
