import { $signal } from "../../store"

/**
 * Reactive mediaDevices.getDisplayMedia streaming.
 * @example ```tsx
 * const { stream, error, start, stop } = useDisplayMedia({
 *  video: {
 *   displaySurface: "application" | "browser" | "monitor" | "window",
 *   width: number | { ideal: number, max: number, min: number },
 *   height: number | { ideal: number, max: number, min: number },
 *   frameRate: number | { ideal: number, max: number, min: number },
 *   aspectRatio: number | { ideal: number, max: number, min: number },
 *   facingMode: "environment" | "user" | "left" | "right",
*   })
 * 
 * <video src={stream.value} autoPlay />
 * <button onClick={start}>Start</button>
 * <button onClick={stop}>Stop</button>
 * ```
 * @description A `MediaStream` object representing a display or portion of a display sharing the screen contents of a user's display device. This is useful for creating a video stream for a game or video player. The video stream can be captured using the `MediaStream Recording API` and then sent to a `PeerConnection` object for streaming.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
 * @param options - A `MediaStreamConstraints` object specifying the types of media to request, along with any requirements for each type. The default is `{ video: true }`.
 * @returns { stream, error, start, stop } - `stream` is a `Signal` of type `MediaStream | undefined` that represents the current stream. `error` is a `Signal` of type `Error | undefined` that represents the current error. `start` is a function that starts streaming. `stop` is a function that stops streaming.
 */
function useDisplayMedia(
    options?: DisplayOptions,
) {
    const stream = $signal<MediaStream | undefined>(undefined)
    const error = $signal<Error | undefined>(undefined)

    async function start() {
        try {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia(options)
            stream.set(mediaStream)
            error.set(undefined)

            return stop
        } catch (err) {
            error.set(err)
        }
    }

    async function stop() {
        if (stream.value) {
            stream.value.getTracks().forEach((track: { stop: () => any }) => track.stop())
            stream.set(undefined)
        }

        return start
    }

    return {
        stream,
        error,
        start,
        stop
    }
}

type DisplayOptions = MediaStreamConstraints

export { useDisplayMedia, type DisplayOptions }