import { signal, useSignal } from "rc-extended/store"

const prev = signal(null);
const curr = signal("green");
const input = signal('');

function Input () {
  const [inputValue, setInput] = useSignal(input);
  
  return (
    <input onChange={(e) => setInput(e.target.value)} value={inputValue} type="text" className="border h-10 w-full rounded focus:outline-gray-400 px-3" />
  )
}


export default function PrevWithSignals2() {
  const [currValue, setCurr] = useSignal(curr)
  const [prevValue, setPrev] = useSignal(prev)
  const [inputValue, setInput] = useSignal(input)
  
  function handleSubmit(ev) {
    ev.preventDefault();
    setPrev(currValue);
    setCurr(inputValue);
    setInput('');
  }
  
  function handleUndo() {
    setPrev(null)
    // well y'all might be thinking currValue will be set to null because we already set prevValue to null
    setCurr(prevValue);
    // well ya wrong 😂😂
    // because updates are batched 🤝
    setInput(currValue)
  }
  
  return (
    <div className="w-full flex flex-col items-center">
    <p>Prev: {prevValue}</p>
    <p>Current: {currValue}</p>
      <form onSubmit={handleSubmit} className="flex gap-x-2">
        <Input />
        <button className="h-10 px-2 rounded bg-black text-white font-semibold">
          Submit
        </button>
       </form>
      <button disabled={!prevValue} onClick={handleUndo} className="w-80 mt-3 h-10 px-2 rounded text-black border mx-4 border-black font-semibold disabled:border-gray-300 disabled:text-gray-300">
        Undo
      </button>
    </div>
  )
}