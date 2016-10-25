'use strict';

const fs = require('mz/fs');

class ChunkReader {
  constructor(options) {
    Object.assign(this, options);
    this.bytesRead   = 0;
    this.bytesToRead = 65000;

    this.bufferDelimiter = Buffer.from(options.delimiter);
    this.isFileEnd       = false;

    this.chunks     = [];
    this.readBuffer = Buffer.alloc(this.bytesToRead);
    this.buffer     = Buffer.from('');

    this.init = this.init.bind(this);
  }

  read(fd, buffer) {
    return fs.read(fd, buffer, 0, this.bytesToRead, null);
  }

  async mapper(chunk) {
    return chunk;
  }

  async next() {

    if (this.chunks.length) {
      return await this.mapper(this.chunks.shift());
    }

    if (this.isFileEnd && !this.buffer.length && !this.chunks.length) {
      await fs.close(this.fd);
      return null;
    }

    let bytesRead;

    if (!this.isFileEnd) {
      [bytesRead] = await this.read(this.fd, this.readBuffer);
    }

    if (bytesRead === 0) {
      this.isFileEnd = true;
    }

    if (bytesRead) {
      this.bytesRead += bytesRead;
      if (bytesRead === 65000) {
        this.buffer = Buffer.concat([this.buffer, this.readBuffer]);
      } else {
        this.buffer = Buffer.concat([
          this.buffer,
          this.readBuffer.slice(0, bytesRead)
        ]);
      }
    }

    let idx  = -1;
    let idxs = [];

    while (true) {
      idx = this.buffer.indexOf(this.bufferDelimiter, idx + 1);
      if (idx === -1) break;
      idxs.push(idx);
    }

    if (idxs.length <= 1 && !this.isFileEnd) {
      return await this.next();
    }

    if (idxs.length <= 1 && this.isFileEnd) {
      const current = this.buffer.slice(idxs[0], this.buffer.length - 1);
      this.buffer   = Buffer.alloc(0);
      return await this.mapper(current);
    }

    const current = this.buffer.slice(idxs[0], idxs[1]);

    for (let i = 1; i < idxs.length - 1; i++) {
      this.chunks.push(this.buffer.slice(idxs[i], idxs[i + 1]))
    }

    this.buffer = this.buffer.slice(
      idxs[idxs.length - 1],
      this.buffer.length - 1
    );

    return await this.mapper(current);

  }

  async init() {
    ({size: this.bytesTotal} = await fs.stat(this.path));
    this.fd = await fs.open(this.path, 'r');
    return this;
  }

  static async createReader(options = {}) {
    if (!options.path || typeof options.path !== 'string') {
      throw new Error('Missing path');
    }

    if (!options.delimiter || typeof options.delimiter !== 'string') {
      throw new Error('Missing delimiter');
    }

    if (options.mapper !== undefined && typeof options.mapper !== 'function') {
      throw new Error('Mapper must be a function');
    }

    const reader = new ChunkReader(options);
    await reader.init();
    return reader;
  }

}

module.exports = ChunkReader;