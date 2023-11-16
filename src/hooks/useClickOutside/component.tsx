import React from "react";
import { signalRef } from "../../functions";
import { useClickOutside } from ".";

type ClickOutsideProp = {
  onClickOutside: () => void;
};

function ClickOutside({
  onClickOutside, children,
}: React.PropsWithChildren<ClickOutsideProp>) {
  const ref = signalRef<HTMLDivElement | null>(null);

  useClickOutside(ref!, onClickOutside);

  return <div ref={ref}>{children}</div>;
}

export { ClickOutside, type ClickOutsideProp }