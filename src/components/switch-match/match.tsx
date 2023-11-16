import React, { ReactNode, ReactElement, useEffect, Fragment } from "react";
import { Signal, signal } from "../../store/"
import { useReactive } from "../../hooks"


/**
 * Props for the Match component.
 * @typedef {Object} MatchProps
 * @property {boolean} when - The condition to match for rendering the children.
 * @property {Signal<boolean>} $when - The condition to match for rendering the children.
 * @property {ReactNode} children - The content to render when the condition is true.
 */
export type MatchProps = {
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
export function Match({ when, $when, children }: MatchProps & ExclusiveMatchProps): React.JSX.Element {
  
  const whenV = useReactive($when?.value)
  
  useEffect(() => {
    if(when && $when) {
      throw new Error("Provide only one of $when or when as prop to <Match>")
    }
    
    if ($when && !($when as any instanceof Signal)) {
      throw new TypeError("$when prop must be a signal or an instance of Signal")
    }
    
    if ($when) {
      return ($when as Signal<boolean>).subscribe((newState: boolean) => {
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
  )
}
