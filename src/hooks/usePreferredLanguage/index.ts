import { useEffect } from "react"
import { $signal } from "../../store"

function usePreferredLanguage() {
  const language = $signal(
    window.navigator.language || window.navigator.languages[0]
  )
  useEffect(() => {
    const handler = () => {
      language.set(window.navigator.language || window.navigator.languages[0])
    }
    window.addEventListener("languagechange", handler)
    return () => {
      window.removeEventListener("languagechange", handler)
    }
  }, [])
  return language
}


export { usePreferredLanguage }