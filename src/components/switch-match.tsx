import React, { ReactNode, useEffect } from "react";
import { Signal, signal } from "../store/signals.js"
import useReactive from "../hooks/reactive.js"

/**
 * Props for the Switch component.
 * @typedef {Object} SwitchProps
 * @property {ReactNode} fallback - The fallback content to render when no condition matches.
 * @property {ReactNode | ReactNode[]} children - The child components representing conditions and content.
 */
 export type SwitchProps = {
   fallback: ReactNode;
   children: ReactNode | ReactNode[];
 }

/**
 * The Switch component conditionally renders its children based on the first matching condition.
 * @param {SwitchProps} props - The props for the Switch component.
 * @returns {ReactNode | ReactNode[]} The content to render.
 */
function Switch({ fallback, children }: SwitchProps): ReactNode | ReactNode[] {
  let matchedChild: ReactNode | null = null;

  React.Children.forEach(children, (child) => {
    if (!matchedChild && React.isValidElement(child) && child.type === Match) {
      const { when, children } = child.props;
      if (when) {
        matchedChild = children;
      }
    }
  });

  return matchedChild || fallback;
}

/**
 * Props for the Match component.
 * @typedef {Object} MatchProps
 * @property {any} when - The condition to match for rendering the children.
 * @property {Signal<any>} $when - The condition to match for rendering the children.
 * @property {ReactNode | ReactNode[]} children - The content to render when the condition is true.
 */
 type MatchProps = {
   when?: any;
   $when?: Signal<any>;
   children: ReactNode | ReactNode[];
 }
 
type ExclusiveMatchProps =
  | ({ when: any; $when?: never })
  | ({ when?: never; $when: Signal<any> });


/**
 * This component renders its children when the specified condition is true.
 * @param {MatchProps} props - The props for the Match component.
 * @returns {ReactNode | null} The content to render or null if the condition is false.
 */
function Match({ when, $when, children }: MatchProps & ExclusiveMatchProps) {
  
  const whenV = useReactive($when?.value)
  
  useEffect(() => {
    if(when && $when) {
      throw new Error("Provide only one of $when or when as prop to <Match>")
    }
    
    if ($when && !($when instanceof Signal)) {
      throw new TypeError("$when prop must be a signal or an instance of Signal")
    }
    
    if ($when) {
      return $when.subscribe((newState: any) => {
        whenV.value = newState
      })
    }
  }, [])
  
  if ($when) {
    return whenV.value ? children : null;
  }
  
  return when ? children : null;
}

export {
  Switch,
  Match
}