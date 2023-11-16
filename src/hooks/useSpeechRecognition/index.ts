import { useCallback, useEffect } from "react";
import { $signal } from "../../store";
import { useSupported } from "../useSupported";

function useSpeechRecognition(options: {
  onInterimTranscript?: (value: string) => void;
  onFinalTranscript?: (value: string) => void;
  onError?: (value: Error) => void;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  grammars?: SpeechGrammarList | null;
  serviceURI?: string;
} = {}) {
  const listening = $signal(false);
  const interimTranscript = $signal("");
  const finalTranscript = $signal("");
  const error = $signal(null);
  const isSupported = useSupported(
    () => "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  );

  let recognition: SpeechRecognition | null = null;

  const startRecognition = useCallback(() => {
    if (isSupported) {
      recognition = new (window.SpeechRecognition ||
        (window as any).webkitSpeechRecognition)();

      recognition.lang = options.lang || "en-US";
      recognition.continuous = options.continuous || false;
      recognition.interimResults = options.interimResults || false;
      recognition.maxAlternatives = options.maxAlternatives || 1;
      recognition.grammars = options.grammars || null;
      recognition.serviceURI = options.serviceURI || "";

      recognition.onstart = () => {
        listening.set(true);
      };

      recognition.onend = () => {
        listening.set(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const interimTranscripts: string[] = [];
        const finalTranscripts: string[] = [];

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscripts.push(transcript);
          } else {
            interimTranscripts.push(transcript);
          }
        }

        if (options.onInterimTranscript && interimTranscripts.length > 0) {
          interimTranscript.set(interimTranscripts.join(" "));
          options.onInterimTranscript(interimTranscripts.join(" "));
        }

        if (options.onFinalTranscript && finalTranscripts.length > 0) {
          finalTranscript.set(finalTranscripts.join(" "));
          options.onFinalTranscript(finalTranscripts.join(" "));
        }
      };

      recognition.onerror = (event: ErrorEvent) => {
        error.set(new Error(event.error));
        if (options.onError) {
          options.onError(new Error(event.error));
        }
      };

      recognition.start();
    }
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const abortRecognition = useCallback(() => {
    if (recognition) {
      recognition.abort();
    }
  }, [recognition]);

  const clearTranscript = useCallback(() => {
    interimTranscript.set("");
    finalTranscript.set("");
  }, [interimTranscript, finalTranscript]);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  return {
    listening,
    interimTranscript,
    finalTranscript,
    error,
    isSupported,
    startRecognition,
    stopRecognition,
    abortRecognition,
    clearTranscript,
  };
}

export { useSpeechRecognition };
