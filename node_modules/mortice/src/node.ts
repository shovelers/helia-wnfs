import { nanoid } from 'nanoid'
import {
  WORKER_REQUEST_READ_LOCK,
  WORKER_RELEASE_READ_LOCK,
  MASTER_GRANT_READ_LOCK,
  WORKER_REQUEST_WRITE_LOCK,
  WORKER_RELEASE_WRITE_LOCK,
  MASTER_GRANT_WRITE_LOCK
} from './constants.js'
import type { MorticeImplementation, MorticeOptions, Release } from './index.js'
import cluster from 'cluster'
import type { Worker } from 'cluster'

interface RequestEvent {
  type: string
  identifier: string
  name: string
}

const handleWorkerLockRequest = (emitter: EventTarget, masterEvent: string, requestType: string, releaseType: string, grantType: string) => {
  return (worker: Worker, requestEvent: RequestEvent) => {
    if (requestEvent != null && requestEvent.type === requestType) {
      emitter.dispatchEvent(new MessageEvent(masterEvent, {
        data: {
          name: requestEvent.name,
          handler: async () => {
            // grant lock to worker
            worker.send({
              type: grantType,
              name: requestEvent.name,
              identifier: requestEvent.identifier
            })

            // wait for worker to finish
            return await new Promise<void>((resolve) => {
              const releaseEventListener = (releaseEvent: RequestEvent) => {
                if (releaseEvent.type === releaseType && releaseEvent.identifier === requestEvent.identifier) {
                  worker.removeListener('message', releaseEventListener)
                  resolve()
                }
              }

              worker.on('message', releaseEventListener)
            })
          }
        }
      }))
    }
  }
}

const makeWorkerLockRequest = (name: string, requestType: string, grantType: string, releaseType: string) => {
  return async () => {
    const id = nanoid()

    if (process.send == null) {
      throw new Error('No send method on process - are we a cluster worker?')
    }

    process.send({
      type: requestType,
      identifier: id,
      name
    })

    return await new Promise<Release>((resolve) => {
      const listener = (event: RequestEvent) => {
        if (event.type === grantType && event.identifier === id) {
          process.removeListener('message', listener)

          // grant lock
          resolve(() => {
            if (process.send == null) {
              throw new Error('No send method on process - are we a cluster worker?')
            }

            // release lock
            process.send({
              type: releaseType,
              identifier: id,
              name
            })
          })
        }
      }

      process.on('message', listener)
    })
  }
}

export default (options: Required<MorticeOptions>): MorticeImplementation | EventTarget | undefined => {
  if (cluster.isPrimary || options.singleProcess) {
    const emitter = new EventTarget()

    cluster.on('message', handleWorkerLockRequest(emitter, 'requestReadLock', WORKER_REQUEST_READ_LOCK, WORKER_RELEASE_READ_LOCK, MASTER_GRANT_READ_LOCK))
    cluster.on('message', handleWorkerLockRequest(emitter, 'requestWriteLock', WORKER_REQUEST_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK))

    return emitter
  }

  return {
    isWorker: true,
    readLock: (name) => makeWorkerLockRequest(name, WORKER_REQUEST_READ_LOCK, MASTER_GRANT_READ_LOCK, WORKER_RELEASE_READ_LOCK),
    writeLock: (name) => makeWorkerLockRequest(name, WORKER_REQUEST_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK)
  }
}
