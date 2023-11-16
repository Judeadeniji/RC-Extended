import { type MaybeSignal } from "../../utils";
import { Signal } from "../../store"

export function toValue(signal: any) {
  return ((signal instanceof Signal) || (typeof signal?.subscribe === "function")) ? signal.value : signal
}