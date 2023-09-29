import { Link } from "react-router-dom"
import { For, useFetch, Switch, Match} from "rc-extended"
import { /*$signal, */ $effect, signal, $watch, useSignalValue, useSignalAction } from "rc-extended/store"

function Header() {

  return (
    <header className="dark:bg-black dark:text-white w-full z-30 sticky h-[33px] bg-white bg-opacity-40 backdrop-blur-xl border-b flex items-center justify-center top-0 left-0 right-0">
        <h1 className="text-md font-bold leading-none">All Characters</h1>
    </header>
  )
}

function Card({ character }) {
  return (
    <Link to={`/u/${character.id}`} key={character.name} className="border rounded w-full h-[12rem] relative overflow-hidden">
      <img loading="lazy" src={character.image} alt={character.name} className="w-full h-full object-cover" />
      <div className="absolute bg-white py-2 border-t w-full bottom-0 left-0 right-0 font-semibold text-black text-sm text-center z-10">
        {character.name}
      </div>
    </Link>
  )
}

const idx = signal(1)

function Pagination({/* action, idx */}) {
  const action = useSignalAction(idx);
  
  const next = () => action(idx => idx + 1);
  const prev = () => action(idx => {
   return idx > 1 ? idx - 1 : idx
  });
  
  return (
    <div className="mt-3 border-t w-full p-1 px-3 flex items-center justify-between sticky bottom-0 right-0 left-0 bg-white z-20">
      <button onClick={prev} className="px-3 py-2 rounded font-semibold text-white bg-black">
        Previous 
      </button>
      {idx.value}
      <button onClick={next} className="px-3 py-2 rounded font-semibold text-white bg-black">
        Next
      </button>
    </div>
  )
}

export default function () {
  // const idx = $signal(1);
  const pageIndex = useSignalValue(idx)
  
  const { isPending, isFulfilled, isRejected, result, error, invalidate } = useFetch(`https://rickandmortyapi.com/api/character/?page=${pageIndex}`);
  
  // invalidate the request when the idx signal changes 
  $watch(idx, (newIdxValue) => {
    // do something with newIdxValue;
    console.log({ idx: newIdxValue })
    invalidate()
  })
 $effect(() => {
    idx.value; // referenced here for dependency sake, unless this callback won't register 
    console.log("Hi from $effect")
    
   // we could also invalidate here 😉
   
   return  () => {
     console.log("cleaned 🤧")
   }
  }) 
  
  
  return (
    <main className="h-full min-w-full relative">
      <Header />
      <section className="mt-6 grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-2">
        <Switch fallback={<p>Something Went Wrong 😭</p>}>
          <Match when={isPending}>
            <p>Loading...</p>
          </Match>
          <Match when={isFulfilled}>
            <For each={result && result.results}>
              <Card item="character" />
            </For>
          </Match>
          <Match when={isRejected}>
            {error && error.message}
          </Match>
        </Switch>
      </section>
      <Pagination {...{/*idx={idx.value} action={(cb) => {
        idx.value = cb(idx.value)
      }} */}} />
    </main>
  )
}