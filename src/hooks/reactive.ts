import { useState } from "react"

export default function useReactive<T>(_value: T): { value: T }  {
  const [state, setState] = useState<T | any>({ _value });

  if (!("value" in state)) {
    Object.defineProperty(state, "value", {
      get() {
        return this._value;
      },
      set(newValue) {
        setState({ _value: newValue });
      },
    });
  }

  return state;
}