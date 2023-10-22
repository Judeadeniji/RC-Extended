import React, { ReactNode, ReactElement, useEffect, Fragment } from "react";
import { Signal, signal } from "../store/signals.js"
import useReactive from "../hooks/reactive.js"

/*
  Note: Two Checks are performed before displaying the correct child.
  First check is performed by Switch Component.
  Second check is done by Match to display it own children if $when | when is true.
  First Check is done so as to prevent a case where we have more than one true $when | when prop to avoid displaying multiple components.
*/

/**
 * Props for the Switch component.
 * @typedef {Object} SwitchProps
 * @property {ReactNode} fallback - The fallback content to render when no condition matches.
 * @property {ReactNode} children - The child components representing conditions and content.
 */
 export type SwitchProps = {
   fallback?: ReactNode;
   defaultName?: string;
   children: ReactElement<MatchProps>[];
 }

/**
 * The Switch component conditionally renders its children based on the first matching condition.
 * @param {SwitchProps} props - The props for the Switch component.
 * @returns {React.JSX.Element} The content to render.
 */
function Switch({ fallback, defaultName, children }: SwitchProps): React.JSX.Element{
  let matchedChild: ReactNode | null = null;

  React.Children.forEach(children, (child) => {
    if (!matchedChild && React.isValidElement(child) && child.type === Match) {
      const { when, children, $when, name }: MatchProps = child.props;
      if (when) {
        matchedChild = children;
      } else if ($when && $when.peek()) {
        matchedChild = children;
      } else if (defaultName && name && (typeof name === "string") && (typeof defaultName === "string") && (name === defaultName)) {
        matchedChild = children
      }
    }
  });

  return <Fragment>{ matchedChild || fallback || null }</Fragment>;
}

/**
 * Props for the Match component.
 * @typedef {Object} MatchProps
 * @property {boolean} when - The condition to match for rendering the children.
 * @property {Signal<boolean>} $when - The condition to match for rendering the children.
 * @property {ReactNode} children - The content to render when the condition is true.
 */
 type MatchProps = {
   when?: boolean;
   $when?: Signal<boolean>;
   name?: string;
   children: ReactNode;
 }
 
type ExclusiveMatchProps =
  | ({ when: boolean; $when?: never })
  | ({ when?: never; $when: Signal<boolean> });


/**
 * This component renders its children when the specified condition is true.
 * @param {MatchProps} props - The props for the Match component.
 * @returns {React.JSX.Element} The content to render or null if the condition is false.
 */
function Match({ when, $when, children }: MatchProps & ExclusiveMatchProps): React.JSX.Element {
  
  const whenV = useReactive($when?.value)
  
  useEffect(() => {
    if(when && $when) {
      throw new Error("Provide only one of $when or when as prop to <Match>")
    }
    
    if ($when && !($when instanceof Signal)) {
      throw new TypeError("$when prop must be a signal or an instance of Signal")
    }
    
    if ($when) {
      return $when.subscribe((newState: boolean) => {
        whenV.value = newState
      })
    }
  }, [])
  
  if ($when) {
    return (
      <Fragment>
        {whenV.value ? children : null};
      </Fragment>
    )
  }
  
  return (
    <Fragment>
      {when ? children : null};
    </Fragment>
  )}

export {
  Switch,
  Match
}