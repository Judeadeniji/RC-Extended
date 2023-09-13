import React, { ReactNode, ReactElement, useState, useEffect } from "react";
import { Signal } from "../store"

interface IfProps<> {
  when?: unknown; // deliberately didn't use boolean
  $when?: Signal<unknown>;
  fallback?: null | undefined | ReactNode;
  children: ReactNode | (() => ReactNode);
}

/**
 * Conditional rendering component that renders its children or a fallback based on a condition.
 *
 * @component
 * @example
 * // Renders <div>Content</div> if `someCondition` resolves to `true`, otherwise renders <p>Fallback</p>
 * <If condition={someCondition} fallback={<p>Fallback</p>}>
 *   <div>Content</div>
 * </If>
 *
 * @example
 * // Renders the result of the `renderContent` function if `someCondition` is `true`,
 * // otherwise renders null.
 * <If condition={someCondition} fallback={null}>
 *   {() => <SomeComponent />}
 * </If>
 *
 * @param {Object} props - The props of the If component.
 * @param {unknown} props.condition - The condition to evaluate for rendering.
 * @param {ReactNode} [props.fallback=null] - The fallback content to render when the condition is not met.
 * @param {(ReactNode|function(fallback: ReactNode): ReactNode)} props.children - The content to render when the condition is met.
 * @returns {ReactNode|null} The rendered content based on the condition.
 */
export function Show({ when, $when, fallback = null, children }: IfProps): ReactNode | null {

  if($when && !($when instanceof Signal)) {
    throw new TypeError("$when prop must receive a signal as value")
  }
  
  const [whenV, setWhenV] = useState<any | false>($when.value || false)
  
  useEffect(() => {
    if ($when) {
      return $when.subscribe(n => setWhenV(n))
    }
  }, [])
  
  if (Boolean(when)) {
    if (typeof children === 'function') {
      return children();
    }
    return children;
  } else if (Boolean(whenV)) {
    if (typeof children === 'function') {
      return children();
    }
    return children;
  } else {
    return fallback;
  }
}

export {
  Show as If
}