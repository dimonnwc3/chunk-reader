# Chunk Reader

> Read chunks from AsyncIterator by delimiter and do some work async.

> This module uses async generators. Currently this feature available in Node.js >= v10.

### Install

```javascript
npm install --save chunk-reader
or
yarn add chunk-reader
```

### Usage

```javascript
const createReader = require("chunk-reader")
const fsPromses = require("fs/promises")
const fs = require("fs")

async function main() {
  const filePath = "./pathToFile"
  const delimiter = "\n"
  const { size: bytesTotal } = await fsPromses.stat(filePath)

  const stream = fs.createReadStream(filePath)

  const reader = createReader(stream, { delimiter })

  for await (const chunk of reader) {
    // do here some async stuff with cnunks
    console.log(
      `Progress: ${(stream.bytesRead / bytesTotal * 100).toFixed(2)}%`,
    )
  }
}

main()
```

### createReader(asyncIterator, [opts]) ⇒ AsyncIterator

Create a new ChunkReader instance.

| Param               | Type                       | Description                                 |
| ------------------- | -------------------------- | ------------------------------------------- |
| [asyncIterator]     | <code>AsyncIterator</code> |                                             |
| [options]           | <code>Object</code>        |                                             |
| [options.delimiter] | <code>String</code>        | Chunk delimiter (optional). EOL by default; |
