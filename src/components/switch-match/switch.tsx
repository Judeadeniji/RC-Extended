import React, { ReactNode, ReactElement, useEffect, Fragment } from "react";
import { Signal, signal } from "../../store/signals.js"
import { Match, type MatchProps } from "./match.js"
import useReactive from "../../hooks/reactive.js"

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
export function Switch({ fallback, defaultName, children }: SwitchProps): React.JSX.Element{
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
