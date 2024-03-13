import { Signal } from "../../store"

export function toValue<T = any>(toUnwrap: T extends Signal ? T : T) {
  return ((toUnwrap instanceof Signal) ? toUnwrap.value : (toUnwrap)) as T extends Signal ? T['value'] : T
}