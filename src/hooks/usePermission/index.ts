import type { Signal } from '../../store'
import { signal } from '../../store'
import { useEventListener } from '../useEventListener'
import type { ConfigurableNavigator } from '../../utils'
import { defaultNavigator } from '../../utils'
import { useSupported } from '../useSupported'

type DescriptorNamePolyfill =
  'accelerometer' |
  'accessibility-events' |
  'ambient-light-sensor' |
  'background-sync' |
  'camera' |
  'clipboard-read' |
  'clipboard-write' |
  'gyroscope' |
  'magnetometer' |
  'microphone' |
  'notifications' |
  'payment-handler' |
  'persistent-storage' |
  'push' |
  'speaker'

export type GeneralPermissionDescriptor =
  | PermissionDescriptor
  | { name: DescriptorNamePolyfill }

export interface UsePermissionOptions<Controls extends boolean> extends ConfigurableNavigator {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
}

export type UsePermissionReturn = Readonly<Signal<PermissionState | undefined>>
export interface UsePermissionReturnWithControls {
  state: UsePermissionReturn
  isSupported: Signal<boolean>
  query: () => Promise<PermissionStatus | undefined>
}

/**
 * Reactive Permissions API.
 *
 * @see https://rc-extended/usePermission
 */
export function usePermission(
  permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'],
  options?: UsePermissionOptions<false>
): UsePermissionReturn
export function usePermission(
  permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<true>,
): UsePermissionReturnWithControls
export function usePermission(
  permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<boolean> = {},
): UsePermissionReturn | UsePermissionReturnWithControls {
  const {
    controls = false,
    navigator = defaultNavigator,
  } = options

  const isSupported = useSupported(() => navigator && 'permissions' in navigator)
  let permissionStatus: PermissionStatus | undefined

  const desc = typeof permissionDesc === 'string'
    ? { name: permissionDesc } as PermissionDescriptor
    : permissionDesc as PermissionDescriptor
  const state = signal<PermissionState | undefined>("prompt")

  const onChange = () => {
    if (permissionStatus)
      state.value = permissionStatus.state
  }

  const query = createSingletonPromise(async () => {
    if (!isSupported.value)
      return
    if (!permissionStatus) {
      try {
        permissionStatus = await navigator!.permissions.query(desc)
        useEventListener(permissionStatus, 'change', onChange)
        onChange()
      }
      catch {
        state.value = 'prompt'
      }
    }
    return permissionStatus
  })

  query()

  if (controls) {
    return {
      state: state as UsePermissionReturn,
      isSupported,
      query,
    }
  }
  else {
    return state as UsePermissionReturn
  }
}

function createSingletonPromise(fn: () => Promise<PermissionStatus>) {
    let promise: Promise<PermissionStatus> | undefined
    
    return () => {
        if (!promise)
        promise = fn()
        return promise
    }
}