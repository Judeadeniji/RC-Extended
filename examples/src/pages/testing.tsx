import React from "react"
import {$computed, $signal, $watch, Signal, useSignal, useSignalAction} from "rc-extended/src/store"
import { For, ForChildComponentProps  } from "rc-extended"

type TPerson = {
    name: string
}

function List ({ item, index}: ForChildComponentProps<TPerson> & {index?: number}) {
    return <p key={index}>{item?.name}</p>
}

export default function Test() {
    const listSignal = $signal<TPerson[]>([
      {
        name: "Jude"
      }
    ])

    const john = $computed<TPerson>(() => {
      return {
        name: "John"
      }
    })


    $watch(listSignal, (person) => {
      console.log(person[0])

      return () => undefined 
    })
    
    return <>
    {john.name}
      <For $each={listSignal}>

        <List />
   
      </For>
    </>
}