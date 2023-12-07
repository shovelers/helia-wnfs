# it-handshake <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/jacobheun/it-handshake.svg?style=flat-square)](https://codecov.io/gh/jacobheun/it-handshake)
[![CI](https://img.shields.io/github/actions/workflow/status/jacobheun/it-handshake/js-test-and-release.yml?branch=master\&style=flat-square)](https://github.com/jacobheun/it-handshake/actions/workflows/js-test-and-release.yml?query=branch%3Amaster)

> Create handshakes for binary protocols with iterable streams

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [API](#api)
  - [`handshake(duplex)`](#handshakeduplex)
  - [`shake.write(message)`](#shakewritemessage)
  - [`shake.read()`](#shakeread)
  - [`shake.rest()`](#shakerest)
  - [`shake.stream`](#shakestream)
  - [`shake.reader`](#shakereader)
  - [`shake.writer`](#shakewriter)
- [Related](#related)
- [API Docs](#api-docs)
- [License](#license)
- [Contribution](#contribution)

## Install

```console
$ npm i it-handshake
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `ItHandshake` in the global namespace.

```html
<script src="https://unpkg.com/it-handshake/dist/index.min.js"></script>
```

## API

### `handshake(duplex)`

- `duplex: DuplexIterable` A [duplex iterable stream](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it)

Returns a new handshake instance that produces [`BufferList`](https://www.npmjs.com/package/bl) objects.

### `shake.write(message)`

- `message: String|Buffer|BufferList`

### `shake.read()`

Returns the next [`BufferList`](https://www.npmjs.com/package/bl) message in the stream.

### `shake.rest()`

Ends the writer. This is necessary for continuing to pipe data through `shake.stream`

### `shake.stream`

The [duplex iterable stream](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it) to be used once the handshake is complete.

### `shake.reader`

The underyling [it-reader](https://github.com/alanshaw/it-reader) used by `shake.read()`. While direct usage of the reader is typically unnecessary, it is available for advanced usage.

### `shake.writer`

The underyling writer, [it-pushable](https://github.com/alanshaw/it-pushable), used by `shake.write()`. While direct usage of the writer is typically unnecessary, it is available for advanced usage.

## Related

- [it-reader](https://github.com/alanshaw/it-reader)
- [it-pushable](https://github.com/alanshaw/it-pushable)
- [it-pair](https://github.com/alanshaw/it-pair)
- [it-pipe](https://github.com/alanshaw/it-pipe)

## API Docs

- <https://jacobheun.github.io/it-handshake>

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
