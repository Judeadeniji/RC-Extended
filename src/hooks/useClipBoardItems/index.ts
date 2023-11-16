import { useEffect } from 'react';
import { useSupported } from '../useSupported';
import { $signal, ReadonlySignal } from '../../store';


function useClipBoardItems() {
    const clipboardItems = $signal<string[]>([]);
    const isSupported = useSupported(() => {
        return !!navigator.clipboard;
    });

    useEffect(() => {
        const handleCopy = (event: ClipboardEvent) => {
            const clipboardData = event.clipboardData;
            if (clipboardData) {
                const pastedItems = clipboardData.items;
                const pastedTextItems: string[] = [];
                for (let i = 0; i < pastedItems.length; i++) {
                    const item = pastedItems[i];
                    if (item.type === 'text/plain') {
                        item.getAsString((text: string) => {
                            pastedTextItems.push(text);
                            clipboardItems.set(pastedTextItems);
                        });
                    } else if (item.type === 'text/html') {
                        item.getAsString((html: string) => {
                            pastedTextItems.push(html);
                            clipboardItems.set(pastedTextItems);
                        });
                    }
                }
            }
        };
    
        document.addEventListener('copy', handleCopy);
    
        return () => {
            document.removeEventListener('copy', handleCopy);
        };
    }, []);
    
    return {
        items: clipboardItems as ReadonlySignal<string[]>,
        isSupported,
    };
}

export { useClipBoardItems };