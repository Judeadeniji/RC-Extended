import { useEffect } from "react"
import { $signal } from "../../store"

function usePreferredSpeech() {
  const speech = $signal({
    speechSynthesis: false,
    speechRecognition: false,
  })
  useEffect(() => {
    if (typeof window === "undefined") return
    if ("speechSynthesis" in window) {
      speech.update((s) => ({ ...s, speechSynthesis: true }))
    }
    if ("SpeechRecognition" in window) {
      speech.update((s) => ({ ...s, speechRecognition: true }))
    }
  }, [])
  return speech
}

export { usePreferredSpeech }