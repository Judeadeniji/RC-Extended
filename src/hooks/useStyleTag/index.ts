import { signalRef } from "../../functions";
import { Signal, $signal, $computed, $watch } from "../../store";
import { defaultDocument } from "../../utils";
import { beforeMount, onUnmount } from "../useLifeCycle";

/*
Provide a CSS string, then useStyleTag will automatically generate an id and inject it in <head>.

js
import { useStyleTag } from 'rc-extended/use'

const {
  id,
  css,
  load,
  unload,
  isLoaded,
} = useStyleTag('.foo { margin-top: 32px; }')

// Later you can modify styles
css.value = '.foo { margin-top: 64px; }'
This code will be injected to <head>:

html
<style id="rc_extended_styletag_1">
.foo { margin-top: 64px; }
</style>
Custom ID
If you need to define your own id, you can pass id as first argument.

js
import { useStyleTag } from 'rc-extended/use'

useStyleTag('.foo { margin-top: 32px; }', { id: 'custom-id' })
html
<!-- injected to <head> -->
<style id="custom-id">
.foo { margin-top: 32px; }
</style>
Media query
You can pass media attributes as last argument within object.

js
useStyleTag('.foo { margin-top: 32px; }', { media: 'print' })
html
<!-- injected to <head> -->
<style id="rc_extended_styletag_1" media="print">
.foo { margin-top: 32px; }
</style>

*/
function useStyleTag(css: string, options?: { id?: string; media?: string; manual?: boolean }) {
    const {
        id,
        media,
        manual
    } = options ?? {};
    const styleTag = $signal<HTMLStyleElement | null>(null);
    const isLoaded = $signal(false);
    const styleId = $computed(() => styleTag.value?.id ?? id ?? `rc_extended_styletag_${Math.random().toString(36).substr(2, 9)}`);
    const styleCss = $signal(css);
    beforeMount(() => {
        const el = document.getElementById(styleId.value) as HTMLStyleElement || defaultDocument.createElement('style');
        el.type = 'text/css';
        el.setAttribute('rc-styletag', '');
        el.id = styleId.value;
        el.media = media ?? 'screen';
        el.innerHTML = ''
        el.appendChild(defaultDocument.createTextNode(styleCss.value));
        !document.getElementById(styleId.value) ? defaultDocument.head.appendChild(el) : null;
        styleTag.set(el);
        isLoaded.set(true);
    }, []);

    $watch(styleCss, v => {
        styleTag.value.innerHTML = ''
        styleTag.value.appendChild(defaultDocument.createTextNode(v));
    })

    onUnmount(unload)

    function load() {
        if (styleTag.value) {
            styleTag.value.innerHTML = ''
            styleTag.value.appendChild(defaultDocument.createTextNode(styleCss.value));

        }
    }

    function unload() {
        if (styleTag.value) {
            defaultDocument.head.removeChild(styleTag.value)
            styleTag.value.innerHTML = '';
        }
    }

    if (manual === true) {
        return {
            id: styleId,
            css: styleCss,
            load,
            unload,
            isLoaded
        };
    }
    return {
        id: styleId,
        css: styleCss,
        isLoaded,
        unload
    };
}

export {
    useStyleTag
}