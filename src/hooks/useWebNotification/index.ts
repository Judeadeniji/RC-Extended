import { useCallback, useEffect } from "react"
import { $signal } from "../../store"

function useWebNotification() {
  const permission = $signal(Notification.permission)
  const title = $signal("")
  const options = $signal<NotificationOptions>({})
  const notification = $signal<Notification | null>(null)
  const error = $signal<Error | null>(null)

  const requestPermission = useCallback(async () => {
    try {
      const webPermission = await Notification.requestPermission()
      permission.set(webPermission)
    } catch (err) {
      error.set(err)
    }
  }, [])

  const createNotification = useCallback(() => {
    if (permission.value === "granted") {
      try {
        const webNotification = new Notification(title.value, options.value)
        notification.set(webNotification)
      } catch (err) {
        error.set(err)
      }
    }
  }, [permission.peek(), title.peek(), options.peek()])

  useEffect(() => {
    if (permission.value === "granted") {
      createNotification()
    }
  }, [permission.peek(), createNotification])

  return {
    permission,
    title,
    options,
    notification,
    error,
    requestPermission,
  }
}

export { useWebNotification }