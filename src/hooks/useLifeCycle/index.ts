// lifecycle functions for react functional components

import { useEffect, useLayoutEffect } from "react"

// Path: src/hooks/useLifeCycle/index.ts

function onMount(cb: () => (void | (() => void))) {
    useEffect(cb, [])
}

function onUnmount(cb: () => void) {
    useEffect(() => cb, [])
}

function beforeMount(cb: () => any, deps: any[] = []) {
    useLayoutEffect(cb, deps)
}

function beforeUnmount(cb: () => void) {
    useLayoutEffect(() => cb, [])
}

function onUpdate(cb: () => void) {
    useEffect(cb)
}

export {
    onMount,
    onUnmount,
    beforeMount,
    beforeUnmount,
    onUpdate
}