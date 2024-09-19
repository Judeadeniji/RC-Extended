import './App.css'
import { ErrorBoundary, Switch, Match } from "rc-extended/components"
import { defineStore, useSignalValue, useStore } from "rc-extended/store"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { TodoApp as TodoApp2 } from "@/components/todo-with-stores"
import { TodoApp } from "@/components/todo"
import { Toaster } from "@/components/ui/toaster"
import { $view } from "@/lib/utils"
import { Button } from './components/ui/button'


const counterStore = defineStore('counter', {
  state() {
    return {
      count: 0,
      anotherState: 0
    }
  },
  actions: {
    increment() {
      this.count++ // this should work
    },
    decrement() {
      return {
        count: this.count - 1,
      } // this should also work
    },
  },

  computed: {
    doubleCount() {
      return this.count * 2
    },
  },
})

function TestComponent() {
  const countStore = counterStore();
  return (
    <div>
      <h1>Count is {countStore.count}</h1>
      <h1>Double Count is {countStore.doubleCount()}</h1>
      <Button onClick={countStore.increment}>Increment</Button>
      <br />
      <br />
      <Button onClick={countStore.decrement}>Decrement</Button>
    </div>
  )
}

function App() {
  const view = useSignalValue($view)
  return (
    <ErrorBoundary fallback={(e: Error | null) => (<p>{e?.stack}</p>)}>
      <ThemeProvider defaultTheme="dark" storageKey="rc-extended-example-theme">
        <main className="min-w-full min-h-full max-w-lg md:mx-auto">
          <Header />
          <Switch defaultName="stores">
            <Match when={view === "signals"} name="signals">
              <TodoApp />
            </Match>
            <Match when={view === "stores"} name="stores">
              <TodoApp2 />
            </Match>
          </Switch>
          <Toaster />
        </main>
      </ThemeProvider>
     </ErrorBoundary>
  )
}

export default TestComponent
