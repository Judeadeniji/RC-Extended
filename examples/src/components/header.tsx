import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  return (
    <header className="border-b dark:border-gray-600 dark:text-white px-3 py-2 w-full flex flex-row items-center justify-between bg-white dark:bg-black bg-opacity-80 backdrop-blur sticky top-0 left-0 right-0">
      <h1 className="text-md font-bold">RC-Extended</h1>
      <h1 className="text-md font-bold">To-do App</h1>
      <ModeToggle />
    </header>
  )
}