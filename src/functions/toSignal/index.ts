import { Signal, signal } from "../../store"
import { isObject } from "../../utils"


export function toSignals<T = any>(value: T) {
  if (Array.isArray(value)) {
    return value.map(v => signal(v))
  } else if (isObject(value)) {
    let signals: Record<any, any> = {}
    
    for (const key in value) {
      const item = value[key];
      if (typeof item == "object") {
      //  Object.defineProperty(signals)
        signals[key] = toSignals(item as T)
        return;
      }
      
      signals[key] = signal(item)
    }
    
    return signals;
  } else {
    return signal(value)
  }
}

export function toSignal(value: any) {
  if (value instanceof Signal || value?.subscribe && value?.value && value?.peek) {
    return value
  }

  return signal(value)
}