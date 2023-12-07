import PQueue from 'p-queue'
import pTimeout from 'p-timeout'
import impl from './node.js'

export interface MorticeOptions {
  name?: string
  timeout?: number
  concurrency?: number
  singleProcess?: boolean
}

export interface Mortice {
  readLock: () => Promise<Release>
  writeLock: () => Promise<Release>
}

export interface Release {
  (): void
}

export interface MorticeImplementation {
  isWorker: boolean
  readLock: (name: string, options: MorticeOptions) => Mortice['readLock']
  writeLock: (name: string, options: MorticeOptions) => Mortice['writeLock']
}

const mutexes: Record<string, Mortice> = {}
let implementation: any

async function createReleaseable (queue: PQueue, options: Required<MorticeOptions>): Promise<Release> {
  let res: (release: Release) => void

  const p = new Promise<Release>((resolve) => {
    res = resolve
  })

  void queue.add(async () => await pTimeout((async () => {
    return await new Promise<void>((resolve) => {
      res(() => {
        resolve()
      })
    })
  })(), {
    milliseconds: options.timeout
  }))

  return await p
}

const createMutex = (name: string, options: Required<MorticeOptions>): Mortice => {
  if (implementation.isWorker === true) {
    return {
      readLock: implementation.readLock(name, options),
      writeLock: implementation.writeLock(name, options)
    }
  }

  const masterQueue = new PQueue({ concurrency: 1 })
  let readQueue: PQueue | null

  return {
    async readLock () {
      // If there's already a read queue, just add the task to it
      if (readQueue != null) {
        return await createReleaseable(readQueue, options)
      }

      // Create a new read queue
      readQueue = new PQueue({
        concurrency: options.concurrency,
        autoStart: false
      })
      const localReadQueue = readQueue

      // Add the task to the read queue
      const readPromise = createReleaseable(readQueue, options)

      void masterQueue.add(async () => {
        // Start the task only once the master queue has completed processing
        // any previous tasks
        localReadQueue.start()

        // Once all the tasks in the read queue have completed, remove it so
        // that the next read lock will occur after any write locks that were
        // started in the interim
        return await localReadQueue.onIdle()
          .then(() => {
            if (readQueue === localReadQueue) {
              readQueue = null
            }
          })
      })

      return await readPromise
    },
    async writeLock () {
      // Remove the read queue reference, so that any later read locks will be
      // added to a new queue that starts after this write lock has been
      // released
      readQueue = null

      return await createReleaseable(masterQueue, options)
    }
  }
}

const defaultOptions = {
  name: 'lock',
  concurrency: Infinity,
  timeout: 84600000,
  singleProcess: false
}

interface EventData {
  name: string
  handler: () => Promise<void>
}

export default function createMortice (options?: MorticeOptions) {
  const opts: Required<MorticeOptions> = Object.assign({}, defaultOptions, options)

  if (implementation == null) {
    implementation = impl(opts)

    if (implementation.isWorker !== true) {
      // we are master, set up worker requests
      implementation.addEventListener('requestReadLock', (event: MessageEvent<EventData>) => {
        if (mutexes[event.data.name] == null) {
          return
        }

        void mutexes[event.data.name].readLock()
          .then(async release => await event.data.handler().finally(() => release()))
      })

      implementation.addEventListener('requestWriteLock', async (event: MessageEvent<EventData>) => {
        if (mutexes[event.data.name] == null) {
          return
        }

        void mutexes[event.data.name].writeLock()
          .then(async release => await event.data.handler().finally(() => release()))
      })
    }
  }

  if (mutexes[opts.name] == null) {
    mutexes[opts.name] = createMutex(opts.name, opts)
  }

  return mutexes[opts.name]
}
