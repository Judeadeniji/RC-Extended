import exp from "constants";
import { $signal, Signal } from "../../store";

function useAsyncState<T>(initialState: T) {
  const state = $signal(initialState);
  const loading = $signal(false);

  function setState(newState: T) {
    loading.value = true;
    Promise.resolve(newState).then((value) => {
      state.value = value;
      loading.value = false;
    })
  }
  return {
    get value() {
        return state.value;
    },
    set value(newState: T) {
        setState(newState);
    },
    get loading() {
        return loading.value;
    },
    subscribe: state.subscribe,
    peek: state.peek,
  } as Signal<T> & { loading: boolean };
}

export {
    useAsyncState
}