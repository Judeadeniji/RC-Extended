import { ReactNode } from "react"

export function If({ eval: condition, children }: { eval: boolean; children: ReactNode }): ReactNode | null {
  if (condition) {
    return children
  } else {
    return null;
  }
}