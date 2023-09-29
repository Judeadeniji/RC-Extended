import { defineStore } from "rc-extended/store"

// you'll probably want to define this in something like a store.js file
const usePrevStore = defineStore("prev", {
  state() {
    return ({
      prev: null,
      curr: null,
      input: ''
    })
  },
  actions: {
    submit(state, ev) {
      ev.preventDefault();
      return {
        ...state,
        prev: state.curr,
        curr: state.input,
        input: "",
      }
    },
    undo(state) {
      return {
        ...state,
        prev: null,
        curr: state.prev,
        input: state.curr,
      }
    },
    handleChange(state, input) {
      return {
        ...state,
        input
      }
    }
  }
})


export default function PrevWithSignals1() {
  const { prev, curr, undo, submit, input, handleChange } = usePrevStore()
  
  return (
    <div className="w-full flex flex-col items-center">
    <p>Prev: {prev}</p>
    <p>Current: {curr}</p>
      <form onSubmit={submit} className="flex gap-x-2">
        <input onChange={(e) => handleChange(e.targey.value)} value={input} type="text" className="border h-10 w-full rounded focus:outline-gray-400 px-3" />
        <button className="h-10 px-2 rounded bg-black text-white font-semibold">
          Submit
        </button>
       </form>
      <button disabled={!prev} onClick={undo} className="w-80 mt-3 h-10 px-2 rounded text-black border mx-4 border-black font-semibold disabled:border-gray-300 disabled:text-gray-300">
        Undo
      </button>
    </div>
  )
}