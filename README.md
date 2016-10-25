# Chunk Reader

> Read chunks from a file by delimiter and do some work async.

> This module uses async await. Currently this feature available in Node.js v7 only with --harmony flag.

### Install

```javascript
npm install --save chunk-reader
```

### Usage

```javascript
const chunkReader = require('chunk-reader');

async function main() {

  const reader = await chunkReader.createReader({
      path     : './pathToFile',
      delimiter: 'chunkDelimiter',
      mapper   : function(data) {
        return data.toString().split('\n');
      }
   });

  let chunk;

  while ((chunk = await reader.next()) !== null) {
    // do here some sync/async stuff with cnunks/blocks
    console.log(`Progress: ${(reader.bytesRead / reader.bytesTotal * 100).toFixed(2)}%`);
  }

}

main();
```

### chunkReader

#### Methods

##### chunkReader.createReader([opts]) ⇒ ChunkReader 
Create a new ChunkReader instance.

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> |  |
| [options.path] | <code>String</code> | Path to file; |
| [options.delimiter] | <code>String</code> | Chunk delimiter; |
| [options.mapper] | <code>Function</code> | Mapper function (optional); |

### ChunkReader

#### Properties

| Param | Type | Description |
| --- | --- | --- |
| [reader.bytesRead] | <code>Number</code> | Bytes readed; |
| [reader.bytesTotal] | <code>Number</code> | File size in bytes; |

#### Methods

##### reader.next() ⇒ Buffer 

Return chunk of bytes if mapper function not specified and null on end of file.
