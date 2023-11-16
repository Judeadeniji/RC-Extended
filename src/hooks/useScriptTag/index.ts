import { SignalRefObject, signalRef } from "../../functions";
import { Signal } from "../../store";
import { ConfigurableDocument, defaultDocument } from "../../utils";
import { beforeMount } from "../useLifeCycle";

/**
 * useScriptTag hook, A hook to use the script tag API
 * @example ```tsx
import { useScriptTag } from 'rc-extended/use'
useScriptTag('https://player.twitch.tv/js/embed/v1.js',
// on script tag loaded.
(el: HTMLScriptElement) => {
// do something
})
```
 * @see {https} ://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
 * @description The script tag API is not supported in all browsers. Check the compatibility table on MDN.
 * @template T
 * @param {string} src - The script tag src
 * @param {(el: HTMLScriptElement) => void} [options.onload] - The onload callback
 * @param {ConfigurableDocument} [options.config] - The configurable document
 * @returns {} - The script tag
 */
function useScriptTag(src: string, options?: { manual: boolean; onload?: (el: HTMLScriptElement) => void; config?: ConfigurableDocument }): { scriptTag: SignalRefObject<HTMLScriptElement>; load: () => void; unload: () => void; isLoaded: Signal<boolean> }
function useScriptTag(src: string,  options?:  { manual: boolean; onload?: (el: HTMLScriptElement) => void; config?: ConfigurableDocument }): { scriptTag: SignalRefObject<HTMLScriptElement> } | { scriptTag: SignalRefObject<HTMLScriptElement>; load: () => void; unload: () => void; isLoaded: Signal<boolean>; } {
    const {
        onload,
        config,
        manual
    } = options ?? {};
    const document = config?.document ?? defaultDocument;
    const scriptTag = signalRef(null);
    const isLoaded = signalRef(false);
    beforeMount(() => {
        if (document) {
            const el = document.createElement('script');
            el.type = 'text/javascript';
            el.async = true;
            el.setAttribute('rc-script', '');
            el.src = src;
            el.onload = () => {
                if (onload) {
                    onload(el);
                }
            };
            document.body.appendChild(el);
            scriptTag.set(el);
            isLoaded.set(true);
        }
    }, [document, src, onload, scriptTag]);

    if (manual === true) {
        function load() {
            if (scriptTag.value) {
                scriptTag.value.src = src;
                isLoaded.set(true);
            }
        }

        function unload() {
            if (scriptTag.value) {
                scriptTag.value.src = '';
                isLoaded.set(false);
            }
        }

        return {
            scriptTag,
            load,
            unload,
            isLoaded
        };
    }

    return { scriptTag, isLoaded };
}

export { useScriptTag };