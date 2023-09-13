import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { For, useInterval } from "rc-extended"
import { signal, useSignalAction, batch } from "rc-extended/store"
import { counter } from "./store"

const reasons = signal([
  "React Sucks",
  "Even though it sucks, we can make it better.",
  "Back to number 1"
])


function App() {
  const addTodo = useSignalAction(reasons)
  useInterval(() => {
    batch(() => {
      reasons.value = ([...reasons.value, "Wow Next"])
    })
  }, 1500)
  try {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + RC-Extended</h1>
      <div className="card">
        <ol>
          <For $each={reasons}>
            {(item, index) => (
              <li key={index}>
                {item}
              </li>
            )}
          </For>
        </ol>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
  } catch (e) {
    alert (e.stack)
  }
}


export default App
