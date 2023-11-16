import { useEffect } from "react"
import { $signal } from "../../store"

function useElementVisibility(
  element: HTMLElement | null,
  options: IntersectionObserverInit = {}
) {
  const isVisible = $signal(false)

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      isVisible.set(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return isVisible
}

export { useElementVisibility }