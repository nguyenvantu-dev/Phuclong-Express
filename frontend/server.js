const Module = require('module')
const path = require('path')
const fs = require('fs')

// Patch Node.js module resolver BEFORE loading anything else.
// Windows IIS (iisnode) can set CWD to C:\Inetpub\... while the filesystem
// stores the directory as C:\inetpub\... (or vice-versa). Node.js treats
// these as different require() cache keys → two copies of React/Next.js
// context modules → "invariant expected app router to be mounted".
// realpathSync.native uses Win32 GetFinalPathNameByHandle to normalize casing.
const _origResolve = Module._resolveFilename.bind(Module)
Module._resolveFilename = function (request, parent, isMain, options) {
  const resolved = _origResolve(request, parent, isMain, options)
  if (typeof resolved === 'string' && path.isAbsolute(resolved)) {
    try {
      return fs.realpathSync.native(resolved)
    } catch {
      return resolved
    }
  }
  return resolved
}

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
// Pass canonical dir so Next.js internals use the normalized path too
const dir = (() => {
  try { return fs.realpathSync.native(process.cwd()) } catch { return process.cwd() }
})()

const app = next({ dev, dir })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:' + (process.env.PORT || 3000))
  })
})
