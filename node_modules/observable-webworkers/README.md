# observable-webworkers

[![Build Status](https://github.com/achingbrain/observable-webworkers/actions/workflows/js-test-and-release.yml/badge.svg?branch=main)](https://github.com/achingbrain/observable-webworkers/actions/workflows/js-test-and-release.yml)

> Allow you to listen to messages emitted by web workers

## Install

```sh
$ npm install --save observable-webworkers
```

## Usage

```javascript
const observe = require('observable-webworkers')

const worker = new Worker('my-worker-script.js')

observe(worker)

observe.addEventListener('message', (worker, event) => {
  console.info(event.data)
})
```
