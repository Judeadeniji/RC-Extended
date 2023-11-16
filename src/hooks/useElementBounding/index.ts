import { useEffect, useState } from "react";
import { SignalRefObject } from "../../functions";
import { useSupported } from "../useSupported";
import { $signal, $watch, Signal } from "../../store";
import exp from "constants";


/**
 * A hook that returns a signal containing the bounding rectangle of a given element.
 * @param elementRef A signal reference object containing the element to measure.
 * @returns {Signal<DOMRect | null>} A signal containing the bounding rectangle of the element, or null if the element is not supported or not found.
 */
function useElementBounding(
  elementRef: SignalRefObject<HTMLElement | null>
): Signal<DOMRect | null> {
  const bounding = $signal<DOMRect | null>(null);
  const isSupported = useSupported(() =>  "current" in elementRef && elementRef.peek()?.getBoundingClientRect)

  const stop = $watch(elementRef, (element: HTMLElement) => {
    if (isSupported.value && element) {
        bounding.set(element.getBoundingClientRect())
    }
    return stop
  })

 return bounding
}

export {
    useElementBounding
}