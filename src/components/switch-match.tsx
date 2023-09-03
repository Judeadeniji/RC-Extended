import React, { ReactNode } from "react";

/**
 * Props for the Switch component.
 * @typedef {Object} SwitchProps
 * @property {ReactNode} fallback - The fallback content to render when no condition matches.
 * @property {ReactNode | ReactNode[]} children - The child components representing conditions and content.
 */
 type SwitchProps = {
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
 * @property {boolean} when - The condition to match for rendering the children.
 * @property {ReactNode | ReactNode[]} children - The content to render when the condition is true.
 */
 type MatchProps = {
   when: boolean;
   children: ReactNode | ReactNode[];
 }

/**
 * This component renders its children when the specified condition is true.
 * @param {MatchProps} props - The props for the Match component.
 * @returns {ReactNode | null} The content to render or null if the condition is false.
 */
function Match({ when, children }: MatchProps) {
  return when ? children : null;
}

export {
  Switch,
  Match
}