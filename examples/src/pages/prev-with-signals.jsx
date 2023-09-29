import { $signal } from "rc-extended/store"

export default function PrevWithSignals1() {
  const prev = $signal(null);
  const curr = $signal("green");
  const input = $signal('');
  
  function handleSubmit(ev) {
    ev.preventDefault();
    prev.value = curr.value;
    curr.value = input.value;
    input.value = '';
  }
  
  function handleUndo() {
    curr.value = prev.value;
    prev.value = null;
  }
  
  return (
    <div className="w-full flex flex-col items-center">
    <p>Prev: {prev.value}</p>
    <p>Current: {curr.value}</p>
      <form onSubmit={handleSubmit} className="flex gap-x-2">
        <input onChange={(e) => input.value = e.target.value} value={input.value} type="text" className="border h-10 w-full rounded focus:outline-gray-400 px-3" />
        <button className="h-10 px-2 rounded bg-black text-white font-semibold">
          Submit
        </button>
       </form>
      <button disabled={!prev.value} onClick={handleUndo} className="w-80 mt-3 h-10 px-2 rounded text-black border mx-4 border-black font-semibold disabled:border-gray-300 disabled:text-gray-300">
        Undo
      </button>
    </div>
  )
}