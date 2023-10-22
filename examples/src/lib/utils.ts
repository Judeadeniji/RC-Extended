import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 import { defineStore, signal } from "rc-extended/store"
import { toast } from "@/components/ui/use-toast"
import { ToastAction, ToastActionElement } from "@/components/ui/toast"
 import React from "react"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// maintain a global view state
export const $view = signal<"signals" | "stores">("signals")

interface Todo {
  id: string | number | symbol;
  task: string;
  completed: true | false;
}

type State = {
  todos: Todo[],
  input: string,
  tab: "all" | "completed"
}

export const useTodos = defineStore("todos", {
  state: (): State => ({
    todos: [
      {
        id: crypto.randomUUID(),
        task: "Learn RC-Extended stores module and signal",
        completed: true 
      },
      {
        id: crypto.randomUUID(),
        task: "Build A fully functional React app with shadcn ui and RC-Extended",
        completed: true 
      },
    ],
    input: "",
    tab: "all"
  }),
  computed: {
    total(this: State) {
      return this.todos.length
    },
    completed(this: State) {
      return this.todos.filter(i => i.completed)
    },
  },
  actions: {
    addTodo(this: State, _, e) {
      e.preventDefault();
      const task = this.input;
      this.input = ""
      if (task.trim() === "") return;
      this.todos = [{ id: crypto.randomUUID(),  task, completed: false }, ...this.todos];
      toast({
        variant: "success",
        description: "Todo added successfully. 🎉",
      })
    },
    removeTodo(this: State, _, id) {
      const index = this.todos.findIndex(t => t.id === id)
      if (index > -1) {
        const prev = [...this.todos]
        this.todos.splice(index, 1)
        this.todos = [...this.todos]
        toast({
          variant: "destructive",
          description: "Todo deleted.",
          action: React.createElement(ToastAction, {
            className: "border bg-red-500 dark:bg-red-900 hover:bg-red-700 hover:border-0",
            onClick: () => {
              this.todos = prev
            },
            altText: "Undo"
          }, "Undo") as unknown as ToastActionElement
        })
      }
    },
    
    // using with arrow functions
    handleInputChange: (state, e) => {
      const text = e.target.value
      
      if (state.input.length > 99 && (state.input.length < text.length)) return;
      
      state.input = text
    },
    switchTab(this: State, _, value) {
      this.tab = value 
    }
  },
  // we can also run effects
  effects: {
    // an effect that runs when state.todos changes
    todosEff(this: State) {
      console.log("todos was mutated", this.todos)
      
      return () => {}
    },
    // an effect that runs when state.tab changes
    tabsEff(this: State) {
      console.log("tabs was changed to ", this.tab)
      return () => {}
    },
  }
})