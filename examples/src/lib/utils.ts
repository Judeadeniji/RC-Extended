import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 import { defineStore, signal } from "rc-extended/store"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
 import React from "react"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// maintain a global view state
export const $view = signal<"signals" | "stores">("signals")

export const useTodos = defineStore("todos", {
  state: () => ({
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
    total() {
      return this.todos.length
    },
    completed() {
      return this.todos.filter(i => i.completed)
    },
  },
  actions: {
    addTodo(_, e) {
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
    removeTodo(_, id) {
      const index = this.todos.findIndex(t => t.id === id)
      if (index > -1) {
        const todo = this.todos[index]
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
          }, "Undo")
        })
      }
    },
    
    // using with arrow functions
    handleInputChange: (state, e) => {
      const text = e.target.value
      
      if (state.input.length > 99 && (state.input.length < text.length)) return;
      
      state.input = text
    },
    switchTab(_, value) {
      this.tab = value 
    }
  },
  // we can also run effects
  effects: {
    // an effect that runs when state.todos changes
    todosEff() {
      console.log("todos was mutated", this.todos)
    },
    // an effect that runs when state.tab changes
    tabsEff() {
      console.log("tabs was changed to ", this.tabs)
    },
  }
})