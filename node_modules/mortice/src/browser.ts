import { nanoid } from 'nanoid'
import {
  WORKER_REQUEST_READ_LOCK,
  WORKER_RELEASE_READ_LOCK,
  MASTER_GRANT_READ_LOCK,
  WORKER_REQUEST_WRITE_LOCK,
  WORKER_RELEASE_WRITE_LOCK,
  MASTER_GRANT_WRITE_LOCK
} from './constants.js'
import observer from 'observable-webworkers'
import type { MorticeImplementation, MorticeOptions, Release } from './index.js'

const handleWorkerLockRequest = (emitter: EventTarget, masterEvent: string, requestType: string, releaseType: string, grantType: string) => {
  return (worker: Worker, event: MessageEvent) => {
    if (event.data.type !== requestType) {
      return
    }

    const requestEvent = {
      type: event.data.type,
      name: event.data.name,
      identifier: event.data.identifier
    }

    emitter.dispatchEvent(new MessageEvent(masterEvent, {
      data: {
        name: requestEvent.name,
        handler: async (): Promise<void> => {
          // grant lock to worker
          worker.postMessage({
            type: grantType,
            name: requestEvent.name,
            identifier: requestEvent.identifier
          })

          // wait for worker to finish
          return await new Promise<void>((resolve) => {
            const releaseEventListener = (event: MessageEvent) => {
              if (event == null || event.data == null) {
                return
              }

              const releaseEvent = {
                type: event.data.type,
                name: event.data.name,
                identifier: event.data.identifier
              }

              if (releaseEvent.type === releaseType && releaseEvent.identifier === requestEvent.identifier) {
                worker.removeEventListener('message', releaseEventListener)
                resolve()
              }
            }

            worker.addEventListener('message', releaseEventListener)
          })
        }
      }
    }))
  }
}

const makeWorkerLockRequest = (name: string, requestType: string, grantType: string, releaseType: string) => {
  return async () => {
    const id = nanoid()

    globalThis.postMessage({
      type: requestType,
      identifier: id,
      name
    })

    return await new Promise<Release>((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event == null || event.data == null) {
          return
        }

        const responseEvent = {
          type: event.data.type,
          identifier: event.data.identifier
        }

        if (responseEvent.type === grantType && responseEvent.identifier === id) {
          globalThis.removeEventListener('message', listener)

          // grant lock
          resolve(() => {
            // release lock
            globalThis.postMessage({
              type: releaseType,
              identifier: id,
              name
            })
          })
        }
      }

      globalThis.addEventListener('message', listener)
    })
  }
}

const defaultOptions = {
  singleProcess: false
}

export default (options: Required<MorticeOptions>): MorticeImplementation | EventTarget => {
  options = Object.assign({}, defaultOptions, options)
  const isPrimary = Boolean(globalThis.document) || options.singleProcess

  if (isPrimary) {
    const emitter = new EventTarget()

    observer.addEventListener('message', handleWorkerLockRequest(emitter, 'requestReadLock', WORKER_REQUEST_READ_LOCK, WORKER_RELEASE_READ_LOCK, MASTER_GRANT_READ_LOCK))
    observer.addEventListener('message', handleWorkerLockRequest(emitter, 'requestWriteLock', WORKER_REQUEST_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK))

    return emitter
  }

  return {
    isWorker: true,
    readLock: (name) => makeWorkerLockRequest(name, WORKER_REQUEST_READ_LOCK, MASTER_GRANT_READ_LOCK, WORKER_RELEASE_READ_LOCK),
    writeLock: (name) => makeWorkerLockRequest(name, WORKER_REQUEST_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK)
  }
}
