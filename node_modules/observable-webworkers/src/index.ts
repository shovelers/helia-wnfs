export interface WebworkerEventListener <T = any> {
  (worker: Worker, event: MessageEvent<T>): void
}

const events: Record<string, WebworkerEventListener[]> = {}

const observable = (worker: Worker & { port?: any }) => {
  worker.addEventListener('message', (event) => {
    observable.dispatchEvent('message', worker, event)
  })

  if (worker.port != null) {
    worker.port.addEventListener('message', (event: any) => {
      observable.dispatchEvent('message', worker, event)
    })
  }
}

observable.addEventListener = (type: string, fn: WebworkerEventListener) => {
  if (events[type] == null) {
    events[type] = []
  }

  events[type].push(fn)
}

observable.removeEventListener = (type: string, fn: WebworkerEventListener) => {
  if (events[type] == null) {
    return
  }

  events[type] = events[type]
    .filter(listener => listener === fn)
}

observable.dispatchEvent = function (type: string, worker: Worker, event: MessageEvent<any>) {
  if (events[type] == null) {
    return
  }

  events[type].forEach(fn => fn(worker, event))
}

export default observable
