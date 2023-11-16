import { useEffect } from "react";
import { $signal, $watch, Signal } from '../../store';
import type { MaybeSignal } from "../../utils";
import { toValue } from "../../functions";

export interface Serializer<T> {
  read(raw: string): T;
  write(value: T): string;
}

export interface UseStorageOptions<T> {
  deep?: MaybeSignal<boolean>;
  listenToStorageChanges?: MaybeSignal<boolean>;
  writeDefaults?: MaybeSignal<boolean>;
  mergeDefaults?: MaybeSignal<boolean> | ((storageValue: T, defaults: T) => T);
  serializer?: Serializer<T>;
  onError?: (error: unknown) => void;
}

export function useStorage<T>(
  key: string,
  defaults: MaybeSignal<T> | null,
  storage: Storage | null = localStorage,
  options: UseStorageOptions<T> = {}
) {
  const {
    deep = true,
    listenToStorageChanges = true,
    writeDefaults = true,
    mergeDefaults = false,
    onError = (e) => {
      console.error(e);
    },
  } = options;

  const shallow = !deep;
  
  const storageInit = storage.getItem(key);
  
  const rawInit: T = storageInit ? (options.serializer?.read ? options.serializer.read(storage.getItem(key)) : JSON.parse(storage.getItem(key))) : toValue(defaults);

  const data = $signal(rawInit);

  function write(v: T) {
    try {
      if (v == null) {
        storage.removeItem(key);
      } else {
        const serialized = options.serializer?.write
          ? options.serializer.write(v)
          : JSON.stringify(v);
        const oldValue = storage.getItem(key);
        if (oldValue !== serialized) {
          storage.setItem(key, serialized);


          // send custom event to communicate within the same page
          if (listenToStorageChanges) {
            const event = new CustomEvent('storage', {
              detail: {
                key,
                oldValue,
                newValue: serialized,
                storageArea: storage,
              },
            });
            window.dispatchEvent(event);
          }
        }
      }
    } catch (e) {
      onError(e);
    }
  }

  function read(event?: StorageEvent) {
    const rawValue = event ? event.newValue : storage.getItem(key);

    if (rawValue == null) {
      if (writeDefaults && defaults !== null) {
        storage.setItem(key, options?.serializer?.write ? options.serializer.write(rawInit) : JSON.stringify(rawInit));
      }
      return rawInit;
    } else if (!event && mergeDefaults) {
      const value = options?.serializer?.read ? options.serializer.read(rawValue) : JSON.parse(rawValue);
      if (typeof mergeDefaults === 'function') {
        return mergeDefaults(value, rawInit);
      } else if (typeof rawInit === 'object' && !Array.isArray(rawInit)) {
        return { ...rawInit, ...value };
      }
      return value;
    } else if (typeof rawValue !== 'string') {
      return rawValue;
    } else {
      return options.serializer?.read ? options.serializer.read(rawValue) : JSON.parse(rawValue);
    }
  }

  function updateFromCustomEvent(event: CustomEvent) {
    update(event.detail);
  }

  function update(event?: StorageEvent) {
    if (event && event.storageArea !== storage) return;

    if (event && event.key == null) {
      data.value = read(event);
      return;
    }

    if (event && event.key !== key) return;

    try {
      if (event?.newValue !== (options.serializer?.write ? options.serializer.write(data.value) : JSON.stringify(data.value))) {
        data.value = read(event);
      }
    } catch (e) {
      onError(e);
    }
  }

  $watch(data, (newValue, oldValue) =>  newValue !== oldValue && write(newValue));

  useEffect(() => {
    if (storage) {
      if (listenToStorageChanges) {
        window.addEventListener('storage', update);
        window.addEventListener('storage', updateFromCustomEvent);

        return;
      }

      update();
    }

    return () => {
      if (listenToStorageChanges) {
        window.removeEventListener('storage', update);
        window.removeEventListener('storage', updateFromCustomEvent);
      }
    };
  }, [key]);

  return {
    get value() {
      return options.serializer?.read ? options.serializer.read(storage.getItem(key)) : JSON.parse(storage.getItem(key));
    },
    set value(value: T) {
      data.value = value;
    },
    get subscribe() {
      return data.subscribe;
    },
    get peek() {
      return data.peek;
    }
  } as Signal<T>;
}
