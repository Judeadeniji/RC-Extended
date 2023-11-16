import { useLayoutEffect } from "react";
import { SignalRefObject, signalRef, toValue } from "../../functions";
import { Signal } from "../../store";

/**
 * @example ```tsx
 * import { useCssVar } from 'rc-extended/use'
 * import { signalRef } from 'rc-extended/store'
 * const el = signalRef(null)
 * const color1 = useCssVar('--color', el)
 * const elv = signalRef(null)
 * const key = signalRef('--color')
 * const colorVal = useCssVar(key, elv)
 * const someEl = signalRef(null)
 * const color2 = useCssVar('--color', someEl, { initialValue: '#eee' })
 * ```
 */
export function useCssVar(key: string, el:  SignalRefObject<HTMLElement | null>, options?: {
    initialValue?: string;
}): Signal<string>;
export function useCssVar(key: string, el: SignalRefObject<HTMLElement | null>, options?: {
    initialValue?: string;
}): Signal<string> {
    const initialValue = options?.initialValue;
    const signal = signalRef(initialValue);
    useLayoutEffect(() => {
       const unsubscribe = el.subscribe((elv) => {  
            if (elv) {
                const value = getComputedStyle(elv).getPropertyValue(key);
                signal.set(value);
            }
        });

        return unsubscribe;
    }, [el, key, signal]);
    return signal;
}