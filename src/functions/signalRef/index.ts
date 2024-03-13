import { useRef, LegacyRef, Ref } from "react";
import { Signal, signal } from "../../store";
import { toValue } from "..";
import { type MaybeSignal } from "../../utils";

export type SignalRefObject<T> = Signal<T> & LegacyRef<T>

export function signalRef<T = any>(
  computed?: T
) {
  const _ref = useRef(signal(computed));
  const proxy = new Proxy(_ref, {
    get(target, property: PropertyKey) {
      if (property === "current") {
        return toValue(target.current);
      }

      return target.current[property as keyof Signal<T>];
    },

    set(target, property: PropertyKey, value: T) {
      if (property === "current") {
        target[property].value = value;
        return true;
      }

      return false;
    }
  });

  return proxy as SignalRefObject<T>;
}