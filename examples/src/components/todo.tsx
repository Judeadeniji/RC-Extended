import { PlusSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { $signal, signal, useSignal, useSignalValue, useSignalAction, $computed } from "rc-extended/store"
import { Switch, Match, Show, For } from "rc-extended"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch as Toggle } from "@/components/ui/switch"
import { $view } from "@/lib/utils"
import { ToastAction, ToastActionElement } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"

interface Todos {
  id: string | number | symbol;
  task: string;
  completed: true | false;
}

// create a global signal as a source of truth
const tab = signal<"all" | "completed">("all")
const todos = signal<Todos[]>([
  {
    id: crypto.randomUUID(),
    task: "Learn RC-Extended stores module and signal",
    completed: false 
  },
  {
    id: crypto.randomUUID(),
    task: "Build A fully functional React app with shadcn ui and RC-Extended",
    completed: true 
  },
])

function Tab() {
  const value = useSignalValue(tab)
  return (
    <section>
      <TabHeader />
      <div className="my-3">
        <Switch>
          <Match when={value === "all"}>
            <TodoItems />
          </Match>
          <Match when={value === "completed"}>
            <TodoItems />
          </Match>
        </Switch>
      </div>
    </section>
  )
}

function TabHeader() {
  const [value, setValue] = useSignal(tab)
  return (
    <section className="rounded-md bg-gray-100 dark:bg-zinc-800 p-1 flex items-center flex-row w-full">
      <div onClick={() => setValue(() => "all")} className={cn("transition-colors duration-300 text-center font-medium text-md w-1/2 text-zinc-700 dark:text-zinc-400 py-1 rounded-md", value === "all" ? "shadow-sm bg-white dark:bg-black dark:text-white" : "bg-none")}>
        <p>All</p>
      </div>
      <div onClick={() => setValue(() => "completed")} className={cn("animate-in slide-in-from-left transition-colors duration-300 text-center font-medium text-md w-1/2 text-zinc-700 dark:text-zinc-400 py-1 rounded-md", value === "completed" ? "shadow-sm bg-white dark:bg-black dark:text-white" : "bg-none")}>
        <p>Completed</p>
      </div>
    </section>
  )
}

function TodoItems() {
  const value = useSignalValue(tab);
  const { total, uncompleted, completed } = $computed(() => {
    const t: Todos[] = todos.value
    const total = t.length
    const completed = t.filter(i => i.completed)
    const uncompleted = total - completed.length
    return {
      completed,
      uncompleted,
      total
    }
  })
  
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">
          <Show when={value === "all"}>
            All Todos
          </Show>
          <Show when={value === "completed"}>
            Completed Todos
          </Show>
        </CardTitle>
        <CardDescription>
          <Show when={value === "all"}>
            You have a total of {total} todos with {completed.length} completed and {uncompleted} incomplete.
          </Show>
          <Show when={value === "completed"}>
            You have completed a total of {completed.length} todo{ completed.length > 1 ? "s" : ""}.
          </Show>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col space-y-1 items-center">
        <Show when={value === "all"}>
        {/* I don't need a useSignal for `todos` because the For component maintains an internal state when a signal is passed into it*/}
          <For $each={todos}> 
            <TodoItem item="todo" />
          </For>
        </Show>
        <Show when={value === "completed"}>
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
function TodoItem({ todo }: any) {
  const [_todos, setTodos] = useSignal(todos)
  
  function onCheckedChange(value: boolean) {
    const index = _todos.findIndex(i => i.id === todo.id)
    
    if (index !== -1) {
      setTodos((todos = []) => {
        todos[index].completed = value
        return [...todos]
      })
      
      toast({
        variant: value ? "success" : "destructive",
        description: value ? "Todo completed hurray 🥳." : "Todo reverted back to incomplete",
        action: (!value && <ToastAction onClick={() => onCheckedChange(!value)} className="whitespace-nowrap border border-white hover:border-0 hover:bg-red-600" altText="Undo">Undo</ToastAction>) as ToastActionElement 
      })
    }
  }
  
  function removeTodo(id: string) {
      const index = _todos.findIndex(t => t.id === id)
      if (index > -1) {
        const prev = [..._todos]
        _todos.splice(index, 1)
        setTodos(() => [..._todos])
        toast({
          variant: "destructive",
          description: "Todo deleted.",
          action: <ToastAction className="border bg-red-500 dark:bg-red-900 hover:bg-red-700 hover:border-0" onClick={() => {
              setTodos(() => prev)
            }} altText="Undo">Undo</ToastAction>
        })
      }
  }
  
  return (
    <div onClick={(event) => {
      if (event.detail === 2) {
        removeTodo(todo.id)
      }
    }} key={todo.id} className="border dark:border-zinc-800 p-1 rounded-md flex flex-row justify-between items-center space-x-1 min-w-full animate-in slide-in-from-left duration-300">
      <p className="font-medium dark:text-zinc-200 text-gray-600 text-sm leading-tight p-1">{todo.task}</p>
      <Toggle onCheckedChange={onCheckedChange} checked={todo.completed} />
    </div>
  )
}

export function TodoApp() {
  const input = $signal<string>("")
  const [_todos, todoAction] = useSignal(todos)
  const setView = useSignalAction($view)
  const length = $computed(() => input.value.length)
  const all = $computed(() => todos.value.length)
  
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    
    if (length > 99 && (length < text.length)) return;
    
    input.value = text
  }

  function addTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const task = input.peek();
    input.value = ""
    if (task.trim() === "") return;
    const id = crypto.randomUUID()
    
    todoAction((todos) => [{ id, task, completed: false }, ...todos])
    toast({
      variant: "success",
      description: "Todo added successfully. 🎉",
      action: <ToastAction onClick={() => {
        const index = _todos.findIndex(t => t.id === id)
        if (index > -1) {
          const prev = [..._todos]
          _todos.splice(index, 1)
          todoAction(() => prev)
        }
      }} altText="Undo">Undo</ToastAction>
    })
  }
 
  return (
    <Card className="w-full border-0 rounded-none">
      <CardHeader>
        <CardTitle className="text-3xl">Todos</CardTitle>
        <CardDescription>You have a total of {all} todos.</CardDescription>
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
                <Input type="text" placeholder="I have to..." className="focus-visible:ring-offset-0 text-md" value={input.peek()} onChange={handleInputChange} />
                <p className={cn("tracking-tight text-sm text-zinc-400 ml-1 mt-1", length > 100 ? "text-red-500 font-medium" : "")}>{length}/100</p>
              </div>
              <Button disabled={(length > 100) || input.peek().length < 1} type="submit" className="w-full mt-3">
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
        <Button onClick={() => setView(() => "stores")} variant="outline">Try With Stores.</Button>
        <p>Built by <a rel="_blank" href="https://judeadeniji.github.io" className="underline italic">Apex - TheLazyDev</a>, 2023.</p>
      </CardFooter>
    </Card>
  )
}