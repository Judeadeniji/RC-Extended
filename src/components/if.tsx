import { ReactNode } from "react";

interface IfProps {
  condition: true | false; // deliberately didn't use boolean
  fallback?: null | undefined | ReactNode;
  children: ReactNode | ((fallback: null | undefined | ReactNode) => ReactNode);
}

/**
 * Conditional rendering component that renders its children or a fallback based on a condition.
 *
 * @component
 * @example
 * // Renders <div>Content</div> if `someCondition` is `true`, otherwise renders <p>Fallback</p>
 * <If condition={someCondition} fallback={<p>Fallback</p>}>
 *   <div>Content</div>
 * </If>
 *
 * @example
 * // Renders the result of the `renderContent` function if `someCondition` is `true`,
 * // otherwise renders null.
 * <If condition={someCondition} fallback={null}>
 *   {(fallback) => <SomeComponent />}
 * </If>
 *
 * @param {Object} props - The props of the If component.
 * @param {boolean} props.condition - The condition to evaluate for rendering.
 * @param {ReactNode} [props.fallback=null] - The fallback content to render when the condition is not met.
 * @param {(ReactNode|function(fallback: ReactNode): ReactNode)} props.children - The content to render when the condition is met.
 *                         If it's a function, the function is called with the fallback content as an argument.
 * @returns {ReactNode|null} The rendered content based on the condition.
 */
export function If({ condition, fallback = null, children }: IfProps): ReactNode | null {
  if (condition) {
    if (typeof children === 'function') {
      return children(fallback);
    }
    return children;
  } else {
    return fallback;
  }
}
