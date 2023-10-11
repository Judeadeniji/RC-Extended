import { cn, useTodos } from "@/lib/utils"
import { Switch, Match, Show, For } from "rc-extended"
import { useSignalAction } from "rc-extended/store"
import { PlusSquare } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch as Toggle } from "@/components/ui/switch"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { $view } from "@/lib/utils"

function Tab() {
  const { tab } = useTodos()
  return (
    <section>
      <TabHeader />
      <div className="my-3">
        <Switch>
          <Match when={tab === "all"}>
            <TodoItems />
          </Match>
          <Match when={tab === "completed"}>
            <TodoItems />
          </Match>
        </Switch>
      </div>
    </section>
  )
}

function TabHeader() {
  const { switchTab, tab } = useTodos()
  return (
    <section className="rounded-md bg-gray-100 dark:bg-zinc-800 p-1 flex items-center flex-row w-full">
      <div onClick={() => switchTab("all")} className={cn("animate-in slide-in-from-right transition-colors duration-300 text-center font-medium text-md w-1/2 text-zinc-700 dark:text-zinc-400 py-1 rounded-md", tab === "all" ? "shadow-sm bg-white dark:bg-black dark:text-white" : "bg-none")}>
        <p>All</p>
      </div>
      <div onClick={() => switchTab("completed")} className={cn("animate-in slide-in-from-left transition-colors duration-300 text-center font-medium text-md w-1/2 text-zinc-700 dark:text-zinc-400 py-1 rounded-md", tab === "completed" ? "shadow-sm bg-white dark:bg-black dark:text-white" : "bg-none")}>
        <p>Completed</p>
      </div>
    </section>
  )
}

function TodoItems() {
  const { completed, tab, total, todos } = useTodos()
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">
          <Show when={tab === "all"}>
            All Todos
          </Show>
          <Show when={tab === "completed"}>
            Completed Todos
          </Show>
        </CardTitle>
        <CardDescription>
          <Show when={tab === "all"}>
            You have a total of {total} todos with {completed.length} completed and {total - completed.length} incomplete.
          </Show>
          <Show when={tab === "completed"}>
            You have completed a total of {completed.length} todo{ completed.length > 1 ? "s" : ""}.
          </Show>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col space-y-1 items-center overflow-hidden">
        <Show when={tab === "all"}>
          <For each={todos}> 
            <TodoItem item="todo" />
          </For>
        </Show>
        <Show when={tab === "completed"}>
          <For each={completed}> 
            <TodoItem item="todo" />
          </For>
        </Show>
      </CardContent>
      <CardFooter className="text-gray-400 dark:text-zinc-400 text-sm my-1 p-1 text-center w-full flex items-center justify-center">
        Double click to remove todo.
      </CardFooter>
    </Card>
  )
}


// using rc-extended's runtime magic, typescript will yell at us that's why are using type `any`
function TodoItem({ todo, index }: any) {
  const { todos, addTodo, removeTodo, state } = useTodos()
  
  function onCheckedChange(value: boolean) {
    const index = todos.findIndex(i => i.id === todo.id)
    
    if (index > -1) {
      todos[index].completed = value
      state.todos = [...todos]
      
      toast({
        variant: value ? "success" : "destructive",
        description: value ? "Todo completed hurray 🥳." : "Todo reverted back to incomplete",
        action: !value && <Button onClick={() => onCheckedChange(!value)} variant="destructive" className="whitespace-nowrap border border-white hover:border-0 hover:bg-red-600">Undo</Button>
      })
    }
  }
  
  return (
    <div onClick={(event) => {
      if (event.detail === 2) {
        removeTodo(todo.id)
      }
    }} key={todo.id} className={cn("border dark:border-zinc-800 p-1 rounded-md flex flex-row justify-between items-center space-x-1 min-w-full animate-in slide-in-from-right duration-300", index > 1 ? "delay-100" : "delay-75")}>
      <p className="font-medium dark:text-zinc-200 text-gray-600 text-sm leading-tight p-1">{todo.task}</p>
      <Toggle onCheckedChange={onCheckedChange} checked={todo.completed} />
    </div>
  )
}

export function TodoApp() {
  const { addTodo, handleInputChange, input, total } = useTodos()
  const setView = useSignalAction($view)
  
  const length = input.length

  return (
    <Card className="w-full border-0 rounded-none">
      <CardHeader>
        <CardTitle className="text-3xl">Todos</CardTitle>
        <CardDescription>You have a total of {total} todos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Card>
        <CardHeader>
          <CardTitle>
            Add Todo
          </CardTitle>
        </CardHeader>
          <CardContent>
            <form onSubmit={addTodo}>
              <div className="m-0">
                <Input type="text" placeholder="I have to..." className="focus-visible:ring-offset-0 text-md" value={input} onChange={handleInputChange} />
                <p className={cn("tracking-tight text-sm text-zinc-400 ml-1 mt-1", length > 100 ? "text-red-500 font-medium" : "")}>{length}/100</p>
              </div>
              <Button disabled={(length > 100) || length < 1} type="submit" className="w-full mt-3">
                <p className="mr-2">Add Todo</p>
                <PlusSquare size={20} strokeWidth={1.25} absoluteStrokeWidth />
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="border dark:border-zinc-800 rounded-md p-4 mt-3 shadow-sm">
          <Tab />
        </div>
      </CardContent>
      <CardFooter className="text-center text-sm dark:text-zinc-400 text-black w-full flex flex-col items-center justify-center italic space-y-2">
        <Button onClick={() => setView(() => "signals")} variant="outline">Try With Signals.</Button>
        <p>Built by <a rel="_blank" href="https://judeadeniji.github.io" className="underline italic">Apex - TheLazyDev</a>, 2023.</p>
      </CardFooter>
    </Card>
  )
}