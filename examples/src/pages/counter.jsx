import { getState, getActions, createProvider, defineStore, getStore, readonly } from "rc-extended/store"

const store = defineStore("counter", {
  state() {
    return {
      count: 0
    }
  },
  
  actions: {
    increment(state) {
      return { count: state.count + 1 }
    }
  }
})

const CounterProvider = createProvider(getStore("counter"))

const Counter = () => {
  const state = getState();
  const actions = getActions();
  const state2 = readonly(getStore("counter"))
  
  return (
    <>
      <h1>Count: {state.count}</h1>
      <h1>Readonly: {state2.value.count}</h1>
      <button onClick={actions.increment} className="h-10 px-2 rounded bg-black text-white font-semibold">
          Increment
        </button>
    </>
  )
}

export default function () {
  return (
    <CounterProvider>
      <Counter />
    </CounterProvider>
  )
}