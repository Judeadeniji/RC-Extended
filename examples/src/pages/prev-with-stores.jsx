import { defineStore } from "rc-extended/store"

// you'll probably want to define this in something like a store.js file
const usePrevStore = defineStore("prev", {
  state() {
    return ({
      prev: null,
      curr: "green",
      input: ''
    })
  },
  actions: {
    submit(state, ev) {
      ev.preventDefault();
      return {
        prev: state.curr,
        curr: state.input,
        input: "",
      }
    },
    undo(state) {
      return {
        prev: null,
        curr: state.prev,
        input: state.curr,
      }
    },
    handleChange(_, input) {
      return { input }
    }
  },
  effects: {
    // an effect that depends on store.prev, this will run when curr changes 
    prev: (newValue) => {
      alert(`curr changed to ${newValue}`)
      console.log("Previous value has changed to ", newValue)
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
        <input onChange={(e) => handleChange(e.target.value)} value={input} type="text" className="border h-10 w-full rounded focus:outline-gray-400 px-3" />
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