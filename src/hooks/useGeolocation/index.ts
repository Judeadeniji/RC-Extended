import { useEffect } from "react"
import { $signal } from "../../store"
import { useSupported } from "../useSupported"

function useGeolocation() {
  const state = $signal({
    loading: true,
    error: null,
    data: null,
  })

  const isSupported = useSupported(() => {
    return !!navigator.geolocation
    })
  useEffect(() => {
    if (!isSupported.value) {
      state.set({
        loading: false,
        error: new Error("GEOLOCATION_NOT_SUPPORTED"),
        data: null,
      })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.set({
          loading: false,
          error: null,
          data: position,
        })
      },
      (error) => {
        state.set({
          loading: false,
          error,
          data: null,
        })
      }
    )
  }, [])
  return state
}

export { useGeolocation }