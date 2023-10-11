import './App.css'
import { ErrorBoundary, Switch, Match } from "rc-extended"
import { useSignalValue } from "rc-extended/store"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { TodoApp as TodoApp2 } from "@/components/todo-with-stores"
import { TodoApp } from "@/components/todo"
import { Toaster } from "@/components/ui/toaster"
import { $view } from "@/lib/utils"


function App() {
  const view = useSignalValue($view)
  return (
    <ErrorBoundary fallback={e => (<p>{e?.stack}</p>)}>
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

export default App
