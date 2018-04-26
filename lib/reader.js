const os = require("os")

module.exports = function createReader(stream, opts = {}) {
  opts = {
    delimiter: os.EOL,
    ...opts,
  }

  const delimiter = Buffer.from(opts.delimiter)

  async function* reader() {
    let buffer = Buffer.from("")

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])

      while (true) {
        const idx = buffer.indexOf(delimiter)
        if (idx === -1) break

        const chunk = buffer.slice(0, idx)
        buffer = buffer.slice(idx + delimiter.length)

        if (!chunk || !chunk.length) continue

        yield chunk
      }
    }

    if (buffer && buffer.length) {
      yield buffer
    }
  }

  return reader()
}
