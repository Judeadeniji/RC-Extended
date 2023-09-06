import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useStore, useActions, signal, useSignalValue, useSignalAction, useComputedSignal } from "rc-extended/store"
import { counter } from "./store"

const countSignal = signal(0)


function App() {
  try {
  //let { count, getQuadruple } = counter();
  // let { increment } = useActions(counter());
  const setCount = useSignalAction(countSignal)
  const count = useSignalValue(countSignal)
  const double = useComputedSignal(countSignal, count => count * 2)
alert(double())
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
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(c => c + 1)}>
          count is {count}
        </button>
        
        <Button />
        
        <button disabled>
          quadruple count is {double}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
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

function Button() {
  const count = useSignalValue(countSignal)
  return (
    <>
    <button disabled>
      Doubled count is {count * 2}
    </button>
    </>
  )
}

export default App
